const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    content: {
      type: String,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    techStack: [{
      type: String,
      index: true,
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    images: [
      {
        url: String,
        public_id: String,
      },
    ],
    views: {
      type: Number,
      default: 0,
    },
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    viewedBy: [{
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      date: String, // YYYY-MM-DD
    }],
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }],
    comments: [commentSchema],
    embedding: {
      type: [Number],
      default: [],
      select: false, // Exclude from default queries for performance
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
blogSchema.index({ author: 1, createdAt: -1 });
blogSchema.index({ techStack: 1, createdAt: -1 });
blogSchema.index({ likes: 1, createdAt: -1 });
blogSchema.index({ views: -1 });

module.exports = mongoose.model("Blog", blogSchema);