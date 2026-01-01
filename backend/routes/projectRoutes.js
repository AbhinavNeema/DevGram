const express = require("express");
const router = express.Router();

const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const projectController = require("../controllers/projectController");

router.post(
  "/",
  auth,
  upload.array("images", 5),
  projectController.createProject
);

router.get("/feed", auth, projectController.getPersonalizedFeed);
router.get("/trending", auth, projectController.getTrendingProjects);
router.get("/", auth, projectController.getProjects);

router.get("/:id", auth, projectController.getProjectById);

router.put("/:id/like", auth, projectController.likeProject);
router.post("/:id/view", auth, projectController.addView);

router.post("/:id/comments", auth, projectController.addComment);
router.delete(
  "/:projectId/comments/:commentId",
  auth,
  projectController.deleteComment
);

router.put("/:id", auth, projectController.updateProject);
router.delete("/:id", auth, projectController.deleteProject);

module.exports = router;