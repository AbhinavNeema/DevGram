const Conversation = require("../models/Conversation");
const Message = require("../models/Message");

/* START OR GET CONVERSATION */
exports.startConversation = async (req, res) => {
  const userId = req.userId;
  const otherUserId = req.params.userId;

  const participants = [userId, otherUserId].sort();

  let conversation = await Conversation.findOne({
    participants,
  }).populate("participants", "name");

  if (!conversation) {
    conversation = await Conversation.create({ participants });
    conversation = await conversation.populate("participants", "name");
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
      conversation: conversationId,   // ✅ FIX
      sender: req.userId,
      text,
    });

    await Conversation.findByIdAndUpdate(conversationId, {
      lastMessage: message._id,
    });

    const populated = await message.populate("sender", "name");
    res.json(populated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Server error" });
  }
};