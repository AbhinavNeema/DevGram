const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    contentId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      index: true,
    },

    contentType: {
      type: String,
      enum: ["Project", "Blog"],
      required: true,
    },

    action: {
      type: String,
      enum: ["view", "like", "comment"],
      required: true,
    },
  },
  { timestamps: true }
);

interactionSchema.index(
  { user: 1, contentId: 1, action: 1 },
  { unique: true }
);

module.exports = mongoose.model("Interaction", interactionSchema);