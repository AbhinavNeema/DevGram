const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const blogController = require("../controllers/blogController");

router.post(
  "/",
  auth,
  upload.array("images", 5),
  blogController.createBlog
);

router.get("/", auth, blogController.getBlogs);
router.get("/user/:id", auth, blogController.getBlogsByUser);
module.exports = router;