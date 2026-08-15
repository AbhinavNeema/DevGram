const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    description: {
      type: String,
      default: "",
    },
    techStack: [{
      type: String,
      index: true,
    }],
    githubLink: {
      type: String,
      default: "",
    },
    liveDemoLink: {
      type: String,
      default: "",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    likes: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      index: true,
    }],
    comments: [
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
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    images: [
      {
        url: {
          type: String,
          required: true,
        },
        public_id: {
          type: String,
          required: true,
        },
      },
    ],
    views: {
      type: Number,
      default: 0,
      index: true,
    },
    viewedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    mentions: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    seenBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    }],
    embedding: {
      type: [Number],
      default: [],
      select: false, // Exclude from default queries
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Compound indexes for common queries
projectSchema.index({ owner: 1, createdAt: -1 });
projectSchema.index({ techStack: 1, createdAt: -1 });
projectSchema.index({ likes: 1, createdAt: -1 });
projectSchema.index({ views: -1 });

module.exports = mongoose.model("Project", projectSchema);