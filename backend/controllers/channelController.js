const { getIO } = require("../socket");
const Channel = require("../models/Channel");
const Workspace = require("../models/Workspace");
const ChannelMessage = require("../models/ChannelMessage");
const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const checkChannelAdminOrOwner = async (channelId, userId) => {
  const channel = await Channel.findById(channelId);
  if (!channel) {
    return { allowed: false, status: 404, message: "Channel not found", channel: null };
  }

  const workspace = await Workspace.findById(channel.workspace);
  if (!workspace) {
    return { allowed: false, status: 404, message: "Workspace not found", channel };
  }

  const member = workspace.members.find(
    (m) => m.user && m.user.toString() === userId
  );

  if (!member || !["owner", "admin"].includes(member.role)) {
    return {
      allowed: false,
      status: 403,
      message: "Only workspace admins or owner can manage channels",
      channel,
      workspace,
    };
  }

  return { allowed: true, channel, workspace };
};

/* CREATE CHANNEL */
exports.createChannel = async (req, res) => {
  try {
    const { workspaceId } = req.params;
    const { name } = req.body;

    const workspace = await Workspace.findById(workspaceId);
    if (!workspace) return res.status(404).json({ message: "Workspace not found" });

    const isMember = workspace.members.some(
      (m) => m.user && m.user.toString() === req.userId
    );
    if (!isMember) {
      return res.status(403).json({ message: "Not a workspace member" });
    }

    const channel = await Channel.create({
      name,
      workspace: workspaceId,
      members: workspace.members.map((m) => m.user),
      createdBy: req.userId,
    });

    res.json(channel);
  } catch (err) {
    console.error("createChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

/* GET WORKSPACE CHANNELS */
exports.getChannels = async (req, res) => {
  try {
    const { workspaceId } = req.params;

    const channels = await Channel.find({
      workspace: workspaceId,
      members: req.userId,
    });

    res.json(channels);
  } catch (err) {
    console.error("getChannels error:", err);
    res.status(500).json({ message: "Server error" });
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

    const isMember = channel.members.some((m) => m.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this channel" });
    }

    const msg = await ChannelMessage.create({
      channel: channelId,
      sender: req.userId,
      type: "text",
      content: content.trim(),
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
  try {
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
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.updateChannel = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { name, description } = req.body;

    const authCheck = await checkChannelAdminOrOwner(channelId, req.userId);
    if (!authCheck.allowed) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    const channel = await Channel.findByIdAndUpdate(
      channelId,
      { name, description },
      { new: true }
    );

    res.json(channel);
  } catch (err) {
    console.error("updateChannel error:", err);
    res.status(500).json({ message: "Failed to update channel" });
  }
};

exports.addMember = async (req, res) => {
  try {
    const { channelId } = req.params;
    const { userId } = req.body;

    const authCheck = await checkChannelAdminOrOwner(channelId, req.userId);
    if (!authCheck.allowed) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    await Channel.findByIdAndUpdate(channelId, {
      $addToSet: { members: userId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("addMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.removeMember = async (req, res) => {
  try {
    const { channelId, userId } = req.params;

    const authCheck = await checkChannelAdminOrOwner(channelId, req.userId);
    if (!authCheck.allowed) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    await Channel.findByIdAndUpdate(channelId, {
      $pull: { members: userId },
    });

    res.json({ success: true });
  } catch (err) {
    console.error("removeMember error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.deleteChannel = async (req, res) => {
  try {
    const { channelId } = req.params;

    const authCheck = await checkChannelAdminOrOwner(channelId, req.userId);
    if (!authCheck.allowed) {
      return res.status(authCheck.status).json({ message: authCheck.message });
    }

    const channel = authCheck.channel;

    if (channel.name === "general") {
      return res.status(400).json({ message: "Cannot delete general channel" });
    }

    await ChannelMessage.deleteMany({ channel: channel._id });
    await channel.deleteOne();
    res.json({ success: true });
  } catch (err) {
    console.error("deleteChannel error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "devgram/channels",
    resource_type: "auto",
    allowed_formats: [
      "jpg",
      "jpeg",
      "png",
      "webp",
      "gif",
      "pdf",
      "zip",
      "txt",
      "json",
      "js",
      "ts",
      "py",
      "doc",
      "docx",
      "ppt",
      "pptx",
      "xls",
      "xlsx",
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

    const channel = await Channel.findById(channelId);
    if (!channel) {
      return res.status(404).json({ message: "Channel not found" });
    }

    const isMember = channel.members.some((m) => m.toString() === req.userId);
    if (!isMember) {
      return res.status(403).json({ message: "Not a member of this channel" });
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

    const channel = await Channel.findById(msg.channel);
    if (!channel) return res.status(404).json({ message: "Channel not found" });

    const workspace = await Workspace.findById(channel.workspace);
    const memberRecord = workspace?.members.find(
      (m) => m.user && m.user.toString() === req.userId
    );
    const isAdminOrOwner =
      memberRecord && ["owner", "admin"].includes(memberRecord.role);
    const isSender = msg.sender.toString() === req.userId;

    if (!isSender && !isAdminOrOwner) {
      return res.status(403).json({ message: "Not allowed to delete this message" });
    }

    // try cloudinary delete, but NEVER block realtime
    if (msg.type !== "text" && msg.content) {
      try {
        const publicId = msg.content
          .split("/")
          .slice(-3)
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

    getIO()
      .to(msg.channel.toString())
      .emit("deleteChannelMessage", msg._id);

    res.json({ success: true });
  } catch (err) {
    console.error("deleteChannelMessage error:", err);
    res.status(500).json({ message: "Failed to delete message" });
  }
};