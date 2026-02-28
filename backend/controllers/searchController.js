const Project = require("../models/Project");
const User = require("../models/User");
const { generateEmbedding } = require("../utils/embedding");
const { cosineSimilarity } = require("../utils/vector");

exports.search = async (req, res) => {
  try {
    const q = req.query.q?.trim();
    if (!q) return res.json({ users: [], projects: [] });

    const regex = new RegExp(q, "i");

    // 1️⃣ User search (keep regex for usernames)
    const users = await User.find({
      $or: [{ name: regex }, { username: regex }]
    })
      .select("name username bio")
      .limit(10);

    // 2️⃣ Generate embedding for semantic project search
    const queryEmbedding = await generateEmbedding(q);

    // Limit candidate pool for performance
    const RECENT_LIMIT = 500;

    const candidateProjects = await Project.find({})
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack owner createdAt likes views embedding")
      .populate("owner", "name username")
      .lean();

    // 3️⃣ Score projects using cosine similarity + recency boost
    const scoredProjects = candidateProjects
      .map(project => {
        const similarity = cosineSimilarity(queryEmbedding, project.embedding || []);

        const ageHours =
          (Date.now() - new Date(project.createdAt)) / (1000 * 60 * 60);
        const recencyBoost = Math.exp(-ageHours / 72);

        const score = similarity * 0.8 + recencyBoost * 0.2;

        return { ...project, score };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 20);

    res.json({ users, projects: scoredProjects });

  } catch (err) {
    console.error("Search Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};
