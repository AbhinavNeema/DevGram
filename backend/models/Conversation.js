const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema(
  {
    participants: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      required: true,
      validate: v => v.length === 2, // ONE TO ONE
    },
    lastMessage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
    },
  },
  { timestamps: true }
);

// 🔥 prevent duplicate conversations
conversationSchema.index(
  { participants: 1 },
  { unique: true }
);

module.exports = mongoose.model("Conversation", conversationSchema);