const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema(
  {
    text: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

const blogSchema = new mongoose.Schema(
  {
    title: String,
    content: String,

    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    techStack: [String],
    mentions: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    images: [
      {
        url: String,
        public_id: String,
      },
    ],

    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    comments: [commentSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Blog", blogSchema);