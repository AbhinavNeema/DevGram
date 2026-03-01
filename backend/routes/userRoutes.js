const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

const {
  toggleFollow,
  getUserProfile,
  updateUserProfile,
  getAllUsers,
  getUserByUsername,
  searchUsers
} = require("../controllers/userController");

router.get("/", auth, getAllUsers);
router.get("/search", auth, searchUsers);
router.get("/:id", auth, getUserProfile);

router.put(
  "/:id",
  auth,
  upload.single("profilePhoto"),
  updateUserProfile
);

router.put("/:id/follow", auth, toggleFollow);

router.get("/username/:username", getUserByUsername);

module.exports = router;