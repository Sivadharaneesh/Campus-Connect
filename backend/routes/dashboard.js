const express = require("express");
const User2 = require("../models/User2");
const router = express.Router();

// Get dashboard data by email
router.get("/:email", async (req, res) => {
  try {
    const user = await User2.findOne({ email: req.params.email });
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Update dashboard data
router.put("/:email", async (req, res) => {
  try {
    let user = await User2.findOne({ email: req.params.email });
    if (!user) {
      user = new User2({ email: req.params.email, ...req.body });
    } else {
      Object.assign(user, req.body);
    }
    await user.save();
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
