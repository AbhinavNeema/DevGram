const { getIO } = require("../socket");
const Channel = require("../models/Channel");
const Workspace = require("../models/Workspace");
const ChannelMessage = require("../models/ChannelMessage");
const cloudinary = require("../utils/cloudinary");

// Constants
const GENERAL_CHANNEL_NAME = "general";

/* CREATE CHANNEL */
exports.createChannel = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name, description = "" } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ message: "Channel name is required" });
    }

    // Validate channel name format
    const normalizedName = name.toLowerCase().trim().replace(/\s+/g, "-");
    if (!/^[a-z0-9-]+$/.test(normalizedName)) {
      return res.status(400).json({
        message: "Channel name can only contain lowercase letters, numbers, and hyphens",
      });
    }

    if (normalizedName.length > 50) {
      return res.status(400).json({ message: "Channel name too long" });
    }

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) {
      return res.status(404).json({ message: "Workspace not found" });
    }

    // Check if channel already exists
    const existingChannel = await Channel.findOne({
      workspace: workspaceId,
      name: normalizedName,
    });
    if (existingChannel) {
      return res.status(409).json({ message: "Channel already exists" });
    }

    // Check user permission (must be owner or admin)
    const member = workspace.members.find(
      m => m.user.toString() === req.userId
    );
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized to create channels" });
    }

    const channel = await Channel.create({
      name: normalizedName,
      description,
      workspace: workspaceId,
      members: workspace.members.map(m => m.user),
      createdBy: req.userId,
    });

    res.status(201).json(channel);
  } catch (err) {
    console.error("Create channel error:", err);
    res.status(500).json({ message: "Failed to create channel" });
  }
};

/* GET WORKSPACE CHANNELS */
exports.getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const channels = await Channel.find({
      workspace: workspaceId,
      members: req.userId,
    }).sort({ name: 1 });

    res.json(channels);
  } catch (err) {
    console.error("Get channels error:", err);
    res.status(500).json({ message: "Failed to get channels" });
  }
};

/* GET CHANNEL MESSAGES */
exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { limit = 50, before } = req.query;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check membership
    if (!channel.members.map(String).includes(req.userId)) {
      return res.status(403).json({ message: "Access denied" });
    }

    const query = { channel: channelId };
    if (before) {
      query.createdAt = { $lt: new Date(before) };
    }

    const messages = await ChannelMessage.find(query)
      .populate("sender", "name username profilePhoto")
      .sort({ createdAt: -1 })
      .limit(parseInt(limit));

    // Reverse for chronological order
    const sortedMessages = messages.reverse();

    res.json(sortedMessages);
  } catch (err) {
    console.error("Get messages error:", err);
    res.status(500).json({ message: "Failed to get messages" });
  }
};

/* SEND MESSAGE */
exports.sendMessage = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({ message: "Message content required" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check membership
    if (!channel.members.map(String).includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const msg = await ChannelMessage.create({
      channel: channelId,
      sender: req.userId,
      type: "text",
      content: content.trim(),
    });

    const populated = await msg.populate("sender", "name username profilePhoto");

    getIO().to(channelId).emit("newChannelMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("Send message error:", err);
    res.status(500).json({ message: "Failed to send message" });
  }
};

/* UPDATE CHANNEL */
exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check permission
    const workspace = await Workspace.findById(channel.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    if (name) {
      const normalizedName = name.toLowerCase().trim().replace(/\s+/g, "-");
      channel.name = normalizedName;
    }
    if (description !== undefined) {
      channel.description = description;
    }

    await channel.save();

    res.json(channel);
  } catch (err) {
    console.error("Update channel error:", err);
    res.status(500).json({ message: "Failed to update channel" });
  }
};

/* ADD MEMBER TO CHANNEL */
exports.addMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({ message: "User ID required" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check permission
    const workspace = await Workspace.findById(channel.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Add member if not already present
    if (!channel.members.map(String).includes(userId)) {
      channel.members.push(userId);
      await channel.save();
    }

    res.json({ success: true, members: channel.members });
  } catch (err) {
    console.error("Add member error:", err);
    res.status(500).json({ message: "Failed to add member" });
  }
};

/* REMOVE MEMBER FROM CHANNEL */
exports.removeMember = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check permission
    const workspace = await Workspace.findById(channel.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot remove from general channel
    if (channel.name === GENERAL_CHANNEL_NAME) {
      return res.status(400).json({ message: "Cannot modify general channel" });
    }

    channel.members = channel.members.filter(m => m.toString() !== userId);
    await channel.save();

    res.json({ success: true, members: channel.members });
  } catch (err) {
    console.error("Remove member error:", err);
    res.status(500).json({ message: "Failed to remove member" });
  }
};

/* DELETE CHANNEL */
exports.deleteChannel = async (req, res) => {
  try {
    const channel = await Channel.findById(req.params.channelId);

    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check permission
    const workspace = await Workspace.findById(channel.workspace);
    const member = workspace?.members.find(m => m.user.toString() === req.userId);
    if (!member || !["owner", "admin"].includes(member.role)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Cannot delete general channel
    if (channel.name === GENERAL_CHANNEL_NAME) {
      return res.status(400).json({
        message: "Cannot delete the general channel. Delete the workspace instead.",
      });
    }

    // Delete all messages in channel
    await ChannelMessage.deleteMany({ channel: channel._id });

    await channel.deleteOne();

    res.json({ success: true });
  } catch (err) {
    console.error("Delete channel error:", err);
    res.status(500).json({ message: "Failed to delete channel" });
  }
};

/* UPLOAD CHANNEL FILE */
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devgram/channels",
    resource_type: "auto",
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
  fileFilter: (req, file, cb) => {
    // Validate file type
    const allowedMimes = [
      "image/jpeg", "image/png", "image/gif", "image/webp",
      "application/pdf", "application/zip",
      "text/plain", "application/json",
      "application/javascript", "text/x-python",
      "application/msword",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    ];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"), false);
    }
  },
});

exports.uploadChannelFile = upload;

/* SEND CHANNEL FILE */
exports.sendChannelFile = async (req, res) => {
  try {
    const { channelId } = req.params;

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    // Check membership
    if (!channel.members.map(String).includes(req.userId)) {
      return res.status(403).json({ message: "Not authorized" });
    }

    const fileUrl = req.file.secure_url || req.file.path || req.file.url;
    if (!fileUrl) {
      console.error("Cloudinary file object:", req.file);
      return res.status(500).json({ message: "File URL missing" });
    }

    const message = await ChannelMessage.create({
      channel: channelId,
      sender: req.userId,
      type: req.file.mimetype.startsWith("image") ? "image" : "file",
      content: fileUrl,
      fileMeta: {
        name: req.file.originalname,
        size: req.file.size,
        mime: req.file.mimetype,
      },
    });

    const populated = await message.populate("sender", "name username profilePhoto");

    getIO().to(channelId).emit("newChannelMessage", populated);

    res.status(201).json(populated);
  } catch (err) {
    console.error("Send channel file error:", err);
    res.status(500).json({ message: "Failed to send file" });
  }
};

/* DELETE CHANNEL MESSAGE */
exports.deleteChannelMessage = async (req, res) => {
  try {
    const msg = await ChannelMessage.findById(req.params.id);
    if (!msg) return res.status(404).json({ message: "Message not found" });

    // Only sender can delete
    if (msg.sender.toString() !== req.userId) {
      return res.status(403).json({ message: "Not authorized" });
    }

    // Try to delete file from cloudinary
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
        console.warn("Cloudinary delete failed (ignored):", err.message);
      }
    }

    await msg.deleteOne();

    getIO().to(msg.channel.toString()).emit("deleteChannelMessage", msg._id);

    res.json({ success: true });
  } catch (err) {
    console.error("Delete channel message error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};