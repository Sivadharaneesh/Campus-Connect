import React, { useState, useEffect } from "react";
import "../Auth.css";

function HomePage() {
  // Sample post data
  const samplePosts = [
    {
      id: 1,
      title: "Join AI Hackathon!",
      description: "Looking for teammates to build an AI project.",
      room: "Hackathon",
      author: "Alice",
      upvotes: 12,
      comments: 3,
    },
    {
      id: 2,
      title: "Web Dev Club Meetup",
      description: "Discussing front-end tools and trends.",
      room: "Club",
      author: "Bob",
      upvotes: 8,
      comments: 1,
    },
    {
      id: 3,
      title: "React Project Collaboration",
      description: "Need help with a college portal built in React.",
      room: "Project",
      author: "Charlie",
      upvotes: 15,
      comments: 5,
    },
  ];

  const [posts, setPosts] = useState(samplePosts);
  const [filter, setFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredPosts, setFilteredPosts] = useState(samplePosts);

  useEffect(() => {
    let filtered = samplePosts;

    if (filter !== "all") {
      filtered = filtered.filter((post) => post.room === filter);
    }

    if (searchQuery.trim() !== "") {
      filtered = filtered.filter((post) =>
        post.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPosts(filtered);
  }, [filter, searchQuery]);

  return (
    <div style={{ padding: "2rem" }}>
      <h1>Welcome to Campus Connect</h1>

      {/* Search Bar */}
      <div style={{ marginBottom: "1rem" }}>
        <input
          type="text"
          placeholder="Search posts..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ padding: "0.5rem", width: "250px" }}
        />
      </div>

      {/* Filter Dropdown */}
      <div style={{ marginBottom: "1rem" }}>
        <label>Filter by Room: </label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{ padding: "0.5rem" }}
        >
          <option value="all">All</option>
          <option value="Hackathon">Hackathon</option>
          <option value="Club">Club</option>
          <option value="Project">Project</option>
        </select>
      </div>

      {/* Posts List */}
      {filteredPosts.length === 0 ? (
        <p>No posts found.</p>
      ) : (
        filteredPosts.map((post) => (
          <div
            key={post.id}
            style={{
              border: "1px solid #ccc",
              padding: "1rem",
              marginBottom: "1rem",
              borderRadius: "8px",
            }}
          >
            <h3>{post.title}</h3>
            <p>{post.description}</p>
            <p>
              <strong>Room:</strong> {post.room} | <strong>By:</strong>{" "}
              {post.author}
            </p>
            <p>
              👍 {post.upvotes} | 💬 {post.comments}
            </p>
          </div>
        ))
      )}
    </div>
  );
}

export default HomePage;
