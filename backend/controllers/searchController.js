const Project = require("../models/Project");
const User = require("../models/User");

exports.search = async (req, res) => {
  try {
    const {q} = req.query;
    if (!q) return res.json({ users: [], projects: [] });

    const regex = new RegExp(q, "i");

    const users = await User.find({
      $or: [
        { name: regex },
        { username: regex }
      ]
    }).select("name username");

    const projects = await Project.find({
      $or: [
        { title: regex },
        { description: regex },
        { techStack: regex }
      ]
    })
      .populate("owner", "name username")
      .sort({ createdAt: -1 });

    res.json({ users, projects });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};