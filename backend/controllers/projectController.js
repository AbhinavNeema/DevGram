const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");
const User = require("../models/User");
const Interaction = require("../models/Interaction");
const { generateEmbedding } = require("../utils/embedding");
const { updateUserEmbedding } = require("../utils/vector");

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

    // 🔥 Generate semantic embedding
    const textForEmbedding = `
${title}
${description}
${techStack.join(" ")}
    `;

    const embedding = await generateEmbedding(textForEmbedding);

    const project = await Project.create({
      title,
      description,
      techStack,
      githubLink,
      liveDemoLink,
      images,
      owner: req.userId,
      mentions: parsedMentions,
      embedding,
    });

    res.status(201).json(project);
  } catch (err) {
    console.error("Create Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjects = async (req, res) => {
  try {
    const { tag } = req.query;

    const query = {};

    // 🔥 FILTER LOGIC
    if (tag) {
      query.techStack = tag;
    }

    const projects = await Project.find(query)
      .select("-embedding")
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(projects);
  } catch (err) {
    console.error("Get Projects Error:", err);
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

    const hasLiked = project.likes.some((id) => id.toString() === userId);

    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    );

    // Handle interaction safely (no duplicates)
    if (!hasLiked) {
      await Interaction.updateOne(
        {
          user: userId,
          contentId: projectId,
          contentType: "Project",
          action: "like",
        },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      const user = await User.findById(userId);
      if (user && project.embedding?.length) {
        const updatedEmbedding = updateUserEmbedding(
          user.embedding,
          project.embedding,
          2 // like weight
        );
        user.embedding = updatedEmbedding;
        await user.save();
      }
    } else {
      await Interaction.deleteOne({
        user: userId,
        contentId: projectId,
        contentType: "Project",
        action: "like",
      });
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
      mentions,
    });

    await project.save();

    await Interaction.updateOne(
      {
        user: req.userId,
        contentId: project._id,
        contentType: "Project",
        action: "comment",
      },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    const user = await User.findById(req.userId);
    if (user && project.embedding?.length) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        project.embedding,
        3 // comment weight
      );
      user.embedding = updatedEmbedding;
      await user.save();
    }

    const updated = await Project.findById(project._id)
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username");

    res.json(updated.comments.at(-1));
  } catch (err) {
    console.error("Add Comment Error:", err);
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

    const isOwner = project.owner && project.owner.toString() === req.userId;
    const isAuthor = comment.author && comment.author.toString() === req.userId;

    if (!isOwner && !isAuthor) {
      return res.status(403).json({ message: "Not allowed" });
    }

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

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const titleChanged = req.body.title !== undefined && req.body.title !== project.title;
    const descChanged =
      req.body.description !== undefined && req.body.description !== project.description;
    const techStackChanged = req.body.techStack !== undefined;

    project.title = req.body.title ?? project.title;
    project.description = req.body.description ?? project.description;
    project.githubLink = req.body.githubLink ?? project.githubLink;
    project.liveDemoLink = req.body.liveDemoLink ?? project.liveDemoLink;

    if (req.body.mentions) {
      project.mentions = req.body.mentions;
    }

    if (req.body.techStack) {
      let ts = req.body.techStack;
      if (typeof ts === "string") {
        try {
          ts = JSON.parse(ts);
        } catch {
          ts = ts.split(",").map((t) => t.trim());
        }
      }
      project.techStack = ts.filter((tag) => ALLOWED_TAGS.includes(tag));
    }

    await project.save();

    if (titleChanged || descChanged || techStackChanged) {
      try {
        const textForEmbedding = `\n${project.title}\n${project.description}\n${(
          project.techStack || []
        ).join(" ")}\n`;
        project.embedding = await generateEmbedding(textForEmbedding);
        await project.save();
      } catch (embErr) {
        console.error("Failed to regenerate project embedding:", embErr);
      }
    }

    const updated = await Project.findById(project._id)
      .select("-embedding")
      .populate("owner", "name username")
      .populate("mentions", "username");

    res.json(updated);
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

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
    const projectId = req.params.id;

    const result = await Project.updateOne(
      { _id: projectId, viewedBy: { $ne: userId } },
      { $inc: { views: 1 }, $addToSet: { viewedBy: userId } }
    );

    if (result.modifiedCount > 0) {
      await Interaction.updateOne(
        {
          user: userId,
          contentId: projectId,
          contentType: "Project",
          action: "view",
        },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      const project = await Project.findById(projectId).select("embedding");
      const user = await User.findById(userId);
      if (user && project && project.embedding?.length) {
        const updatedEmbedding = updateUserEmbedding(
          user.embedding,
          project.embedding,
          0.5
        );
        await User.findByIdAndUpdate(userId, {
          embedding: updatedEmbedding,
        });
      }
    }

    const currentProject = await Project.findById(projectId).select("views");
    res.json({ views: currentProject ? currentProject.views : 0 });
  } catch (err) {
    console.error("Add View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .select("-embedding")
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username");

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
    const RECENT_LIMIT = 500;

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack images githubLink liveDemoLink owner createdAt likes views comments")
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .lean();

    if (!projects.length) {
      return res.json([]);
    }

    const scoreProject = (project) => {
      const likes = project.likes?.length || 0;
      const comments = project.comments?.length || 0;
      const views = project.views || 0;

      const engagementScore = likes * 2 + comments * 3 + views * 0.2;

      const ageHours = (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 48);

      return 0.7 * engagementScore + 0.3 * recencyScore;
    };

    const ranked = projects
      .map((p) => ({
        ...p,
        score: scoreProject(p),
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    res.json(ranked);
  } catch (error) {
    console.error("Trending Error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getPersonalizedFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const followingIds = (user.following || []).map((id) => id.toString());

    const limit = Number(req.query.limit || 20);
    const cursor = Number(req.query.cursor || 0);

    const RECENT_LIMIT = 500;

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack images githubLink liveDemoLink owner createdAt likes views comments")
      .populate("owner", "name username")
      .lean();

    const scoreProject = (project) => {
      const ageHours = (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 72);

      const likes = project.likes?.length || 0;
      const comments = project.comments?.length || 0;
      const views = project.views || 0;
      const engagementScore = likes * 2 + comments * 3 + views * 0.2;

      const followBoost = followingIds.includes(project.owner?._id?.toString()) ? 5 : 0;

      return 0.15 * recencyScore + 0.15 * engagementScore + 0.1 * followBoost;
    };

    let ranked = projects
      .map((p) => ({
        ...p,
        feedType: "project",
        score: scoreProject(p),
      }))
      .sort((a, b) => b.score - a.score);

    const trending = [...ranked]
      .sort(
        (a, b) =>
          (b.likes?.length || 0) +
          (b.views || 0) -
          ((a.likes?.length || 0) + (a.views || 0))
      )
      .slice(0, 5);

    const topPersonalized = ranked.slice(0, 15);
    const mixedFeed = [...topPersonalized, ...trending];

    const uniqueFeed = Array.from(
      new Map(mixedFeed.map((item) => [item._id.toString(), item])).values()
    );

    const paginated = uniqueFeed.slice(cursor, cursor + limit);

    res.json({
      cursor: cursor + limit,
      hasMore: cursor + limit < uniqueFeed.length,
      data: paginated,
    });
  } catch (err) {
    console.error("Personalized Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};