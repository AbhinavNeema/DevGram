const router = require("express").Router();
const auth = require("../middleware/auth");
const ctrl = require("../controllers/messageController");

router.get("/inbox", auth, ctrl.getInbox);
router.get("/:conversationId", auth, ctrl.getMessages);
router.post("/send", auth, ctrl.sendMessage);
router.get("/start/:userId", auth, ctrl.startConversation);

module.exports = router;