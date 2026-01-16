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

    const isFollowing = targetUser.followers.includes(currentUserId);

    if (isFollowing) {
      await User.findByIdAndUpdate(targetUserId, {
        $pull: { followers: currentUserId },
      });

      await User.findByIdAndUpdate(currentUserId, {
        $pull: { following: targetUserId },
      });
    } else {
      await User.findByIdAndUpdate(targetUserId, {
        $addToSet: { followers: currentUserId },
      });

      await User.findByIdAndUpdate(currentUserId, {
        $addToSet: { following: targetUserId },
      });
    }

    const updatedUser = await User.findById(targetUserId).select("followers");

    res.json({
      following: !isFollowing,
      followers: updatedUser.followers,
      followersCount: updatedUser.followers.length,
    });
  } catch (err) {
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
      .select("-password")
      .populate("followers", "name")
      .populate("following", "name");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ owner: userId })
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });
      

    const blogs = await Blog.find({ author: userId })
      .populate("author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json({
      user,
      projects,
      blogs,
      followersCount: user.followers.length,
      followingCount: user.following.length
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

    const { bio, about, techStack } = req.body;

    const user = await User.findByIdAndUpdate(
      userId,
      { bio, about, techStack },
      { new: true }
    ).select("-password");

    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } })
      .select("-password")
      .sort({ createdAt: -1 });

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserByUsername = async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const projects = await Project.find({ owner: user._id }).populate(
      "owner",
      "name username"
    );

    res.json({ user, projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};