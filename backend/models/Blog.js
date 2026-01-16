const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    content: { type: String, required: true },

    techStack: [String],

    images: [
      {
        url: String,
        public_id: String
      }
    ],

    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    comments: [
      {
        text: String,
        author: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
        createdAt: { type: Date, default: Date.now }
      }
    ],

    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    views: { type: Number, default: 0 },
    viewedBy: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);