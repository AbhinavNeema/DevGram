const Conversation = require("../models/Conversation");
const cloudinary = require("../utils/cloudinary");
const Message = require("../models/Message");
const { getIO } = require("../socket");
const mongoose = require("mongoose");

/* START OR GET CONVERSATION */
exports.startConversation = async (req, res) => {
  try {
    const userId = req.userId;
    const otherUserId = req.params.userId;

    if (userId === otherUserId) {
      return res.status(400).json({ message: "Cannot DM yourself" });
    }

    const participants = [userId, otherUserId]
      .map((id) => id.toString())
      .sort();
    const pairKey = participants.join("_");

    let conversation = await Conversation.findOne({ pairKey }).populate(
      "participants",
      "name"
    );

    if (!conversation) {
      try {
        conversation = await Conversation.create({ participants, pairKey });
        await conversation.populate("participants", "name");
      } catch (createErr) {
        if (createErr.code === 11000) {
          conversation = await Conversation.findOne({ pairKey }).populate(
            "participants",
            "name"
          );
        } else {
          throw createErr;
        }
      }
    }

    res.json(conversation);
  } catch (err) {
    console.error("startConversation error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET INBOX */
exports.getInbox = async (req, res) => {
  try {
    const userId = req.userId;
    const userObjectId = new mongoose.Types.ObjectId(userId);

    const conversations = await Conversation.find({
      participants: userId,
    })
      .populate("participants", "name")
      .populate("lastMessage")
      .sort({ updatedAt: -1 });

    const conversationIds = conversations.map((c) => c._id);

    const unreadCounts = await Message.aggregate([
      {
        $match: {
          conversation: { $in: conversationIds },
          readBy: { $ne: userObjectId },
          sender: { $ne: userObjectId },
        },
      },
      {
        $group: {
          _id: "$conversation",
          count: { $sum: 1 },
        },
      },
    ]);

    const unreadMap = {};
    unreadCounts.forEach((item) => {
      unreadMap[item._id.toString()] = item.count;
    });

    const data = conversations.map((conv) => {
      const unreadCount = unreadMap[conv._id.toString()] || 0;
      return { ...conv.toObject(), unreadCount };
    });

    res.json(data);
  } catch (err) {
    console.error("getInbox error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET MESSAGES — with participant check */
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const messages = await Message.find({
      conversation: req.params.conversationId,
    }).populate("sender", "name");

    res.json(messages);
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* SEND MESSAGE — with participant check + lastMessage update */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text" } = req.body;
    const senderId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),
      type,
    });

    // Update lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populatedMessage = await Message.findById(message._id).populate(
      "sender",
      "name _id"
    );

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
  try {
    const { conversationId } = req.params;

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.userId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    await Message.updateMany(
      {
        conversation: conversationId,
        readBy: { $ne: req.userId },
      },
      {
        $push: { readBy: req.userId },
      }
    );

    getIO().to(conversationId).emit("messagesRead", {
      conversationId,
      userId: req.userId,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("markAsRead error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* EDIT MESSAGE — with ownership check */
exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;
    const messageId = req.params.id;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    if (!mongoose.Types.ObjectId.isValid(messageId)) {
      return res.status(400).json({ message: "Invalid message id" });
    }

    const msg = await Message.findById(messageId);
    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // Ownership check
    if (msg.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    msg.content = content.trim();
    await msg.save();
    await msg.populate("sender", "name _id");

    getIO().to(msg.conversation.toString()).emit("editMessage", msg);

    res.json(msg);
  } catch (err) {
    console.error("Edit message error:", err);
    res.status(500).json({ message: "Failed to edit message" });
  }
};

/* SEND DM IMAGE — with participant check + lastMessage update */
exports.sendDMImage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { conversationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const conversation = await Conversation.findById(conversationId);
    if (!conversation) {
      return res.status(404).json({ message: "Conversation not found" });
    }

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === senderId
    );
    if (!isParticipant) {
      return res.status(403).json({ message: "Access denied" });
    }

    const message = await Message.create({
      sender: senderId,
      conversation: conversationId,
      type: "image",
      content: req.file.path,
      cloudinaryId: req.file.filename,
    });

    // Update lastMessage
    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populated = await message.populate("sender", "name _id");

    getIO().to(conversationId).emit("newMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendDMImage error:", err);
    res.status(500).json({ message: "Failed to send image" });
  }
};

/* DELETE MESSAGE — with ownership check + cloudinary cleanup */
exports.deleteMessage = async (req, res) => {
  try {
    const msg = await Message.findById(req.params.id);

    if (!msg) return res.status(404).json({ message: "Not found" });

    // Ownership check
    if (msg.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not allowed" });
    }

    // Delete image from cloud
    if (msg.type === "image" && msg.cloudinaryId) {
      try {
        await cloudinary.uploader.destroy(msg.cloudinaryId);
      } catch (err) {
        console.warn("Cloudinary delete failed (ignored):", err.message);
      }
    }

    const conversationId = msg.conversation;
    await msg.deleteOne();

    // Check if the deleted message was the conversation's lastMessage
    const conversation = await Conversation.findById(conversationId);
    if (
      conversation &&
      conversation.lastMessage &&
      conversation.lastMessage.toString() === msg._id.toString()
    ) {
      const latestMsg = await Message.findOne({ conversation: conversationId }).sort({
        createdAt: -1,
      });
      conversation.lastMessage = latestMsg ? latestMsg._id : null;
      await conversation.save();
    }

    getIO().to(conversationId.toString()).emit("deleteMessage", msg._id);

    res.json({ success: true });
  } catch (err) {
    console.error("deleteMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};