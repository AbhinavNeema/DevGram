const Project = require("../models/Project");
const User = require("../models/User");

exports.search = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ users: [], projects: [] });

    const regex = new RegExp(q, "i");

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }]
    })
      .select("name username bio")
      .limit(10);

    const projects = await Project.find({
      $or: [
        { title: regex },
        { description: regex },
        { techStack: { $in: [q] } }
      ]
    })
      .populate("owner", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .limit(20);

    res.json({ users, projects });
  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
