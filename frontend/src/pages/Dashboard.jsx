import React, { useEffect, useState } from "react";
import axios from "axios";
import "./dashboard.css"; // ✅ Import CSS file
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const [profile, setProfile] = useState({
    name: "",
    username:"",
    email: "",
    dob: "",
    phone: "",
    image: ""
  });

  const navigate = useNavigate();  
  const [image, setImage] = useState(profile.image);

  const handleUpload = (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    setImage(reader.result); // for preview
    setProfile({ ...profile, ["image"]: reader.result }); // ✅ also save in profile
  };
  reader.readAsDataURL(file);
}; // runs whenever profile.name changes

useEffect(() => {
  const email = localStorage.getItem("email"); // replace with your auth logic
  if (!email) return; // No email, just exit

  axios
    .get(`http://localhost:5000/api/dashboard/${email}`)
    .then((res) => {
      if (res.data) {
        setProfile(res.data);
        setImage(res.data.image || "");
      } else {
        // If user not found, just set the email locally (no axios call for saving here)
        setProfile((prev) => ({ ...prev, email }));
      }
    })
    .catch((err) => {
      console.error("User not found:", err);
      // If 404 or not found, initialize profile with email only
      setProfile((prev) => ({ ...prev, email }));
    });
}, []);




  const handleChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handleSave = () => {
    axios
      .put("http://localhost:5000/api/user", profile)
      .then(() => alert("Profile updated!"))
      .catch((err) => alert(err));
  };


  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>User Dashboard</h1>
        {image ? (
          <img src={image} alt="uploaded" className="profile-image" />
        ) : (
          profile.image && <img src={profile.image} alt="profile" className="profile-image" />
        )}
      </div>

      <div className="form">
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={profile.name}
          onChange={handleChange}
        />
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          value={profile.username}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Enter email"
          value={profile.email}
          onChange={handleChange}
        />
        <input
          type="date"
          name="dob"
          value={profile.dob}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Enter phone"
          value={profile.phone}
          onChange={handleChange}
        />

        <label className="file-label">
          Upload Image:
          <input name="image" type="file" accept="image/*" onChange={handleUpload} />
        </label>

        <button className="save-btn" onClick={handleSave}>
          Save
        </button>
        <button className="save-btn" onClick={() => navigate("/dashboard")}>
          Back
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
