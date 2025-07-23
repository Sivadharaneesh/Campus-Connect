import React from "react";

function FilterBar({ setFilter }) {
  const handleChange = (e) => {
    setFilter(e.target.value);
  };

  return (
    <div style={{ marginBottom: "1rem" }}>
      <select onChange={handleChange}>
        <option value="all">All</option>
        <option value="Hackathon">Hackathon</option>
        <option value="Club">Club</option>
        <option value="Project">Project</option>
        <option value="Event">Event</option>
      </select>
    </div>
  );
}

export default FilterBar;
