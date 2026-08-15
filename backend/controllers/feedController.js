const Project = require("../models/Project");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { cosineSimilarity } = require("../utils/vector");

// Feed composition weights
const WEIGHTS = {
  similarity: 0.5,
  recency: 0.2,
  engagement: 0.2,
  followBoost: 0.1,
};

// Recency half-life in hours
const RECENCY_HALF_LIFE = 72;

/* GET FEED */
exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmbedding = user.embedding || [];
    const hasEmbedding = userEmbedding.length > 0;

    const start = Number(req.query.cursor || 0);
    const limit = Math.min(Number(req.query.limit || 20), 50); // Cap at 50
    const { tag } = req.query;

    const followingIds = (user.following || []).map(id => id.toString());
    const productionMode = process.env.FEED_SEEN_MODE === "true";

    // Build filters
    let projectFilter = {};
    let blogFilter = {};

    if (tag) {
      projectFilter.techStack = tag;
      blogFilter.techStack = tag;
    }

    if (productionMode) {
      projectFilter.seenBy = { $ne: user._id };
      blogFilter.seenBy = { $ne: user._id };
    }

    const RECENT_LIMIT = 300;

    // Fetch candidates
    const [projects, blogs] = await Promise.all([
      Project.find(projectFilter)
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("title description techStack owner createdAt likes views comments embedding")
        .populate("owner", "name username profilePhoto")
        .lean(),
      Blog.find(blogFilter)
        .sort({ createdAt: -1 })
        .limit(RECENT_LIMIT)
        .select("title content techStack author createdAt likes views comments embedding")
        .populate("author", "name username profilePhoto")
        .lean(),
    ]);

    // Score items
    const scoreItem = (item) => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      const isFollowed = followingIds.includes(ownerId);

      // 1. Semantic similarity (if embedding available)
      let similarity = 0;
      if (hasEmbedding && item.embedding?.length > 0) {
        similarity = cosineSimilarity(userEmbedding, item.embedding);
      }

      // 2. Recency decay (half-life ~3 days)
      const ageHours = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / RECENCY_HALF_LIFE);

      // 3. Engagement score
      const likes = item.likes?.length || 0;
      const comments = item.comments?.length || 0;
      const views = item.views || 0;
      const engagementScore = (likes * 2 + comments * 3 + views * 0.1) / 100;

      // 4. Follow boost
      const followBoost = isFollowed ? 1 : 0;

      // Weighted score
      return (
        WEIGHTS.similarity * similarity +
        WEIGHTS.recency * recencyScore +
        WEIGHTS.engagement * Math.min(engagementScore, 1) +
        WEIGHTS.followBoost * followBoost
      );
    };

    // Create feed items with scores
    let feed = [
      ...projects.map(p => ({ ...p, feedType: "project" })),
      ...blogs.map(b => ({ ...b, feedType: "blog" })),
    ].map(item => ({
      ...item,
      score: scoreItem(item),
    }));

    // If no embeddings, fall back to engagement-based scoring
    if (!hasEmbedding) {
      feed.forEach(item => {
        item.score = (item.likes?.length || 0) * 2 + (item.views || 0);
      });
    }

    // Sort by score
    feed.sort((a, b) => b.score - a.score);

    // Separate followed and non-followed content
    const followedContent = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return followingIds.includes(ownerId);
    });

    const nonFollowedContent = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return !followingIds.includes(ownerId);
    });

    // Prioritize followed content at top
    const prioritizedFeed = [...followedContent, ...nonFollowedContent];

    // Mix: personalized + trending + exploration
    const topPersonalized = prioritizedFeed.slice(0, 12);
    const trending = [...prioritizedFeed]
      .sort((a, b) =>
        ((b.likes?.length || 0) + (b.views || 0)) -
        ((a.likes?.length || 0) + (a.views || 0))
      )
      .slice(0, 5);
    const exploration = prioritizedFeed
      .filter((_, i) => i >= 15 && i < 35)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    // Deduplicate
    const mixed = [...topPersonalized, ...trending, ...exploration];
    const uniqueFeed = Array.from(
      new Map(mixed.map(item => [item._id.toString(), item])).values()
    );

    const paginatedFeed = uniqueFeed.slice(start, start + limit);

    // Mark items as seen in production mode
    if (productionMode && paginatedFeed.length > 0) {
      const projectIds = paginatedFeed
        .filter(item => item.feedType === "project")
        .map(item => item._id);

      const blogIds = paginatedFeed
        .filter(item => item.feedType === "blog")
        .map(item => item._id);

      // Update in background (non-blocking)
      if (projectIds.length) {
        Project.updateMany(
          { _id: { $in: projectIds } },
          { $addToSet: { seenBy: user._id } }
        ).catch(err => console.warn("Feed seen update error:", err.message));
      }

      if (blogIds.length) {
        Blog.updateMany(
          { _id: { $in: blogIds } },
          { $addToSet: { seenBy: user._id } }
        ).catch(err => console.warn("Feed seen update error:", err.message));
      }
    }

    res.json({
      cursor: start + limit,
      hasMore: start + limit < uniqueFeed.length,
      data: paginatedFeed,
    });
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};