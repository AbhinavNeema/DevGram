const { Server } = require("socket.io");
const Message = require("./models/Message"); // for DM only

let io;

const allowedOrigins = [
  "http://localhost:5173",
  "http://localhost:5174",
  process.env.FRONTEND_URL,
].filter(Boolean);

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  io.on("connection", socket => {

    // ================= DM =================
    socket.on("joinConversation", conversationId => {
      socket.join(conversationId);
    });

    // DM MESSAGE (socket-based, for real-time sending)
    socket.on("sendDMMessage", async ({ conversationId, senderId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const message = await Message.create({
          conversation: conversationId,
          sender: senderId,
          type: "text",
          content: content.trim(),
        });

        const populated = await message.populate("sender", "name _id");

        // Emit newMessage to match frontend listener
        io.to(conversationId).emit("newMessage", populated);
      } catch (err) {
        console.error("Send DM error:", err);
      }
    });

    // ================= CHANNEL =================
    socket.on("joinChannel", channelId => {
      socket.join(channelId);
    });

    socket.on("leaveChannel", channelId => {
      socket.leave(channelId);
    });

    // ❌ DO NOT CREATE CHANNEL MESSAGES HERE
    // Channel messages come from controllers via getIO().emit()

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