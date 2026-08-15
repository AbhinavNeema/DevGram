const router = require("express").Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const blog = require("../controllers/blogController");

// Create blog with images
router.post("/", auth, upload.array("images", 5), blog.createBlog);

// Get all blogs with pagination
router.get("/", auth, blog.getBlogs);

// Get blogs by user with pagination
router.get("/user/:id", auth, blog.getBlogsByUser);

// Get single blog by ID
router.get("/:id", auth, blog.getBlogById);

// Like/unlike blog
router.put("/:id/like", auth, blog.likeBlog);

// Add comment
router.post("/:id/comments", auth, blog.addComment);

// Delete comment
router.delete("/:blogId/comments/:commentId", auth, blog.deleteComment);

// Add view
router.post("/:id/view", auth, blog.addView);

// Update blog
router.put("/:id", auth, blog.updateBlog);

// Delete blog
router.delete("/:id", auth, blog.deleteBlog);

module.exports = router;