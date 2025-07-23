import React from "react";

function PostCard({ post }) {
  return (
    <div style={{ border: "1px solid #ccc", padding: "1rem", marginBottom: "1rem" }}>
      <h3>{post.title}</h3>
      <p>{post.description}</p>
      <p>
        <strong>Room:</strong> {post.room} | <strong>By:</strong> {post.author}
      </p>
      <p>👍 {post.upvotes} | 💬 {post.comments.length}</p>
    </div>
  );
}

export default PostCard;
