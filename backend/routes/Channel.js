const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/channelController");

router.post("/:workspaceId", auth, ctrl.createChannel);
router.get("/:workspaceId", auth, ctrl.getChannels);

router.put("/:channelId", auth, ctrl.updateChannel);
router.post("/:channelId/members", auth, ctrl.addMember);
router.delete("/:channelId/members/:userId", auth, ctrl.removeMember);
router.delete("/:channelId", auth, ctrl.deleteChannel);
router.get("/messages/:channelId", auth, ctrl.getMessages);
router.post("/messages/:channelId", auth, ctrl.sendMessage);

module.exports = router;