const mongoose = require("mongoose");
require("dotenv").config();
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI);

const users = Array.from({ length: 10 }).map((_, i) => ({
  name: `Dummy User ${i + 1}`,
  email: `dummy${i + 1}@devgram.com`,
  password: "dummy123", // hashed or not doesn't matter for testing
  username: `dummyuser${i + 1}`,
  bio: "Test user",
  techStack: ["react", "node"]
}));

(async () => {
  try {
    await User.insertMany(users, { ordered: false });
    console.log("✅ 10 Dummy users created");
  } catch (err) {
    console.error("⚠️ Some users may already exist:", err.message);
  } finally {
    process.exit();
  }
})();