import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import CommentSection from './CommentSection';

const PostItem = ({ post, onVote, onComment, onPostDeleted, onPostEdited }) => {
  const [showComments, setShowComments] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title);
  const [editContent, setEditContent] = useState(post.content || '');
  const { currentUser } = useAuth();

  const canEdit = currentUser && (post.author._id === currentUser.id || currentUser.isAdmin);

  const handleVote = async (type) => {
    onVote(post._id, type);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this post?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`/api/posts/${post._id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        onPostDeleted(post._id);
      } else {
        const text = await response.text();
        let errorMsg = 'Failed to delete post';
        if (text) {
          try {
            const data = JSON.parse(text);
            errorMsg = data.error || errorMsg;
          } catch {}
        }
        alert(errorMsg);
      }
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Error deleting post. See console for details.');
    }
  };

  const handleEditSubmit = async () => {
    try {
      const token = localStorage.getItem('token');
      const postId = post._id || post.id;
      const response = await fetch(`/api/posts/${postId}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ title: editTitle, content: editContent }),
      });

      if (response.ok) {
        const updatedPost = await response.json();
        onPostEdited(updatedPost);
        setIsEditing(false);
      } else {
        alert('Failed to edit post.');
      }
    } catch (error) {
      console.error('Error editing post:', error);
      alert('Error editing post. See console for details.');
    }
  };

  const hasUpvoted = currentUser && post.upvotes.includes(currentUser.id);
  const hasDownvoted = currentUser && post.downvotes.includes(currentUser.id);

  return (
    <div className="post-item card">
      <div className="post-votes">
        <button className={`upvote ${hasUpvoted ? 'active' : ''}`} onClick={() => handleVote('upvote')}>
          ▲
        </button>
        <span className="score">{post.score}</span>
        <button className={`downvote ${hasDownvoted ? 'active' : ''}`} onClick={() => handleVote('downvote')}>
          ▼
        </button>
      </div>

      <div className="post-content">
        {isEditing ? (
          <div className="edit-form">
            <input
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            <button onClick={handleEditSubmit} style={{ marginRight: '0.5rem' }}>
              💾 Save
            </button>
            <button onClick={() => setIsEditing(false)}>❌ Cancel</button>
          </div>
        ) : (
          <>
            <h1>{post.title}</h1>
            {post.content && <h3>{post.content}</h3>}
          </>
        )}

        <div className="post-media-container">
          {post.media && post.mediaType === 'image' && <img src={post.media} alt="Post media" className="post-media" />}
          {post.media && post.mediaType === 'video' && (
            <video controls className="post-media">
              <source src={post.media} type="video/mp4" />
            </video>
          )}
        </div>

        <div className="post-meta">
          <span>Posted by {post.author.username}</span>
          <span>{new Date(post.createdAt).toLocaleDateString()}</span>
        </div>

        <div className="post-actions">
          <button onClick={() => setShowComments(!showComments)}>💬 Comments</button>
          {canEdit && !isEditing && (
            <button onClick={() => setIsEditing(true)} style={{ marginLeft: '10px' }}>
              ✏️ Edit
            </button>
          )}
          {currentUser?.isAdmin && (
            <button onClick={handleDelete} className="delete-btn" style={{ marginLeft: '10px', color: 'red' }}>
              🗑 Delete
            </button>
          )}
        </div>

        {showComments && <CommentSection postId={post._id} />}
      </div>
    </div>
  );
};

export default PostItem;
