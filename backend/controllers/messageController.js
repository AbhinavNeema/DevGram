const mongoose = require("mongoose");
const Conversation = require("../models/Conversation");
const cloudinary = require("../utils/cloudinary");
const Message = require("../models/Message");
const { getIO } = require("../socket");

/* START OR GET CONVERSATION */
exports.startConversation = async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.userId;

  if (userId === otherUserId) {
    return res.status(400).json({ message: "Cannot DM yourself" });
  }

  // Always sort participants to prevent duplicates
  const participants = [userId, otherUserId]
    .map(id => id.toString())
    .sort();

  let conversation = await Conversation.findOne({
    participants,
  }).populate("participants", "name");

  if (!conversation) {
    conversation = await Conversation.create({ participants });
    await conversation.populate("participants", "name");
  }

  res.json(conversation);
};

/* GET INBOX - unified with unread count */
exports.getInbox = async (req, res) => {
  const userId = req.userId;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  // Fetch unread counts per conversation
  const data = await Promise.all(
    conversations.map(async conv => {
      const unreadCount = await Message.countDocuments({
        conversation: conv._id,
        readBy: { $ne: userId },
        sender: { $ne: userId },
      });

      return { ...conv.toObject(), unreadCount };
    })
  );

  res.json(data);
};

/* GET MESSAGES */
exports.getMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      conversation: req.params.conversationId,
    })
      .populate("sender", "name")
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

/* SEND MESSAGE */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text", clientId } = req.body;
    const senderId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const participants = conversation.participants.map(p => p.toString());
    if (!participants.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
      type,
    });

    // Populate before emitting
    let populatedMessage = await Message.findById(message._id)
      .populate("sender", "name _id");

    // Add clientId for optimistic update matching if provided
    if (clientId) {
      populatedMessage = { ...populatedMessage.toObject(), clientId };
    }

    // Update conversation's lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const io = getIO();
    io.to(conversationId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* MARK AS READ */
exports.markAsRead = async (req, res) => {
  const { conversationId } = req.params;
  const userId = req.userId;

  try {
    await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: userId },
      },
      {
        $push: { readBy: userId },
      }
    );

    res.json({ success: true });
  } catch (err) {
    console.error("Mark as read error:", err);
    res.status(500).json({ message: "Failed to mark as read" });
  }
};

/* DELETE MESSAGE */
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can delete
    if (msg.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Delete image from cloud if applicable
    if (msg.type === "image" && msg.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(msg.cloudinaryId);
      } catch (err) {
        console.warn("Cloudinary delete failed (ignored):", err.message);
      }
    }

    await msg.deleteOne();

    getIO().to(msg.conversation.toString()).emit("deleteMessage", msg._id);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete message error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};

/* EDIT MESSAGE */
exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const messageId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const msg = await Message.findById(messageId);

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Only sender can edit
    if (msg.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot edit images
    if (msg.type === "image") {
      return res.status(400).json({ message: "Cannot edit image messages" });
    }

    const updatedMsg = await Message.findByIdAndUpdate(
      messageId,
      { content: content.trim() },
      { new: true }
    ).populate("sender", "name _id");

    // Real-time update
    getIO().to(msg.conversation.toString()).emit("editMessage", updatedMsg);

    res.json(updatedMsg);
  } catch (err) {
    console.error("Edit message error:", err);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

/* SEND DM IMAGE */
exports.sendDMImage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { conversationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    // Verify user is participant
    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const participants = conversation.participants.map(p => p.toString());
    if (!participants.includes(senderId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const message = await Message.create({
      sender: senderId,
      conversation: conversationId,
      type: "image",
      content: req.file.path,
      cloudinaryId: req.file.filename,
    });

    const populated = await message.populate("sender", "name _id");

    getIO().to(conversationId).emit("newMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendDMImage error:", err);
    res.status(500).json({ message: "Failed to send image" });
  }
};