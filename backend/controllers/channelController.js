const { getIO } = require("../socket");
const Channel = require("../models/Channel");
const Workspace = require("../models/Workspace");
const ChannelMessage = require("../models/ChannelMessage");

/* CREATE CHANNEL */
exports.createChannel = async (req, res) => {
  const { workspaceId } = req.params;
  const { name } = req.body;

  const workspace = await Workspace.findById(workspaceId);
  if (!workspace) return res.status(404).json({ message: "Workspace not found" });

  const channel = await Channel.create({
    name,
    workspace: workspaceId,
    members: workspace.members.map(m => m.user),
    createdBy: req.userId,
  });

  res.json(channel);
};

/* GET WORKSPACE CHANNELS */
exports.getChannels = async (req, res) => {
  const { workspaceId } = req.params;

  const channels = await Channel.find({
    workspace: workspaceId,
    members: req.userId,
  });

  res.json(channels);
};

/* SEND MESSAGE */
exports.sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const msg = await ChannelMessage.create({
      channel: channelId,
      sender: req.userId,
      type: "text",               // ✅ REQUIRED
      content: content.trim(),    // ✅ REQUIRED
    });

    const populated = await msg.populate("sender", "name _id");

    getIO().to(channelId).emit("newChannelMessage", populated);

    res.json(populated);
  } catch (err) {
    console.error("sendMessage error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* GET CHANNEL MESSAGES */
exports.getMessages = async (req, res) => {
  const { channelId } = req.params;

  const channel = await Channel.findById(channelId);
  if (!channel) {
    return res.status(404).json({ message: "Channel not found" });
  }

  if (!channel.members.map(String).includes(req.userId)) {
    return res.status(403).json({ message: "Access denied" });
  }

  const messages = await ChannelMessage.find({ channel: channelId })
    .populate("sender", "name")
    .sort({ createdAt: 1 });

  res.json(messages);
};

exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const channel = await Channel.findByIdAndUpdate(
      channelId,
      { name, description },
      { new: true }
    );

    res.json(channel);
  } catch (err) {
    res.status(500).json({ message: "Failed to update channel" });
  }
};

exports.addMember = async (req, res) => {
  const { channelId } = req.params;
  const { userId } = req.body;

  await Channel.findByIdAndUpdate(channelId, {
    $addToSet: { members: userId },
  });

  res.json({ success: true });
};

exports.removeMember = async (req, res) => {
  const { channelId, userId } = req.params;

  await Channel.findByIdAndUpdate(channelId, {
    $pull: { members: userId },
  });

  res.json({ success: true });
};

exports.deleteChannel = async (req, res) => {
  const channel = await Channel.findById(req.params.channelId);

  if (channel.name === "general") {
    return res.status(400).json({ message: "Cannot delete general channel" });
  }

  await channel.deleteOne();
  res.json({ success: true });
};

const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devgram/channels",
    resource_type: "auto", // 🔥 allows image + pdf + zip + everything
    allowed_formats: [
      "jpg", "jpeg", "png", "webp", "gif",
      "pdf", "zip", "txt", "json",
      "js", "ts", "py",
      "doc", "docx", "ppt", "pptx",
      "xls", "xlsx",
    ],
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

exports.uploadChannelFile = upload;

exports.sendChannelFile = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // 🔥 CRITICAL FIX
    const fileUrl =
      req.file.secure_url || req.file.path || req.file.url;

    if (!fileUrl) {
      console.error("Cloudinary file object:", req.file);
      return res.status(500).json({ message: "File URL missing" });
    }

    const message = await ChannelMessage.create({
      channel: channelId,
      sender: req.userId,
      type: req.file.mimetype.startsWith("image")
        ? "image"
        : "file",
      content: fileUrl,                 // ✅ NOW NEVER UNDEFINED
      fileName: req.file.originalname,
      fileSize: req.file.size,
    });

    const populated = await message.populate("sender", "name _id");

    getIO().to(channelId).emit("newChannelMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("sendChannelFile error:", err);
    res.status(500).json({ message: "Failed to send file" });
  }
};

exports.deleteChannelMessage = async (req, res) => {
  try {
    const msg = await ChannelMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // 🔥 try cloudinary delete, but NEVER block realtime
    if (msg.type !== "text" && msg.content) {
      try {
        const publicId = msg.content
          .split("/")
          .slice(-2)
          .join("/")
          .split(".")[0];

        await cloudinary.uploader.destroy(publicId, {
          resource_type: msg.type === "image" ? "image" : "raw",
        });
      } catch (err) {
        console.warn("Cloudinary delete failed (ignored)");
      }
    }

    await msg.deleteOne();

    // ✅ ALWAYS emit realtime delete
    getIO()
      .to(msg.channel.toString())
      .emit("deleteChannelMessage", msg._id);

    res.json({ success: true });
  } catch (err) {
    console.error("deleteChannelMessage error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};