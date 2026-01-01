const express = require("express");
const router = express.Router({ mergeParams: true }); // to access projectId from parent route
const { createComment, getComments } = require("../controllers/commentController");
const auth = require("../middleware/auth");

router.post("/", auth, createComment);

router.get("/", getComments);

module.exports = router;
