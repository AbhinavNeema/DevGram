const User = require("../models/User");
const Project = require("../models/Project");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.some(
      (id) => id.toString() === currentUserId
    );

    if (isFollowing) {
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      });

      try {
        await User.findByIdAndUpdate(currentUserId, {
          $pull: { following: targetUserId },
        });
      } catch (err) {
        // Revert first update if second fails
        await User.findByIdAndUpdate(targetUserId, {
          $addToSet: { followers: currentUserId },
        });
        throw err;
      }
    } else {
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
      });

      try {
        await User.findByIdAndUpdate(currentUserId, {
          $addToSet: { following: targetUserId },
        });
      } catch (err) {
        // Revert first update if second fails
        await User.findByIdAndUpdate(targetUserId, {
          $pull: { followers: currentUserId },
        });
        throw err;
      }
    }

    const updatedUser = await User.findById(targetUserId).select("followers");

    res.json({
      following: !isFollowing,
      followers: updatedUser.followers,
      followersCount: updatedUser.followers.length,
    });
  } catch (err) {
    console.error("toggleFollow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .select("-password -embedding")
      .populate("followers", "name")
      .populate("following", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ owner: userId })
      .select("-embedding")
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    const blogs = await Blog.find({ author: userId })
      .select("-embedding")
      .populate("author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json({
      user,
      projects,
      blogs,
      followersCount: user.followers.length,
      followingCount: user.following.length,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (req.userId !== userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const { name, bio, about } = req.body;

    if (name !== undefined) user.name = name;
    if (bio !== undefined) user.bio = bio;
    if (about !== undefined) user.about = about;

    if (req.body.techStack !== undefined) {
      let techStack = req.body.techStack;
      if (typeof techStack === "string") {
        try {
          techStack = JSON.parse(techStack);
        } catch {
          techStack = techStack.split(",").map((t) => t.trim());
        }
      }
      if (Array.isArray(techStack)) {
        user.techStack = techStack;
      }
    }

    // ✅ PROFILE PHOTO
    if (req.file) {
      user.profilePhoto = req.file.path;
    }

    await user.save();

    res.json(user);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("-password -embedding")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password -embedding"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ owner: user._id })
      .select("-embedding")
      .populate("owner", "name username");

    res.json({ user, projects });
  } catch (err) {
    console.error("getUserByUsername error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const currentUserId = req.userId;

    // Escape regex special characters
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // 1️⃣ Prefix match (higher priority)
    const prefixRegex = new RegExp(`^${safeQuery}`, "i");

    const prefixMatches = await User.find({
      _id: { $ne: currentUserId },
      $or: [{ username: prefixRegex }, { name: prefixRegex }],
    })
      .select("name username bio profilePhoto")
      .limit(6)
      .lean();

    // 2️⃣ Partial match (fallback)
    const partialRegex = new RegExp(safeQuery, "i");

    const partialMatches = await User.find({
      _id: { $ne: currentUserId },
      $or: [{ username: partialRegex }, { name: partialRegex }],
    })
      .select("name username bio profilePhoto")
      .limit(10)
      .lean();

    // 3️⃣ Remove duplicates (prefix first)
    const combined = [
      ...prefixMatches,
      ...partialMatches.filter(
        (p) => !prefixMatches.find((x) => x._id.toString() === p._id.toString())
      ),
    ];

    res.json(combined.slice(0, 10));
  } catch (err) {
    console.error("User Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};