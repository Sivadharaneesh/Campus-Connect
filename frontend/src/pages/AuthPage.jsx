import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from '../contexts/AuthContext';
import "../App.css";

function AuthPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("eggyolk2005@gmail.com");
  const [password, setPassword] = useState("iam1234");
  const [resetEmail, setResetEmail] = useState("");
  const [username, setUsername] = useState("");
  const { login } = useAuth();
  const { register } = useAuth();
  const navigate = useNavigate();

 const handleLogin = async (e) => {
  e.preventDefault();

  try {
    const result = await login(email, password);
    const res = await fetch("http://localhost:5000/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    alert(data.message || "Login successful");

    if (res.ok) {
      localStorage.setItem("token", data.token);
      localStorage.setItem("email", data.email);
      navigate("/d");
    }
  } catch (err) {
    console.error(err);
    alert("Login request failed");
  }
};

const handleSignup = async (e) => {
  e.preventDefault();

  try {
    const result = await register(username, email, password);
    const res = await fetch("http://localhost:5000/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });

    const data = await res.json();
    alert(data.message || "Signup successful");

    if (res.ok) {
      // you can auto-login or just redirect to login page
      navigate("/login");
    }
  } catch (err) {
    console.error(err);
    alert("Signup request failed");
  }
};



  const handleForgotPassword = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:5000/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: resetEmail }),
      });

      const data = await res.json();
      alert(data.message || "If the email exists, a reset link has been sent.");
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-box">
        <div className="tab-buttons">
          <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Login</button>
          <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Signup</button>
          <button className={tab === "forgot" ? "active" : ""} onClick={() => setTab("forgot")}>Forgot Password</button>
        </div>

        {tab === "forgot" && (
  <form onSubmit={handleForgotPassword}>
    <input
      type="email"
      placeholder="Enter your email"
      value={resetEmail}
      onChange={(e) => setResetEmail(e.target.value)}
      required
    />
    <button type="submit">Send Reset Link</button>
  </form>
)}

{tab === "login" && (
  <form onSubmit={handleLogin}>
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Login</button>
  </form>
)}

{tab === "signup" && (
  <form onSubmit={handleSignup}>
    <input
      type="text"
      placeholder="Username"
      value={username}
      onChange={(e) => setUsername(e.target.value)}
      required
    />
    <input
      type="email"
      placeholder="Email"
      value={email}
      onChange={(e) => setEmail(e.target.value)}
      required
    />
    <input
      type="password"
      placeholder="Password"
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      required
    />
    <button type="submit">Signup</button>
  </form>
)}

      </div>
    </div>
  );
}

export default AuthPage;
