const express = require("express");
const router = express.Router();
const User = require("../models/User2");

router.get("/", async (_req, res) => {
  try {
    let user = await User.findOne();
    if (!user) {
      user = new User();
      await user.save();
    }
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put("/", async (req, res) => {
  try {
    const { email } = req.body;
    let user = await User.findOne({email});
    if (!user) {
      user = new User(req.body);
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
