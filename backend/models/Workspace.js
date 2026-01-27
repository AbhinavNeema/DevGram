const mongoose = require("mongoose");

const memberSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  role: {
    type: String,
    enum: ["owner", "admin", "member"],
    default: "member",
  },
  joinedAt: {
    type: Date,
    default: Date.now,
  },
});

const inviteSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
  },
  invitedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  role: {
    type: String,
    enum: ["admin", "member"],
    default: "member",
  },
  invitedAt: {
    type: Date,
    default: Date.now,
  },
});

const workspaceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: String,

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    members: [memberSchema],
    pendingInvites: [inviteSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Workspace", workspaceSchema);