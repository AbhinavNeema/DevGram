const Conversation = require("../models/Conversation");
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

/* SEND MESSAGE */
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text } = req.body;

    if (!conversationId || !text) {
      return res.status(400).json({ message: "Missing fields" });
    }

    const message = await Message.create({
      conversation: conversationId,
      sender: req.userId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populated = await message.populate("sender", "name");

    // 🔥 REAL-TIME
   const io = getIO();

io.to(conversationId).emit("newMessage", message);

    res.json(populated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
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
  const msg = await Message.findByIdAndUpdate(
    req.params.id,
    { text: req.body.text },
    { new: true }
  ).populate("sender", "name");

  getIO().to(msg.conversation.toString()).emit("editMessage", msg);

  res.json(msg);
};