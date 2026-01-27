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
  const { channelId } = req.params;
  const { text } = req.body;

  const msg = await ChannelMessage.create({
    channel: channelId,
    sender: req.userId,
    text,
  });

  const populated = await msg.populate("sender", "name");
  res.json(populated);
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