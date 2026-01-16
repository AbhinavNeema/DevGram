const Blog = require("../models/Blog");
const cloudinary = require("../config/cloudinary");
const ALLOWED_TAGS = require("../constants/tags");

exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      content,
      techStack = "[]",
      mentions = "[]"
    } = req.body;

    const parsedTechStack = Array.isArray(techStack)
      ? techStack
      : JSON.parse(techStack);

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
          public_id: file.filename
        });
      }
    }

    const blog = await Blog.create({
      title,
      content,
      techStack: parsedTechStack,
      mentions: parsedMentions,
      images,
      author: req.userId
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
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch {
    res.status(500).json({ message: "Server error" });
  }
};
exports.getBlogsByUser = async (req, res) => {
  const blogs = await Blog.find({ author: req.params.id })
    .populate("author", "name username")
    .populate("mentions", "username")
    .sort({ createdAt: -1 });

  res.json(blogs);
};
/* GET BLOG BY ID */
exports.getBlogById = async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id)
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
  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  const hasLiked = blog.likes.includes(req.userId);

  if (hasLiked) {
    blog.likes.pull(req.userId);
  } else {
    blog.likes.push(req.userId);
  }

  await blog.save();

  res.json({
    liked: !hasLiked,
    likesCount: blog.likes.length,
  });
};

/* ADD COMMENT */
exports.addComment = async (req, res) => {
  const { text, mentions = [] } = req.body;

  const blog = await Blog.findById(req.params.id);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  blog.comments.push({
    text,
    author: req.userId,
    mentions,
  });

  await blog.save();

  const populated = await Blog.findById(blog._id)
    .populate("comments.author", "name username")
    .populate("comments.mentions", "username");

  res.json(populated.comments.at(-1));
};

/* DELETE COMMENT */
exports.deleteComment = async (req, res) => {
  const { blogId, commentId } = req.params;

  const blog = await Blog.findById(blogId);
  if (!blog) return res.status(404).json({ message: "Blog not found" });

  const comment = blog.comments.id(commentId);
  if (!comment) return res.status(404).json({ message: "Comment not found" });

  if (comment.author.toString() !== req.userId)
    return res.status(403).json({ message: "Not allowed" });

  comment.deleteOne();
  await blog.save();

  res.json({ commentId });
};

/* UPDATE BLOG */
exports.updateBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog.author.toString() !== req.userId)
    return res.status(403).json({ message: "Not allowed" });

  blog.title = req.body.title ?? blog.title;
  blog.content = req.body.content ?? blog.content;
  blog.techStack = req.body.techStack ?? blog.techStack;

  await blog.save();
  res.json(blog);
};

/* DELETE BLOG */
exports.deleteBlog = async (req, res) => {
  const blog = await Blog.findById(req.params.id);
  if (blog.author.toString() !== req.userId)
    return res.status(403).json({ message: "Not allowed" });

  for (const img of blog.images) {
    if (img.public_id) await cloudinary.uploader.destroy(img.public_id);
  }

  await blog.deleteOne();
  res.json({ success: true });
};