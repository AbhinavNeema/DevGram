const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields required" });
    }

    if (!/^[a-z0-9_.]+$/.test(username)) {
      return res.status(400).json({ message: "Invalid username format" });
    }

    const usernameExists = await User.findOne({ username });
    if (usernameExists) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      username,
      password: hashedPassword
    });

    // 🔐 NEW JWT FORMAT
    const token = jwt.sign(
      {
        iss: "devgram",
        sub: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        username: user.username,
        email: user.email
      }
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists" });
    }

    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 🔐 NEW JWT FORMAT
    const token = jwt.sign(
      {
        iss: "devgram",
        sub: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name
      },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        username: user.username
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    res.json(user);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const rawUsername = req.params.username;
    if (!rawUsername) {
      return res.status(400).json({ available: false });
    }

    const username = rawUsername.toLowerCase();

    if (!/^[a-z0-9_.]+$/.test(username)) {
      return res.status(400).json({ available: false });
    }

    const exists = await User.findOne({ username });
    res.json({ available: !exists });
  } catch {
    res.status(500).json({ available: false });
  }
};