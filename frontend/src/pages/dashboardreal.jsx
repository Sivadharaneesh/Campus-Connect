import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dash.css"; // Import your CSS file

function Dash() {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) {
      alert("Not logged in!");
      return;
    }

    fetch(`http://localhost:5000/api/dashboard/${email}`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => setUser(data))
      .catch((err) => console.error(err));
  }, []);

  if (!user) return <p className="loading">Loading...</p>;

  return (
    <div className="dash-card">
      <div className="profile-section">
        {user.image ? (
          <img src={user.image} alt="profile" className="profile-img" />
        ) : (
          <div className="no-img">No Image</div>
        )}
        <h1 className="username">Welcome {user.name || "User"}</h1>
      </div>

      <div className="info-section">
        <p><strong>Username:</strong> {user.username}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>DOB:</strong> {user.dob}</p>
        <p><strong>Phone:</strong> {user.phone}</p>
      </div>

      <button className="edit-btn" onClick={() => navigate("/dashedit")}>
        Edit Profile
      </button><br /><br />
      <button className="edit-btn" onClick={() => navigate("/d")}>
        Home
      </button>
    </div>
  );
}

export default Dash;
