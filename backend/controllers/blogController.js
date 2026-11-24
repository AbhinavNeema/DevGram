const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");
const Interaction = require("../models/Interaction");
const User = require("../models/User");
const { generateEmbedding } = require("../utils/embedding");
const { updateUserEmbedding } = require("../utils/vector");

exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      techStack = "[]",
      mentions = "[]",
    } = req.body;

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : JSON.parse(techStack);

    const parsedMentionsRaw = Array.isArray(mentions)
      ? mentions
      : JSON.parse(mentions);

    const parsedMentions = parsedMentionsRaw.map((m) =>
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

    // 🔥 Generate semantic embedding
    const textForEmbedding = `
${title}
${content}
${parsedTechStack.join(" ")}
    `;

    const embedding = await generateEmbedding(textForEmbedding);

    const blog = await Blog.create({
      title,
      content,
      techStack: parsedTechStack,
      mentions: parsedMentions,
      images,
      author: req.userId,
      embedding,
    });

    res.status(201).json(blog);
  } catch (err) {
    console.error("Create Blog Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogs = async (req, res) => {
  try {
    const blogs = await Blog.find()
      .select("-embedding")
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error("getBlogs error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.addView = async (req, res) => {
  try {
    const userId = req.userId;
    const blogId = req.params.id;
    const today = new Date().toISOString().slice(0, 10);

    const result = await Blog.updateOne(
      {
        _id: blogId,
        viewedBy: {
          $not: {
            $elemMatch: {
              user: userId,
              date: today,
            },
          },
        },
      },
      {
        $inc: { views: 1 },
        $push: { viewedBy: { user: userId, date: today } },
      }
    );

    if (result.modifiedCount > 0) {
      await Interaction.updateOne(
        {
          user: userId,
          contentId: blogId,
          contentType: "Blog",
          action: "view",
        },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      const blog = await Blog.findById(blogId).select("embedding");
      const user = await User.findById(userId);
      if (user && blog && blog.embedding?.length) {
        const updatedEmbedding = updateUserEmbedding(
          user.embedding,
          blog.embedding,
          0.5
        );
        user.embedding = updatedEmbedding;
        await user.save();
      }
    }

    const currentBlog = await Blog.findById(blogId).select("views");
    res.json({ views: currentBlog ? currentBlog.views : 0 });
  } catch (err) {
    console.error("addView error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.id })
      .select("-embedding")
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error("getBlogsByUser error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET BLOG BY ID */
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
      .select("-embedding")
      .populate("author", "name username")
      .populate("comments.author", "name username")
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

exports.likeBlog = async (req, res) => {
  try {
    const blogId = req.params.id;
    const userId = req.userId;

    const blog = await Blog.findById(blogId);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    const hasLiked = blog.likes.some((id) => id.toString() === userId);

    const updatedBlog = await Blog.findByIdAndUpdate(
      blogId,
      hasLiked ? { $pull: { likes: userId } } : { $addToSet: { likes: userId } },
      { new: true }
    );

    // Handle interaction safely (no duplicates)
    if (!hasLiked) {
      await Interaction.updateOne(
        {
          user: userId,
          contentId: blog._id,
          contentType: "Blog",
          action: "like",
        },
        { $setOnInsert: { createdAt: new Date() } },
        { upsert: true }
      );

      const user = await User.findById(userId);
      if (user && blog.embedding?.length) {
        const updatedEmbedding = updateUserEmbedding(
          user.embedding,
          blog.embedding,
          2 // like weight
        );
        user.embedding = updatedEmbedding;
        await user.save();
      }
    } else {
      await Interaction.deleteOne({
        user: userId,
        contentId: blog._id,
        contentType: "Blog",
        action: "like",
      });
    }

    res.json({
      liked: !hasLiked,
      likesCount: updatedBlog.likes.length,
    });
  } catch (err) {
    console.error("likeBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* ADD COMMENT */
exports.addComment = async (req, res) => {
  try {
    const { text, mentions = [] } = req.body;

    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    blog.comments.push({
      text,
      author: req.userId,
      mentions,
    });

    await blog.save();

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

    const user = await User.findById(req.userId);
    if (user && blog.embedding?.length) {
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
    console.error("addComment error:", err);
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

    const isBlogOwner = blog.author && blog.author.toString() === req.userId;
    const isCommentAuthor = comment.author && comment.author.toString() === req.userId;

    if (!isBlogOwner && !isCommentAuthor) {
      return res.status(403).json({ message: "Not allowed" });
    }

    comment.deleteOne();
    await blog.save();

    res.json({ commentId });
  } catch (err) {
    console.error("deleteComment error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* UPDATE BLOG */
exports.updateBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    const titleChanged = req.body.title !== undefined && req.body.title !== blog.title;
    const contentChanged = req.body.content !== undefined && req.body.content !== blog.content;
    const techStackChanged = req.body.techStack !== undefined;

    blog.title = req.body.title ?? blog.title;
    blog.content = req.body.content ?? blog.content;

    if (req.body.techStack !== undefined) {
      let ts = req.body.techStack;
      if (typeof ts === "string") {
        try {
          ts = JSON.parse(ts);
        } catch {
          ts = ts.split(",").map((t) => t.trim());
        }
      }
      blog.techStack = Array.isArray(ts) ? ts : blog.techStack;
    }

    await blog.save();

    if (titleChanged || contentChanged || techStackChanged) {
      try {
        const textForEmbedding = `
${blog.title}
${blog.content}
${(blog.techStack || []).join(" ")}
        `;
        blog.embedding = await generateEmbedding(textForEmbedding);
        await blog.save();
      } catch (embErr) {
        console.error("Failed to regenerate blog embedding:", embErr);
      }
    }

    res.json(blog);
  } catch (err) {
    console.error("updateBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* DELETE BLOG */
exports.deleteBlog = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) return res.status(404).json({ message: "Blog not found" });

    if (blog.author.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    for (const img of blog.images) {
      if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
    }

    await blog.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteBlog error:", err);
    res.status(500).json({ message: "Server error" });
  }
};