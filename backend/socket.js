const { Server } = require("socket.io");

let io;

const initSocket = server => {
  io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      credentials: true,
    },
  });

  io.on("connection", socket => {
    console.log("🟢 Socket connected:", socket.id);

    socket.on("joinConversation", conversationId => {
      socket.join(conversationId);
    });

    socket.on("sendMessage", message => {
      io.to(message.conversationId).emit("newMessage", message);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });

  return io;
};

const getIO = () => {
  if (!io) throw new Error("Socket.io not initialized");
  return io;
};

module.exports = { initSocket, getIO };