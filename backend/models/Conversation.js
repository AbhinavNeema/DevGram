const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: (v) => v.length === 2, // ONE TO ONE
    },
    pairKey: {
      type: String,
      unique: true,
      index: true,
    },
    unreadCounts: {
      type: Map,
      of: Number,
      default: {},
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

conversationSchema.pre("validate", function (next) {
  if (this.participants && this.participants.length === 2) {
    this.pairKey = this.participants.map((id) => id.toString()).sort().join("_");
  }
  if (typeof next === "function") next();
});

module.exports = mongoose.model("Conversation", conversationSchema);