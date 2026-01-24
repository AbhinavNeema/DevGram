const auth = require("../middleware/auth");

const express = require("express");
const router = express.Router();
const { search } = require("../controllers/searchController");

router.get("/",auth, search);

module.exports = router;
