const Project = require("../models/Project");
const Blog = require("../models/Blog");
const User = require("../models/User");
const { cosineSimilarity } = require("../utils/vector");

exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const userEmbedding = user.embedding || [];
    const start = Number(req.query.cursor || 0);
    const limit = Number(req.query.limit || 20);
    const followingIds = (user.following || []).map(id => id.toString());
    const { tag } = req.query;

    const productionMode = process.env.FEED_SEEN_MODE === "true";

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

    const RECENT_LIMIT = 500;

    const projects = await Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack owner createdAt likes views comments embedding")
      .populate("owner", "name username")
      .lean();

    const blogs = await Blog.find(blogFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title content techStack author createdAt likes views comments embedding")
      .populate("author", "name username")
      .lean();

    const scoreItem = (item) => {
      // 1️⃣ Semantic similarity
      const similarity = userEmbedding.length
        ? cosineSimilarity(userEmbedding, item.embedding || [])
        : 0;

      // 2️⃣ Recency decay (half-life ~3 days)
      const ageHours = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 72);

      // 3️⃣ Engagement score
      const likes = item.likes?.length || 0;
      const comments = item.comments?.length || 0;
      const views = item.views || 0;
      const engagementScore = likes * 2 + comments * 3 + views * 0.2;

      // 4️⃣ Follow boost
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      const followBoost = followingIds.includes(ownerId) ? 5 : 0;

      return (
        0.6 * similarity +
        0.15 * recencyScore +
        0.15 * engagementScore +
        0.1 * followBoost
      );
    };

    let feed = [
      ...projects.map(p => ({ ...p, feedType: "project", score: scoreItem(p) })),
      ...blogs.map(b => ({ ...b, feedType: "blog", score: scoreItem(b) })),
    ];

    
    if (!userEmbedding.length) {
      feed.forEach(item => {
        item.score = (item.likes?.length || 0) * 2 + (item.views || 0);
      });
    }

    
    feed.sort((a, b) => b.score - a.score);

    // 🔥 Ensure followed users' posts are always included
    const followedContent = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return followingIds.includes(ownerId);
    });

    const nonFollowedContent = feed.filter(item => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return !followingIds.includes(ownerId);
    });

    // Keep followed posts at top (sorted internally by score)
    const prioritizedFeed = [...followedContent, ...nonFollowedContent];

    const topPersonalized = prioritizedFeed.slice(0, 15);
    const trending = [...prioritizedFeed]
      .sort((a, b) =>
        (b.likes?.length || 0) + (b.views || 0) -
        ((a.likes?.length || 0) + (a.views || 0))
      )
      .slice(0, 5);

    const exploration = prioritizedFeed
      .slice(20, 40)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);

    const mixed = [...topPersonalized, ...trending, ...exploration];

    
    const uniqueFeed = Array.from(
      new Map(mixed.map(item => [item._id.toString(), item])).values()
    );

    const paginatedFeed = uniqueFeed.slice(start, start + limit);

    // 🔥 Mark items as seen (production only)
    if (productionMode && paginatedFeed.length > 0) {
      const projectIds = paginatedFeed
        .filter(item => item.feedType === "project")
        .map(item => item._id);

      const blogIds = paginatedFeed
        .filter(item => item.feedType === "blog")
        .map(item => item._id);

      if (projectIds.length) {
        await Project.updateMany(
          { _id: { $in: projectIds } },
          { $addToSet: { seenBy: user._id } }
        );
      }

      if (blogIds.length) {
        await Blog.updateMany(
          { _id: { $in: blogIds } },
          { $addToSet: { seenBy: user._id } }
        );
      }
    }

    res.json({
      cursor: start + limit,
      hasMore: start + limit < uniqueFeed.length,
      data: paginatedFeed,
    });

  } catch (err) {
    console.error("Elite Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};