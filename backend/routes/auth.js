const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const User = require("../models/User");
const User2 = require("../models/User2");
require("dotenv").config();

const router = express.Router();

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.ADMIN_EMAIL,
    pass: process.env.ADMIN_EMAIL_PASSWORD,
  },
});

// Signup
router.post("/signup", async (req, res) => {
  const { username, email, password } = req.body;
  try {
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already exists" });

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const user = new User({
      email,
      username,
      password: hashedPassword,
      role: email === process.env.ADMIN_EMAIL ? "admin" : "user",
      verified: false,
      verificationToken,
    });
    await user.save();

    // 🔹 Create a dashboard entry for this user
    const dashboard = new User2({
      email,
      username,
      name: "",
      dob: "",
      phone: "",
      image: "",
    });
    await dashboard.save();

    const verifyURL = `http://localhost:5000/api/auth/verify/${verificationToken}`;

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Click <a href="${verifyURL}">here</a> to verify your email.</p>`,
    });

    res.status(201).json({ message: "Signup successful. Check email to verify." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});


// Verify Email
router.get("/verify/:token", async (req, res) => {
  try {
    const user = await User.findOne({ verificationToken: req.params.token });
    if (!user) return res.status(400).send("Invalid or expired token");

    user.verified = true;
    user.verificationToken = undefined;
    await user.save();

    res.send("Email verified successfully.");
  } catch (error) {
    res.status(500).send(error.message);
  }
});

// Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid email or password" });

    if (!user.verified) {
      return res.status(401).json({ message: "Please verify your email first." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid email or password" });

// after you have `user` from DB
const token1 = jwt.sign(
  { id: user._id, role: user.role, email: user.email }, // ⬅️ also include email in payload
  process.env.JWT_SECRET,
  { expiresIn: "1h" }
);

const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin }, 
      process.env.JWT_SECRET, 
      { expiresIn: '7d' }
    );

res.json({
  message: "Login successful",
  token1,
  token,
  role: user.role,
  email: user.email, // ⬅️ return email to frontend
});


  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Forgot Password
router.post("/forgot-password", async (req, res) => {
  const { email } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    const token = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;
    await user.save();

    const resetURL = `http://localhost:3000/reset-password/${token}`;

    await transporter.sendMail({
      from: process.env.ADMIN_EMAIL,
      to: email,
      subject: "Password Reset",
      html: `<p>Click <a href="${resetURL}">here</a> to reset your password. Valid for 1 hour.</p>`,
    });

    res.json({ message: "Password reset email sent." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reset Password
router.post("/reset-password/:token", async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;
  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired token" });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    res.json({ message: "Password has been reset successfully." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
