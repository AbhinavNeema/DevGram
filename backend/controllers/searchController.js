const Project = require("../models/Project");
const User = require("../models/User");
const Blog = require("../models/Blog");
const { generateEmbedding } = require("../utils/embedding");
const { cosineSimilarity } = require("../utils/vector");

/* SEARCH */
exports.search = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    const { limit = 20 } = req.query;

    if (!q || q.length < 2) {
      return res.json({ users: [], projects: [], blogs: [] });
    }

    // Search users with regex
    const safeQuery = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(safeQuery, "i");

    const users = await User.find({
      $or: [{ name: regex }, { username: regex }],
    })
      .select("name username bio profilePhoto techStack")
      .limit(parseInt(limit))
      .lean();

    // Try semantic search for projects if embedding service is available
    try {
      const queryEmbedding = await generateEmbedding(q);

      if (queryEmbedding && queryEmbedding.length > 0) {
        // Limit candidate pool for performance
        const RECENT_LIMIT = 200;

        const candidateProjects = await Project.find({})
          .sort({ createdAt: -1 })
          .limit(RECENT_LIMIT)
          .select("title description techStack owner createdAt likes views embedding comments")
          .populate("owner", "name username")
          .lean();

        // Score projects using cosine similarity + recency boost
        const scoredProjects = candidateProjects
          .map(project => {
            const similarity = cosineSimilarity(queryEmbedding, project.embedding || []);

            const ageHours =
              (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
            const recencyBoost = Math.exp(-ageHours / 72);

            const score = similarity * 0.7 + recencyBoost * 0.3;

            return { ...project, score, feedType: "project" };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, parseInt(limit));

        // Also search blogs semantically
        const candidateBlogs = await Blog.find({})
          .sort({ createdAt: -1 })
          .limit(RECENT_LIMIT)
          .select("title content techStack author createdAt likes views embedding comments")
          .populate("author", "name username")
          .lean();

        const scoredBlogs = candidateBlogs
          .map(blog => {
            const similarity = cosineSimilarity(queryEmbedding, blog.embedding || []);

            const ageHours =
              (Date.now() - new Date(blog.createdAt)) / (1000 * 60 * 60);
            const recencyBoost = Math.exp(-ageHours / 72);

            const score = similarity * 0.7 + recencyBoost * 0.3;

            return { ...blog, score, feedType: "blog" };
          })
          .sort((a, b) => b.score - a.score)
          .slice(0, parseInt(limit));

        return res.json({
          users,
          projects: scoredProjects,
          blogs: scoredBlogs,
        });
      }
    } catch (embeddingErr) {
      console.warn("Semantic search unavailable, falling back to text search:", embeddingErr.message);
    }

    // Fallback: text-based search for projects
    const projects = await Project.find({
      $or: [
        { title: regex },
        { description: regex },
        { techStack: regex },
      ],
    })
      .populate("owner", "name username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Fallback: text-based search for blogs
    const blogs = await Blog.find({
      $or: [
        { title: regex },
        { content: regex },
        { techStack: regex },
      ],
    })
      .populate("author", "name username")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    res.json({
      users,
      projects: projects.map(p => ({ ...p.toObject(), feedType: "project" })),
      blogs: blogs.map(b => ({ ...b.toObject(), feedType: "blog" })),
    });
  } catch (err) {
    console.error("Search error:", err);
    res.status(500).json({ message: "Search failed" });
  }
};