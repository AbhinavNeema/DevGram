const ChannelMessage = require("../models/ChannelMessage");

module.exports = io => {
  io.on("connection", socket => {
    console.log("🔌 Socket connected:", socket.id);

    socket.on("joinChannel", channelId => {
      socket.join(channelId);
      console.log("Joined channel:", channelId);
    });

    socket.on("sendMessage", async data => {
      const { channelId, userId, content } = data;

      if (!content?.trim()) return;

      const msg = await ChannelMessage.create({
        channel: channelId,
        sender: userId,
        content,
      });

      const populatedMsg = await msg.populate("sender", "name username");

      io.to(channelId).emit("newMessage", populatedMsg);
    });

    socket.on("disconnect", () => {
      console.log("❌ Socket disconnected:", socket.id);
    });
  });
};