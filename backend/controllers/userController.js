const User = require("../models/User");
const Project = require("../models/Project");
const mongoose = require("mongoose");
const Blog = require("../models/Blog");

/* TOGGLE FOLLOW */
exports.toggleFollow = async (req, res) => {
  try {
    const targetUserId = req.params.id;
    const currentUserId = req.userId;

    if (targetUserId === currentUserId) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(targetUserId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      // Unfollow
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      });
      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      });
    } else {
      // Follow
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
      });
      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
      });
    }

    const updatedUser = await User.findById(targetUserId)
      .select("followers")
      .lean();

    res.json({
      following: !isFollowing,
      followers: updatedUser.followers,
      followersCount: updatedUser.followers.length,
    });
  } catch (err) {
    console.error("Toggle follow error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET USER PROFILE */
exports.getUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const user = await User.findById(userId)
      .select("-password")
      .populate("followers", "name username profilePhoto")
      .populate("following", "name username profilePhoto");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Fetch user's projects and blogs with pagination
    const { limit = 20, offset = 0 } = req.query;

    const projects = await Project.find({ owner: userId })
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const blogs = await Blog.find({ author: userId })
      .populate("author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json({
      user,
      projects,
      blogs,
      followersCount: user.followers?.length || 0,
      followingCount: user.following?.length || 0,
    });
  } catch (err) {
    console.error("Get profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE USER PROFILE */
exports.updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    // Only user can update their own profile
    if (req.userId !== userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }

    const { bio, about, techStack } = req.body;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Update fields
    if (bio !== undefined) user.bio = String(bio).substring(0, 500);
    if (about !== undefined) user.about = String(about).substring(0, 2000);
    if (techStack !== undefined) {
      const parsed = Array.isArray(techStack)
        ? techStack
        : JSON.parse(techStack || "[]");
      user.techStack = parsed.map(t => String(t).trim()).filter(Boolean);
    }

    // Profile photo upload
    if (req.file && req.file.path) {
      // Delete old photo if exists
      if (user.profilePhoto) {
        // Optionally clean up old photo from cloud
      }
      user.profilePhoto = req.file.path;
    }

    await user.save();

    const updated = await User.findById(userId).select("-password");
    res.json(updated);
  } catch (err) {
    console.error("Update profile error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET ALL USERS (with pagination) */
exports.getAllUsers = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const users = await User.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await User.countDocuments({ _id: { $ne: req.userId } });

    res.json({
      users,
      total,
      limit: parseInt(limit),
      offset: parseInt(offset),
    });
  } catch (err) {
    console.error("Get all users error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET USER BY USERNAME */
exports.getUserByUsername = async (req, res) => {
  try {
    const { username } = req.params;

    const user = await User.findOne({ username: username.toLowerCase() })
      .select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ owner: user._id })
      .populate("owner", "name username")
      .limit(10);

    res.json({ user, projects });
  } catch (err) {
    console.error("Get user by username error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* SEARCH USERS */
exports.searchUsers = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const { limit = 10 } = req.query;

    if (!q || q.length < 2) {
      return res.json([]);
    }

    const currentUserId = req.userId;

    // Escape regex special characters for security
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

    // Prefix match (higher priority)
    const prefixRegex = new RegExp(`^${safeQuery}`, "i");

    const prefixMatches = await User.find({
      _id: { $ne: currentUserId },
      $or: [
        { username: prefixRegex },
        { name: prefixRegex },
      ],
    })
      .select("name username bio profilePhoto")
      .limit(parseInt(limit))
      .lean();

    // Partial match (fallback, excluding prefix matches)
    const prefixIds = new Set(prefixMatches.map(u => u._id.toString()));
    const partialRegex = new RegExp(safeQuery, "i");

    const partialMatches = await User.find({
      _id: { $ne: currentUserId, $nin: Array.from(prefixIds) },
      $or: [
        { username: partialRegex },
        { name: partialRegex },
      ],
    })
      .select("name username bio profilePhoto")
      .limit(parseInt(limit))
      .lean();

    // Combine results (prefix first, then partial)
    const combined = [...prefixMatches, ...partialMatches].slice(0, parseInt(limit));

    res.json(combined);
  } catch (err) {
    console.error("User search error:", err);
    res.status(500).json({ message: "Server error" });
  }
};