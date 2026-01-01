const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");

exports.createProject = async (req, res) => {
  try {
    const { title, description, githubLink, liveDemoLink } = req.body;

    const techStack = JSON.parse(req.body.techStack || "[]");

    const filteredTags = techStack.filter(tag =>
      ALLOWED_TAGS.includes(tag)
    );

    const images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          public_id: file.filename
        });
      }
    }

    const project = await Project.create({
      title,
      description,
      techStack: filteredTags,
      githubLink,
      liveDemoLink,
      images,
      owner: req.userId,
      views: 0,
      viewedBy: [],
    });

    res.status(201).json(project);
  } catch (error) {
    console.error("Create Project Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { tag } = req.query;

    const filter = tag ? { techStack: tag } : {};

    const projects = await Project.find(filter)
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (error) {
    console.error("Get Projects Error:", error);
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
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.comments.push({
      text: req.body.text,
      author: req.userId,
    });

    await project.save();
    await project.populate("comments.author", "name username");

    res.status(201).json(project.comments.at(-1));
  } catch (error) {
    console.error("Add Comment Error:", error);
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

    if (req.body.techStack) {
      project.techStack = req.body.techStack.filter(tag =>
        ALLOWED_TAGS.includes(tag)
      );
    }

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.githubLink = req.body.githubLink ?? project.githubLink;
    project.liveDemoLink = req.body.liveDemoLink ?? project.liveDemoLink;

    await project.save();
    res.json(project);
  } catch (err) {
    console.error("Update Project Error:", err);
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
      .populate("owner", "name")
      .populate("comments.author", "name");

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