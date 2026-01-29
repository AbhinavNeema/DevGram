const Conversation = require("../models/Conversation");
const cloudinary = require("../utils/cloudinary");
const Message = require("../models/Message");
const { getIO } = require("../socket");
// exports.sendMessage = async (req, res) => {
//   const { conversationId, text } = req.body;

//   const message = await Message.create({
//     conversation: conversationId,
//     sender: req.user.id,
//     text,
//   });

//   await message.populate("sender", "name");

//   // 🔥 REAL-TIME EMIT
//   getIO()
//     .to(conversationId)
//     .emit("newMessage", message);

//   res.json(message);
// };
/* START OR GET CONVERSATION */
exports.startConversation = async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.userId;

  if (userId === otherUserId) {
    return res.status(400).json({ message: "Cannot DM yourself" });
  }

  // 🔑 ALWAYS SORT
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
/* GET INBOX */
exports.getInbox = async (req, res) => {
  const userId = req.userId;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

  res.json(conversations);
};

/* GET MESSAGES */
exports.getMessages = async (req, res) => {
  const messages = await Message.find({
    conversation: req.params.conversationId,
  }).populate("sender", "name");

  res.json(messages);
};


exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, content, type = "text" } = req.body;
    const senderId = req.userId;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: senderId,
      content: content.trim(),   // ✅ FORCE TRIM
      type,
    });

    // 🔥 IMPORTANT: populate BEFORE emitting
    const populatedMessage = await Message.findById(message._id)
      .populate("sender", "name _id");

    
    const io = getIO();
    io.to(conversationId).emit("newMessage", populatedMessage);

    res.status(201).json(populatedMessage);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

// controllers/messageController.js
exports.markAsRead = async (req, res) => {
  const { conversationId } = req.params;

  await Message.updateMany(
    {
      conversation: conversationId,
      readBy: { $ne: req.userId },
    },
    {
      $push: { readBy: req.userId },
    }
  );

  res.json({ success: true });
};

exports.getInbox = async (req, res) => {
  const userId = req.userId;

  const conversations = await Conversation.find({
    participants: userId,
  })
    .populate("participants", "name")
    .populate("lastMessage")
    .sort({ updatedAt: -1 });

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

exports.deleteMessage = async (req, res) => {
  const msg = await Message.findById(req.params.id);
  await msg.deleteOne();

  getIO().to(msg.conversation.toString()).emit("deleteMessage", msg._id);

  res.json({ success: true });
};

exports.editMessage = async (req, res) => {
  try {
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const msg = await Message.findByIdAndUpdate(
      req.params.id,
      { content: content.trim() },   // ✅ FIX
      { new: true }
    ).populate("sender", "name _id");

    if (!msg) {
      return res.status(404).json({ message: "Message not found" });
    }

    // 🔥 realtime update
    getIO().to(msg.conversation.toString()).emit("editMessage", msg);

    res.json(msg);
  } catch (err) {
    console.error("Edit message error:", err);
    res.status(500).json({ message: "Failed to edit message" });
  }
};
exports.sendDMImage = async (req, res) => {
  try {
    const senderId = req.userId;
    const { conversationId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No image uploaded" });
    }

    const message = await Message.create({
      sender: senderId,
      conversation: conversationId,
      type: "image",
      content: req.file.path,              // ✅ cloud url
      cloudinaryId: req.file.filename,     // ✅ public_id
    });

    const populated = await message.populate("sender", "name _id");

    getIO().to(conversationId).emit("newMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendDMImage error:", err);
    res.status(500).json({ message: "Failed to send image" });
  }
};

exports.deleteMessage = async (req, res) => {
  const msg = await Message.findById(req.params.id);

  if (!msg) return res.status(404).json({ message: "Not found" });

  // 🔥 delete image from cloud
  if (msg.type === "image" && msg.cloudinaryId) {
    await cloudinary.uploader.destroy(msg.cloudinaryId);
  }

  await msg.deleteOne();

  getIO().to(msg.conversation.toString()).emit("deleteMessage", msg._id);

  res.json({ success: true });
};