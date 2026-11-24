const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");

const {register,login,me,checkUsername} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);
router.get("/me", auth, me);
router.get("/check-username/:username", checkUsername);

module.exports = router;