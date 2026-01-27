const { Server } = require("socket.io");
const ChannelMessage = require("./models/ChannelMessage"); // adjust path

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", socket => {
    // console.log("Socket connected:", socket.id);

    // ================= DM =================
    socket.on("joinConversation", conversationId => {
      socket.join(conversationId);
      // console.log("Joined conversation:", conversationId);
    });

    // ================= CHANNEL =================
    socket.on("joinChannel", channelId => {
      socket.join(channelId);
      // console.log("Joined channel:", channelId);
    });

    socket.on("leaveChannel", channelId => {
      socket.leave(channelId);
    });

    socket.on("sendMessage", async ({ channelId, userId, content }) => {
      try {
        const rooms = [...socket.rooms];
        if (!rooms.includes(channelId)) {
          return; // user is not in channel room
        }

        const message = await ChannelMessage.create({
          channel: channelId,
          sender: userId,
          content,
        });

        const populated = await message.populate(
          "sender",
          "name username"
        );

        io.to(channelId).emit("newMessage", populated);
      } catch (err) {
        console.error("Send message error:", err);
      }
    });

    socket.on("disconnect", () => {
      // console.log("Socket disconnected:", socket.id);
    });
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