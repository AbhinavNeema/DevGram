const User = require("../models/User");

module.exports = async function extractMentions(text) {
  const usernames = [...new Set(
    (text.match(/@(\w+)/g) || []).map(u => u.slice(1))
  )];

  if (usernames.length === 0) return [];

  const users = await User.find({ name: { $in: usernames } }).select("_id");
  return users.map(u => u._id);
};