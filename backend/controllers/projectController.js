const Project = require("../models/Project");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");
const User = require("../models/User");
const Interaction = require("../models/Interaction");
const { generateEmbedding } = require("../utils/embedding");
const { updateUserEmbedding, cosineSimilarity } = require("../utils/vector");

/* CREATE PROJECT */
exports.createProject = async (req, res) => {
  try {
    const {
      title,
      description,
      githubLink,
      liveDemoLink,
      mentions = "[]"
    } = req.body;

    if (!title || !title.trim()) {
      return res.status(400).json({ message: "Title is required" });
    }

    const techStack = Array.isArray(req.body.techStack)
      ? req.body.techStack
      : JSON.parse(req.body.techStack || "[]");

    // Filter against allowed tags
    const filteredTags = techStack.filter(tag => ALLOWED_TAGS.includes(tag));

    const parsedMentions = Array.isArray(mentions)
      ? mentions
      : JSON.parse(mentions);

    const images = [];

    if (req.files?.length) {
      for (const file of req.files) {
        images.push({
          url: file.path,
          public_id: file.filename,
        });
      }
    }

    // Generate semantic embedding (non-blocking)
    const textForEmbedding = `
${title}
${description || ""}
${filteredTags.join(" ")}
    `.trim();

    // Create project first, then add embedding in background
    const project = await Project.create({
      title: title.trim(),
      description: description?.trim() || "",
      techStack: filteredTags,
      githubLink: githubLink?.trim() || "",
      liveDemoLink: liveDemoLink?.trim() || "",
      images,
      owner: req.userId,
      mentions: parsedMentions,
      embedding: [], // Start empty
    });

    // Add embedding in background (don't block response)
    generateEmbedding(textForEmbedding)
      .then(embedding => {
        if (embedding && embedding.length > 0) {
          Project.findByIdAndUpdate(project._id, { embedding }).catch(err => {
            console.warn("Failed to update project embedding:", err.message);
          });
        }
      })
      .catch(err => console.warn("Embedding generation failed:", err.message));

    const populated = await Project.findById(project._id)
      .populate("owner", "name username");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Project Error:", err);
    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid JSON format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/* GET PROJECTS (with pagination and filtering) */
exports.getProjects = async (req, res) => {
  try {
    const { tag, limit = 50, offset = 0 } = req.query;

    const query = {};

    if (tag) {
      query.techStack = tag;
    }

    const projects = await Project.find(query)
      .populate("owner", "name username profilePhoto")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Project.countDocuments(query);

    res.json({ projects, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error("Get Projects Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET PROJECT BY ID */
exports.getProjectById = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
      .populate("owner", "name username profilePhoto")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username");

    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  } catch (err) {
    console.error("Get Project By ID Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* LIKE PROJECT */
exports.likeProject = async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    const hasLiked = project.likes.includes(userId);

    if (hasLiked) {
      // Unlike
      project.likes.pull(userId);
      await project.save();

      // Remove like interaction
      await Interaction.deleteOne({
        user: userId,
        contentId: projectId,
        contentType: "Project",
        action: "like",
      });

      return res.json({
        liked: false,
        likesCount: project.likes.length,
      });
    }

    // Like
    project.likes.push(userId);
    await project.save();

    // Track interaction
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

    // Update user embedding
    const user = await User.findById(userId);
    if (user && project.embedding?.length > 0) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        project.embedding,
        2 // like weight
      );
      user.embedding = updatedEmbedding;
      await user.save();
    }

    res.json({
      liked: true,
      likesCount: project.likes.length,
    });
  } catch (err) {
    console.error("Like Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD VIEW */
exports.addView = async (req, res) => {
  try {
    const userId = req.userId;
    const projectId = req.params.id;

    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    // Prevent duplicate views
    if (project.viewedBy.includes(userId)) {
      return res.json({ views: project.views });
    }

    // Atomic update
    const updatedProject = await Project.findByIdAndUpdate(
      projectId,
      {
        $inc: { views: 1 },
        $push: { viewedBy: userId },
      },
      { new: true }
    );

    // Track interaction
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

    // Update user embedding
    const user = await User.findById(userId);
    if (user && project.embedding?.length > 0) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        project.embedding,
        0.5
      );
      await User.findByIdAndUpdate(userId, { embedding: updatedEmbedding });
    }

    res.json({ views: updatedProject.views });
  } catch (err) {
    console.error("Add View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD COMMENT */
exports.addComment = async (req, res) => {
  try {
    const { text, mentions = [] } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    project.comments.push({
      text: text.trim(),
      author: req.userId,
      mentions: mentions.filter(Boolean),
    });

    await project.save();

    // Track interaction
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

    // Update user embedding
    const user = await User.findById(req.userId);
    if (user && project.embedding?.length > 0) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        project.embedding,
        3
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

/* DELETE COMMENT */
exports.deleteComment = async (req, res) => {
  try {
    const { projectId, commentId } = req.params;

    const project = await Project.findById(projectId);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const comment = project.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author can delete
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await project.save();

    res.json({ message: "Comment deleted", commentId });
  } catch (err) {
    console.error("Delete Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE PROJECT */
exports.updateProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only owner can update
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, description, githubLink, liveDemoLink, mentions, techStack } = req.body;

    if (title) project.title = title.trim();
    if (description !== undefined) project.description = description.trim();
    if (githubLink !== undefined) project.githubLink = githubLink?.trim() || "";
    if (liveDemoLink !== undefined) project.liveDemoLink = liveDemoLink?.trim() || "";
    if (mentions) project.mentions = mentions;
    if (techStack) {
      project.techStack = techStack.filter(tag => ALLOWED_TAGS.includes(tag));
    }

    await project.save();

    const updated = await Project.findById(project._id)
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("mentions", "username");

    res.json(updated);
  } catch (err) {
    console.error("Update Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE PROJECT */
exports.deleteProject = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) return res.status(404).json({ message: "Project not found" });

    // Only owner can delete
    if (project.owner.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete images from Cloudinary
    for (const img of project.images) {
      if (img.public_id) {
        try {
          await cloudinary.uploader.destroy(img.public_id);
        } catch (err) {
          console.warn("Cloudinary delete failed:", err.message);
        }
      }
    }

    // Delete related interactions
    await Interaction.deleteMany({
      contentId: project._id,
      contentType: "Project",
    });

    await project.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Project Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET TRENDING PROJECTS */
exports.getTrendingProjects = async (req, res) => {
  try {
    const userId = req.userId;
    const productionMode = process.env.FEED_SEEN_MODE === "true";

    let filter = {};

    if (productionMode) {
      filter.seenBy = { $ne: userId };
    }

    const RECENT_LIMIT = 200;

    const projects = await Project.find(filter)
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description owner createdAt likes views comments embedding techStack")
      .populate("owner", "name username profilePhoto")
      .lean();

    if (!projects.length) {
      return res.json([]);
    }

    const scoreProject = (project) => {
      const likes = project.likes?.length || 0;
      const comments = project.comments?.length || 0;
      const views = project.views || 0;

      // Engagement (weighted)
      const engagementScore = likes * 2 + comments * 3 + views * 0.1;

      // Recency decay (half-life ~48h)
      const ageHours = (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 48);

      // Final trending score
      return 0.7 * engagementScore + 0.3 * recencyScore;
    };

    const ranked = projects
      .map(p => ({ ...p, score: scoreProject(p) }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);

    // Mark as seen in production
    if (productionMode && ranked.length > 0) {
      const projectIds = ranked.map(p => p._id);
      Project.updateMany(
        { _id: { $in: projectIds } },
        { $addToSet: { seenBy: userId } }
      ).catch(err => console.warn("Trending seen update error:", err.message));
    }

    res.json(ranked);
  } catch (err) {
    console.error("Trending Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET PERSONALIZED FEED (projects only) */
exports.getPersonalizedFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmbedding = user.embedding || [];
    const followingIds = (user.following || []).map(id => id.toString());

    const limit = Math.min(Number(req.query.limit || 20), 50);
    const cursor = Number(req.query.cursor || 0);

    const RECENT_LIMIT = 200;

    const projects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack owner createdAt likes views comments embedding")
      .populate("owner", "name username profilePhoto")
      .lean();

    const scoreProject = (project) => {
      // Semantic similarity
      let similarity = 0;
      if (userEmbedding.length > 0 && project.embedding?.length > 0) {
        similarity = cosineSimilarity(userEmbedding, project.embedding);
      }

      // Recency decay
      const ageHours = (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 72);

      // Engagement score
      const likes = project.likes?.length || 0;
      const comments = project.comments?.length || 0;
      const views = project.views || 0;
      const engagementScore = likes * 2 + comments * 3 + views * 0.1;

      // Follow boost
      const followBoost = followingIds.includes(project.owner?._id?.toString()) ? 5 : 0;

      return 0.5 * similarity + 0.2 * recencyScore + 0.2 * engagementScore + 0.1 * followBoost;
    };

    let ranked = projects
      .map(p => ({ ...p, feedType: "project", score: scoreProject(p) }))
      .sort((a, b) => b.score - a.score);

    // Add trending diversity
    const trending = [...ranked]
      .sort((a, b) =>
        ((b.likes?.length || 0) + (b.views || 0)) -
        ((a.likes?.length || 0) + (a.views || 0))
      )
      .slice(0, 5);

    const topPersonalized = ranked.slice(0, 15);
    const mixedFeed = [...topPersonalized, ...trending];

    // Deduplicate
    const uniqueFeed = Array.from(
      new Map(mixedFeed.map(item => [item._id.toString(), item])).values()
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