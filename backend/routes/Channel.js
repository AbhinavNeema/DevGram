const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/channelController");
const uploadChannelFile = require("../utils/channelUpload");

// Create channel in workspace
router.post("/:workspaceId", auth, ctrl.createChannel);

// Get all channels in workspace
router.get("/:workspaceId", auth, ctrl.getChannels);

// Update channel
router.put("/:channelId", auth, ctrl.updateChannel);

// Add member to channel
router.post("/:channelId/members", auth, ctrl.addMember);

// Remove member from channel
router.delete("/:channelId/members/:userId", auth, ctrl.removeMember);

// Delete channel
router.delete("/:channelId", auth, ctrl.deleteChannel);

// Get channel messages
router.get("/messages/:channelId", auth, ctrl.getMessages);

// Send channel message
router.post("/messages/:channelId", auth, ctrl.sendMessage);

// Upload file to channel
router.post("/:channelId/file", auth, uploadChannelFile.single("file"), ctrl.sendChannelFile);

// Delete channel message
router.delete("/message/:id", auth, ctrl.deleteChannelMessage);

module.exports = router;