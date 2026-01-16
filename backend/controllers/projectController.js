const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");
const User = require("../models/User");

exports.createProject = async (req, res) => {
  try {
    const { title, description, githubLink, liveDemoLink, mentions = "[]" } = req.body;

    const techStack = JSON.parse(req.body.techStack || "[]");
    const parsedMentions = JSON.parse(mentions);

    const images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          public_id: file.filename,
        });
      }
    }
    
    const project = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      liveDemoLink,
      images,
      owner: req.userId,
      mentions: parsedMentions,
    });

    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const projects = await Project.find()
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};

exports.likeProject = async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hasLiked = project.likes.includes(userId);

    let updatedProject;

    if (hasLiked) {
      updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $pull: { likes: userId } },
        { new: true }
      );
    } else {
      updatedProject = await Project.findByIdAndUpdate(
        projectId,
        { $addToSet: { likes: userId } },
        { new: true }
      );
    }

    res.json({
      liked: !hasLiked,
      likesCount: updatedProject.likes.length,
    });
  } catch (err) {
    console.error("Like Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addComment = async (req, res) => {
  try {
    const { text, mentions = [] } = req.body;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.comments.push({
      text,
      author: req.userId,
      mentions
    });

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username");

    res.json(updated.comments.at(-1));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const comment = project.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    if (comment.author.toString() !== req.userId)
      return res.status(403).json({ message: "Not allowed" });

    comment.deleteOne();
    await project.save();

    res.json({ message: "Comment deleted", commentId });
  } catch (error) {
    console.error("Delete Comment Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.githubLink = req.body.githubLink ?? project.githubLink;
    project.liveDemoLink = req.body.liveDemoLink ?? project.liveDemoLink;

    if (req.body.mentions) {
      project.mentions = req.body.mentions;
    }

    if (req.body.techStack) {
      project.techStack = req.body.techStack.filter(tag =>
        ALLOWED_TAGS.includes(tag)
      );
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("owner", "name username")
      .populate("mentions", "username");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
};
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.userId)
      return res.status(403).json({ message: "Not authorized" });

    for (const img of project.images) {
      if (img.public_id) {
        await cloudinary.uploader.destroy(img.public_id);
      }
    }

    await project.deleteOne();
    res.json({ message: "Project deleted" });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addView = async (req, res) => {
  try {
    const userId = req.userId;

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.viewedBy.includes(userId)) {
      return res.json({ views: project.views });
    }

    project.views += 1;
    project.viewedBy.push(userId);

    await project.save();
    res.json({ views: project.views });
  } catch (err) {
    console.error("Add View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (error) {
    console.error("Get Project By ID Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getTrendingProjects = async (req, res) => {
  try {
    const userId = req.userId;

    const projects = await Project.find({
      seenBy: { $ne: userId }
    })
      .sort({
        views: -1,
        likes: -1,
        createdAt: -1
      })
      .limit(10)
      .populate("owner", "name username")
      .populate("comments.author", "name username");

    if (projects.length === 0) {
      return res.json([]);
    }

    const projectIds = projects.map(p => p._id);

    await Project.updateMany(
      { _id: { $in: projectIds } },
      { $addToSet: { seenBy: userId } }
    );

    res.json(projects);
  } catch (error) {
    console.error("Trending Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const userId = req.userId;

    let projects = await Project.find({
      seenBy: { $ne: userId }
    })
      .sort({ createdAt: -1 })
      .limit(20)
      .populate("owner", "name username");

    let fallback = false;

    if (projects.length === 0) {
      fallback = true;

      projects = await Project.find({
        seenBy: { $ne: userId }
      })
        .sort({ views: -1, likes: -1 })
        .limit(10)
        .populate("owner", "name username");
    }

    if (projects.length === 0) {
      return res.json([]);
    }

    const projectIds = projects.map(p => p._id);

    await Project.updateMany(
      { _id: { $in: projectIds } },
      { $addToSet: { seenBy: userId } }
    );

    res.json(projects);
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};