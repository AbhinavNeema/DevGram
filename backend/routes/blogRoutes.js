const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const blog = require("../controllers/blogController");

router.post("/", auth, upload.array("images", 5), blog.createBlog);
router.get("/", auth, blog.getBlogs);
router.get("/:id", auth, blog.getBlogById);

router.put("/:id/like", auth, blog.likeBlog);
router.post("/:id/comments", auth, blog.addComment);
router.delete("/:blogId/comments/:commentId", auth, blog.deleteComment);

router.put("/:id", auth, blog.updateBlog);
router.delete("/:id", auth, blog.deleteBlog);
router.get("/user/:id", auth, blog.getBlogsByUser);
module.exports = router;