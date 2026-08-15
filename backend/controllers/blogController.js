const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");
const Interaction = require("../models/Interaction");
const User = require("../models/User");
const { generateEmbedding } = require("../utils/embedding");
const { updateUserEmbedding } = require("../utils/vector");

/* CREATE BLOG */
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      techStack = "[]",
      mentions = "[]"
    } = req.body;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and content are required" });
    }

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : JSON.parse(techStack);

    // Validate and filter tech stack against allowed tags
    const filteredTags = parsedTechStack.filter(tag =>
      ALLOWED_TAGS.includes(tag)
    );

    const parsedMentionsRaw = Array.isArray(mentions)
      ? mentions
      : JSON.parse(mentions);

    const parsedMentions = parsedMentionsRaw.map(m =>
      typeof m === "string" ? m : m._id
    );

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
${content}
${filteredTags.join(" ")}
    `.trim();

    // Create blog first, then add embedding in background
    const blog = await Blog.create({
      title: title.trim(),
      content: content.trim(),
      techStack: filteredTags,
      mentions: parsedMentions,
      images,
      author: req.userId,
      embedding: [], // Start empty
    });

    // Add embedding in background (don't block response)
    generateEmbedding(textForEmbedding)
      .then(embedding => {
        if (embedding && embedding.length > 0) {
          Blog.findByIdAndUpdate(blog._id, { embedding }).catch(err => {
            console.warn("Failed to update blog embedding:", err.message);
          });
        }
      })
      .catch(err => console.warn("Embedding generation failed:", err.message));

    const populated = await Blog.findById(blog._id)
      .populate("author", "name username");

    res.status(201).json(populated);
  } catch (err) {
    console.error("Create Blog Error:", err);
    if (err instanceof SyntaxError) {
      return res.status(400).json({ message: "Invalid JSON format" });
    }
    res.status(500).json({ message: "Server error" });
  }
};

/* GET ALL BLOGS */
exports.getBlogs = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const blogs = await Blog.find()
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await Blog.countDocuments();

    res.json({ blogs, total, limit: parseInt(limit), offset: parseInt(offset) });
  } catch (err) {
    console.error("Get Blogs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET BLOGS BY USER */
exports.getBlogsByUser = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const blogs = await Blog.find({ author: req.params.id })
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 })
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    res.json(blogs);
  } catch (err) {
    console.error("Get Blogs By User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET BLOG BY ID */
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username");

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (err) {
    console.error("Get blog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD VIEW */
exports.addView = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

    const alreadyViewed = blog.viewedBy.some(
      v => v.user.toString() === req.userId && v.date === today
    );

    if (!alreadyViewed) {
      blog.views += 1;
      blog.viewedBy.push({
        user: req.userId,
        date: today,
      });
      await blog.save();

      // Track view interaction safely (no duplicates)
      await Interaction.updateOne(
        {
          user: req.userId,
          contentId: blog._id,
          contentType: "Blog",
          action: "view",
        },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      // Update user interest embedding
      const user = await User.findById(req.userId);
      if (user && blog.embedding?.length > 0) {
        const updatedEmbedding = updateUserEmbedding(
          user.embedding,
          blog.embedding,
          0.5 // view weight
        );
        user.embedding = updatedEmbedding;
        await user.save();
      }
    }

    res.json({ views: blog.views });
  } catch (err) {
    console.error("Add View Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* LIKE BLOG */
exports.likeBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const hasLiked = blog.likes.includes(req.userId);

    if (hasLiked) {
      blog.likes.pull(req.userId);
      await blog.save();

      // Remove like interaction on unlike
      await Interaction.deleteOne({
        user: req.userId,
        contentId: blog._id,
        contentType: "Blog",
        action: "like",
      });

      return res.json({
        liked: false,
        likesCount: blog.likes.length,
      });
    }

    // Add like
    blog.likes.push(req.userId);
    await blog.save();

    // Track like interaction
    await Interaction.updateOne(
      {
        user: req.userId,
        contentId: blog._id,
        contentType: "Blog",
        action: "like",
      },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Update user embedding
    const user = await User.findById(req.userId);
    if (user && blog.embedding?.length > 0) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        blog.embedding,
        2 // like weight
      );
      user.embedding = updatedEmbedding;
      await user.save();
    }

    res.json({
      liked: true,
      likesCount: blog.likes.length,
    });
  } catch (err) {
    console.error("Like Blog Error:", err);
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

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const newComment = {
      text: text.trim(),
      author: req.userId,
      mentions: mentions.filter(Boolean),
    };

    blog.comments.push(newComment);
    await blog.save();

    // Track comment interaction
    await Interaction.updateOne(
      {
        user: req.userId,
        contentId: blog._id,
        contentType: "Blog",
        action: "comment",
      },
      { $setOnInsert: { createdAt: new Date() } },
      { upsert: true }
    );

    // Update user embedding
    const user = await User.findById(req.userId);
    if (user && blog.embedding?.length > 0) {
      const updatedEmbedding = updateUserEmbedding(
        user.embedding,
        blog.embedding,
        3 // comment weight
      );
      user.embedding = updatedEmbedding;
      await user.save();
    }

    const populated = await Blog.findById(blog._id)
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username");

    res.json(populated.comments.at(-1));
  } catch (err) {
    console.error("Add Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE COMMENT */
exports.deleteComment = async (req, res) => {
  try {
    const { blogId, commentId } = req.params;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const comment = blog.comments.id(commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Only author can delete
    if (comment.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    comment.deleteOne();
    await blog.save();

    res.json({ message: "Comment deleted", commentId });
  } catch (err) {
    console.error("Delete Comment Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE BLOG */
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only author can update
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const { title, content, techStack } = req.body;

    if (title) blog.title = title.trim();
    if (content) blog.content = content.trim();
    if (techStack) {
      blog.techStack = techStack.filter(tag => ALLOWED_TAGS.includes(tag));
    }

    await blog.save();

    const updated = await Blog.findById(blog._id)
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("mentions", "username");

    res.json(updated);
  } catch (err) {
    console.error("Update Blog Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE BLOG */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    // Only author can delete
    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete images from Cloudinary
    for (const img of blog.images) {
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
      contentId: blog._id,
      contentType: "Blog",
    });

    await blog.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("Delete Blog Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};