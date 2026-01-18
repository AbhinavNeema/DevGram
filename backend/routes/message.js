const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/messageController");

router.get("/inbox", auth, ctrl.getInbox);
router.get("/:conversationId", auth, ctrl.getMessages);
router.post("/send", auth, ctrl.sendMessage);
router.get("/start/:userId", auth, ctrl.startConversation);
router.put("/read/:conversationId", auth, ctrl.markAsRead);
router.delete("/message/:id", auth, ctrl.deleteMessage);
router.put("/message/:id", auth, ctrl.editMessage);
module.exports = router;