const Project = require("../models/Project");
const Blog = require("../models/Blog");

exports.getFeed = async (req, res) => {
  try {
    const { type = "all", tag, q } = req.query;

    const projectQuery = {};
    const blogQuery = {};

    /* ---------------- TAG FILTER ---------------- */
    if (tag) {
      projectQuery.techStack = tag;
      blogQuery.techStack = tag; // ✅ FIXED
    }

    /* ---------------- SEARCH FILTER ---------------- */
    if (q) {
      const regex = new RegExp(q, "i");

      projectQuery.$or = [
        { title: regex },
        { description: regex },
      ];

      blogQuery.$or = [
        { title: regex },
        { content: regex },
      ];
    }

    let feed = [];

    /* ---------------- PROJECTS ---------------- */
    if (type === "project" || type === "all") {
      const projects = await Project.find(projectQuery)
        .populate("owner", "name username")
        .sort({ createdAt: -1 })
        .lean();

      feed.push(
        ...projects.map(p => ({
          ...p,
          feedType: "project",
        }))
      );
    }

    /* ---------------- BLOGS ---------------- */
    if (type === "blog" || type === "all") {
      const blogs = await Blog.find(blogQuery)
        .populate("author", "name username")
        .sort({ createdAt: -1 })
        .lean();

      feed.push(
        ...blogs.map(b => ({
          ...b,
          feedType: "blog",
        }))
      );
    }

    /* ---------------- FINAL SORT ---------------- */
    feed.sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.json(feed);
  } catch (err) {
    console.error("Feed error:", err);
    res.status(500).json({ message: "Failed to load feed" });
  }
};