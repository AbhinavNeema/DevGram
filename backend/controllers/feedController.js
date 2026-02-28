const Project = require("../models/Project");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { cosineSimilarity } = require("../utils/vector");

exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmbedding = user.embedding || [];
    const followingIds = (user.following || []).map(id => id.toString());

    // 🔥 Retrieve all projects & blogs (can later limit to recent 300-500)
    const projects = await Project.find({})
      .select("title description techStack owner createdAt likes views comments embedding")
      .populate("owner", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .lean();

    const blogs = await Blog.find({})
      .select("title content techStack author createdAt likes views comments embedding")
      .populate("author", "name username")
      .populate("comments.author", "name username")
      .populate("comments.mentions", "username")
      .lean();

    const scoreItem = (item) => {
      const similarity = cosineSimilarity(userEmbedding, item.embedding);

      // Recency boost (exponential decay)
      const ageHours =
        (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
      const recencyBoost = Math.exp(-ageHours / 48);

      // Follow boost (stronger priority)
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      const followBoost = followingIds.includes(ownerId) ? 0.4 : 0;

      return 0.6 * similarity + 0.3 * recencyBoost + followBoost;
    };

    let feed = [
      ...projects.map(p => ({
        ...p,
        feedType: "project",
        score: scoreItem(p),
      })),
      ...blogs.map(b => ({
        ...b,
        feedType: "blog",
        score: scoreItem(b),
      })),
    ];

    // 🔥 Add trending score fallback for cold users
    if (!userEmbedding || userEmbedding.length === 0) {
      feed.forEach(item => {
        const trendingScore =
          (item.likes?.length || 0) + (item.views || 0);
        item.score = trendingScore;
      });
    }

    // 🔥 Sort by final score
    feed.sort((a, b) => b.score - a.score);

    // 🔥 Ensure posts from following always appear (even if low similarity)
    const followingPosts = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return followingIds.includes(ownerId);
    });

    const nonFollowingPosts = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return !followingIds.includes(ownerId);
    });

    const finalFeed = [...followingPosts, ...nonFollowingPosts];

    // Return top 20
    res.json({
      cursor: 20,
      hasMore: false,
      data: finalFeed.slice(0, 20),
    });

  } catch (err) {
    console.error("Vector Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};