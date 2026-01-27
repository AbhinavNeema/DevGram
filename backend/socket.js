const { Server } = require("socket.io");
const ChannelMessage = require("./models/ChannelMessage");

let io;

const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", socket => {
    console.log("Socket connected:", socket.id);

    socket.on("joinChannel", channelId => {
      socket.join(channelId);
      console.log("Joined channel:", channelId);
    });

    socket.on("sendMessage", async ({ channelId, content, userId }) => {
      try {
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
      console.log("Socket disconnected:", socket.id);
    });
  });
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };