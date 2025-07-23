const express = require("express");
const router = express.Router();
const Post = require("../models/Post");

// Create a post
router.post("/", async (req, res) => {
  try {
    const post = new Post(req.body);
    await post.save();
    res.status(201).json(post);
  } catch (err) {
    res.status(500).json({ error: "Error creating post" });
  }
});

// Get all posts (latest first)
router.get("/", async (req, res) => {
  try {
    const posts = await Post.find().sort({ createdAt: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: "Error fetching posts" });
  }
});

module.exports = router;
