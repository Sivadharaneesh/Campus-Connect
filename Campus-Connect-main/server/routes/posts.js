const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../middleware/upload');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const admin = require('../middleware/admin'); // <--- add this line


// Create a new post with file upload
router.post('/', auth, upload.single('media'), async (req, res) => {
  try {
    const { title, content } = req.body;
    
    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    let media = null;
    let mediaType = 'none';

    if (req.file) {
      media = `/uploads/${req.file.filename}`;
      mediaType = req.file.mimetype.startsWith('image/') ? 'image' : 'video';
    }

    const post = new Post({
      title,
      content,
      media,
      mediaType,
      author: req.user.id
    });

    await post.save();
    await post.populate('author', 'username');
    
    res.status(201).json(post);
  } catch (error) {
    console.error('Error creating post:', error);
    res.status(500).json({ error: 'Server error: ' + error.message });
  }
});



// Get all posts or search posts
router.get('/', auth, async (req, res) => {
  try {
    const { search } = req.query;

    let query = {};

    if (search) {
      // Case-insensitive search on title or content
      query = {
        $or: [
          { title: { $regex: search, $options: 'i' } },
          { content: { $regex: search, $options: 'i' } }
        ]
      };
    }

    const posts = await Post.find(query)
      .populate('author', 'username')
      .sort({ createdAt: -1 });

    res.json(posts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Edit a post (author or admin)
router.put('/:id', auth, async (req, res) => {
  try {
    const { title, content } = req.body;

    // Find the post
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Only author or admin can edit
    if (post.author.toString() !== req.user.id && !req.user.isAdmin) {
      return res.status(403).json({ error: 'You do not have permission to edit this post' });
    }

    // Update fields if provided
    if (title) post.title = title;
    if (content) post.content = content;

    await post.save();
    await post.populate('author', 'username');

    res.json(post);
  } catch (error) {
    console.error('Error editing post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Upvote a post
router.post('/:id/upvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove from downvotes if exists
    const downvoteIndex = post.downvotes.indexOf(req.user.id);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    }
    
    // Toggle upvote
    const upvoteIndex = post.upvotes.indexOf(req.user.id);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    } else {
      post.upvotes.push(req.user.id);
    }
    
    post.score = post.upvotes.length - post.downvotes.length;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error upvoting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Downvote a post
router.post('/:id/downvote', auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    
    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    // Remove from upvotes if exists
    const upvoteIndex = post.upvotes.indexOf(req.user.id);
    if (upvoteIndex > -1) {
      post.upvotes.splice(upvoteIndex, 1);
    }
    
    // Toggle downvote
    const downvoteIndex = post.downvotes.indexOf(req.user.id);
    if (downvoteIndex > -1) {
      post.downvotes.splice(downvoteIndex, 1);
    } else {
      post.downvotes.push(req.user.id);
    }
    
    post.score = post.upvotes.length - post.downvotes.length;
    await post.save();
    
    res.json(post);
  } catch (error) {
    console.error('Error downvoting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});
// Delete a post (admin only)
// Delete a post (admin only)
router.delete('/:id', auth, admin, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ error: 'Post not found' });
    }

    await Post.findByIdAndDelete(req.params.id);

    // Optionally, delete all comments related to this post
    await Comment.deleteMany({ post: req.params.id });

    res.json({ message: 'Post deleted successfully' });
  } catch (error) {
    console.error('Error deleting post:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;