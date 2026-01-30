const { Server } = require("socket.io");
const ChannelMessage = require("./models/ChannelMessage"); // for DM only

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: process.env.FRONTEND_URL,
      credentials: true,
    },
  });

  io.on("connection", socket => {

    // ================= DM =================
    socket.on("joinConversation", conversationId => {
      socket.join(conversationId);
    });

    // 🔥 DM MESSAGE (socket owns DM)
    socket.on("sendDMMessage", async ({ conversationId, senderId, content }) => {
      try {
        if (!content || !content.trim()) return;

        const message = await ChannelMessage.create({
          conversation: conversationId,
          sender: senderId,
          type: "text",
          content: content.trim(),
        });

        const populated = await message.populate("sender", "name _id");

        io.to(conversationId).emit("newDMMessage", populated);
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