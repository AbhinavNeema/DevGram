const router = require("express").Router();
const ctrl = require("../controllers/feedController");

router.get("/", ctrl.getFeed);

module.exports = router;