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
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error("Get Blogs Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getBlogsByUser = async (req, res) => {
  try {
    const blogs = await Blog.find({ author: req.params.id })
      .populate("author", "name username")
      .populate("mentions", "username")
      .sort({ createdAt: -1 });

    res.json(blogs);
  } catch (err) {
    console.error("Get Blogs By User Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};