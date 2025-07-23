import React, { useState } from "react";

function SearchBar({ setSearchQuery }) {
  const [input, setInput] = useState("");

  const handleSearch = () => {
    setSearchQuery(input);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        placeholder="Search posts..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
      />
      <button onClick={handleSearch}>Search</button>
    </div>
  );
}

export default SearchBar;
