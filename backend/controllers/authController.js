const User = require("../models/User");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    if (password.length < 8) {
      return res.status(400).json({ message: "Password must be at least 8 characters long" });
    }

    const normalizedUsername = username.toLowerCase().trim();
    if (normalizedUsername.length < 3 || !/^[a-z0-9_.]+$/.test(normalizedUsername)) {
      return res.status(400).json({
        message: "Username must be at least 3 characters and contain only letters, numbers, underscores, and dots",
      });
    }

    const usernameExists = await User.findOne({ username: normalizedUsername });
    if (usernameExists) {
      return res.status(409).json({ message: "Username already taken" });
    }

    const emailExists = await User.findOne({ email: normalizedEmail });
    if (emailExists) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      username: normalizedUsername,
      password: hashedPassword,
    });

    // 🔐 JWT FORMAT
    const token = jwt.sign(
      {
        iss: "devgram",
        sub: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
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
        email: user.email,
      },
    });
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ message: "Username or email already exists" });
    }
    console.error("Register error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password required" });
    }

    const normalizedEmail = email.toLowerCase().trim();
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // 🔐 JWT FORMAT
    const token = jwt.sign(
      {
        iss: "devgram",
        sub: user._id.toString(),
        email: user.email,
        username: user.username,
        name: user.name,
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
        username: user.username,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(req.userId).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found" });
    }
    res.json(user);
  } catch (err) {
    console.error("Me error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

exports.checkUsername = async (req, res) => {
  try {
    const rawUsername = req.params.username;
    if (!rawUsername) {
      return res.status(400).json({ available: false });
    }

    const username = rawUsername.toLowerCase().trim();

    if (username.length < 3 || !/^[a-z0-9_.]+$/.test(username)) {
      return res.status(400).json({ available: false });
    }

    const exists = await User.findOne({ username });
    res.json({ available: !exists });
  } catch (err) {
    console.error("Check username error:", err);
    res.status(500).json({ available: false });
  }
};