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

/* DELETE CHANNEL */
exports.deleteChannel = async (req, res) => {
  const { channelId } = req.params;

  await Channel.findByIdAndDelete(channelId);
  await ChannelMessage.deleteMany({ channel: channelId });

  res.json({ success: true });
};

/* GET WORKSPACE CHANNELS */
exports.getChannels = async (req, res) => {
  const { workspaceId } = req.params;

  const channels = await Channel.find({ workspace: workspaceId });
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

  const messages = await ChannelMessage.find({ channel: channelId })
    .populate("sender", "name")
    .sort({ createdAt: 1 });

  res.json(messages);
};