const Project = require("../models/Project");
const Blog = require("../models/Blog");
const User = require("../models/User");

exports.getFeed = async (req, res) => {
  try {
    const user = await User.findById(req.userId).lean();
    if (!user) return res.status(404).json({ message: "User not found" });

    const limit = Number(req.query.limit || 20);
    const cursor = req.query.cursor;
    const tag = req.query.tag;
    const followingIds = (user.following || []).map((id) => id.toString());

    let projectFilter = {};
    let blogFilter = {};

    if (tag) {
      projectFilter.techStack = tag;
      blogFilter.techStack = tag;
    }

    let isTimestampCursor = false;
    let cursorDate = null;
    let offset = 0;

    if (cursor !== undefined && cursor !== null && cursor !== "") {
      const numericVal = Number(cursor);
      if (!isNaN(numericVal) && numericVal > 10000000000) {
        cursorDate = new Date(numericVal);
        isTimestampCursor = true;
      } else if (isNaN(numericVal)) {
        const parsed = new Date(cursor);
        if (!isNaN(parsed.getTime())) {
          cursorDate = parsed;
          isTimestampCursor = true;
        }
      } else {
        offset = numericVal;
      }
    }

    if (isTimestampCursor && cursorDate) {
      projectFilter.createdAt = { $lt: cursorDate };
      blogFilter.createdAt = { $lt: cursorDate };
    }

    const RECENT_LIMIT = 500;

    const projects = await Project.find(projectFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title description techStack images githubLink liveDemoLink owner createdAt likes views comments")
      .populate("owner", "name username")
      .lean();

    const blogs = await Blog.find(blogFilter)
      .sort({ createdAt: -1 })
      .limit(RECENT_LIMIT)
      .select("title content techStack images author createdAt likes views comments")
      .populate("author", "name username")
      .lean();

    const scoreItem = (item) => {
      const ageHours = (Date.now() - new Date(item.createdAt)) / (1000 * 60 * 60);
      const recencyScore = Math.exp(-ageHours / 72);

      const likes = item.likes?.length || 0;
      const comments = item.comments?.length || 0;
      const views = item.views || 0;
      const engagementScore = likes * 2 + comments * 3 + views * 0.2;

      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      const followBoost = followingIds.includes(ownerId) ? 5 : 0;

      return 0.4 * recencyScore + 0.4 * engagementScore + 0.2 * followBoost;
    };

    let feed = [
      ...projects.map((p) => ({ ...p, feedType: "project", score: scoreItem(p) })),
      ...blogs.map((b) => ({ ...b, feedType: "blog", score: scoreItem(b) })),
    ];

    feed.sort((a, b) => b.score - a.score);

    // Keep followed posts at top (sorted internally by score)
    const followedContent = feed.filter((item) => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return followingIds.includes(ownerId);
    });

    const nonFollowedContent = feed.filter((item) => {
      const ownerId = item.owner?._id?.toString() || item.author?._id?.toString();
      return !followingIds.includes(ownerId);
    });

    const prioritizedFeed = [...followedContent, ...nonFollowedContent];

    const uniqueFeed = Array.from(
      new Map(prioritizedFeed.map((item) => [item._id.toString(), item])).values()
    );

    let paginatedFeed;
    let nextCursor;
    let hasMore;

    if (isTimestampCursor) {
      paginatedFeed = uniqueFeed.slice(0, limit);
      hasMore = uniqueFeed.length > limit;
      nextCursor =
        paginatedFeed.length > 0
          ? paginatedFeed[paginatedFeed.length - 1].createdAt
          : null;
    } else {
      paginatedFeed = uniqueFeed.slice(offset, offset + limit);
      hasMore = offset + limit < uniqueFeed.length;
      nextCursor = offset + limit;
    }

    res.json({
      cursor: nextCursor,
      hasMore,
      data: paginatedFeed,
    });
  } catch (err) {
    console.error("Feed Error:", err);
    res.status(500).json({ message: "Server error" });
  }
};