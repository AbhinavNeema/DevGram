const { Server } = require("socket.io");
const jwt = require("jsonwebtoken");
const Message = require("./models/Message");
const Conversation = require("./models/Conversation");
const Channel = require("./models/Channel");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: [
        "http://localhost:5173",
        process.env.FRONTEND_URL,
      ],
      credentials: true,
    },
  });

  // 🔐 Socket authentication middleware
  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) {
      return next(new Error("Authentication required"));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.sub;
      next();
    } catch (err) {
      return next(new Error("Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    // ================= DM =================
    socket.on("joinConversation", async (conversationId) => {
      try {
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        );
        if (!isParticipant) return;
        socket.join(conversationId);
      } catch (err) {
        console.error("joinConversation error:", err);
      }
    });

    socket.on("leaveConversation", (conversationId) => {
      socket.leave(conversationId);
    });

    // 🔥 DM MESSAGE
    socket.on("sendDMMessage", async ({ conversationId, content }) => {
      try {
        if (!content || !content.trim()) return;

        // Verify participation
        const conversation = await Conversation.findById(conversationId);
        if (!conversation) return;
        const isParticipant = conversation.participants.some(
          (p) => p.toString() === socket.userId
        );
        if (!isParticipant) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: socket.userId,
          type: "text",
          content: content.trim(),
        });

        // Update lastMessage on conversation
        await Conversation.findByIdAndUpdate(conversationId, {
          lastMessage: message._id,
        });

        const populated = await message.populate("sender", "name _id");

        io.to(conversationId).emit("newMessage", populated);
      } catch (err) {
        console.error("Send DM error:", err);
      }
    });

    // ================= CHANNEL =================
    socket.on("joinChannel", async (channelId) => {
      try {
        const channel = await Channel.findById(channelId);
        if (!channel) return;
        const isMember = channel.members.some(
          (m) => m.toString() === socket.userId
        );
        if (!isMember) return;
        socket.join(channelId);
      } catch (err) {
        console.error("joinChannel error:", err);
      }
    });

    socket.on("leaveChannel", (channelId) => {
      socket.leave(channelId);
    });

    socket.on("disconnect", () => {});
  });

  return io;
};

const getIO = () => {
  if (!io) {
    throw new Error("Socket.io not initialized");
  }
  return io;
};

module.exports = { initSocket, getIO };