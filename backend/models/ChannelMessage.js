const mongoose = require("mongoose");

const channelMessageSchema = new mongoose.Schema(
  {
    channel: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Channel",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    type: {
      type: String,
      enum: ["text", "image", "file"],
      default: "text",
    },
    content: {
      type: String,
      required: function () {
        return this.type !== "system";
      },
    },
     fileMeta: {
      name: String,
      size: Number,
      mime: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("ChannelMessage", channelMessageSchema);