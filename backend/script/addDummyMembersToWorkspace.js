const mongoose = require("mongoose");
require("dotenv").config();
const Workspace = require("../models/Workspace");
const User = require("../models/User");

mongoose.connect(process.env.MONGO_URI);

const WORKSPACE_ID = "6977858a5438e58361b7ed82";

(async () => {
  const users = await User.find({ email: /dummy/ }).limit(10);

  const members = users.map(u => ({
    user: u._id,
    role: "member"
  }));

  await Workspace.findByIdAndUpdate(WORKSPACE_ID, {
    $push: { members: { $each: members } }
  });

  console.log("✅ Dummy users added to workspace");
  process.exit();
})();