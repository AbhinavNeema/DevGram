const router = require("express").Router();
const auth = require("../middleware/auth");
const feedController = require("../controllers/feedController");

router.get("/", auth, feedController.getFeed);

module.exports = router;