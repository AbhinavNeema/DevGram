const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/messageController");
const upload = require("../utils/upload");
router.get("/inbox", auth, ctrl.getInbox);
router.get("/:conversationId", auth, ctrl.getMessages);
router.post("/send", auth, ctrl.sendMessage);
router.get("/start/:userId", auth, ctrl.startConversation);
router.put("/read/:conversationId", auth, ctrl.markAsRead);
router.delete("/message/:id", auth, ctrl.deleteMessage);
router.put("/message/:id", auth, ctrl.editMessage);
router.post(
  "/dm/:conversationId/image",
  auth,
  upload.single("image"),
  ctrl.sendDMImage
);
module.exports = router;