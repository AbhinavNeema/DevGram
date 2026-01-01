const Comment = require("../models/Comment");
const Project = require("../models/Project");
const mongoose = require("mongoose");

exports.createComment = async (req, res) => {
  try {
    const { text } = req.body;
    const { projectId } = req.params;

    if (!text) {
      return res.status(400).json({ message: "Text required" });
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const comment = await Comment.create({
      text,
      author: req.userId,
      project: projectId,
    });

    res.status(201).json(comment);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getComments = async (req, res) => {
  try {
    const { projectId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const comments = await Comment.find({ project: projectId })
      .populate("author", "name username")
      .sort({ createdAt: 1 });

    res.json(comments);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};
