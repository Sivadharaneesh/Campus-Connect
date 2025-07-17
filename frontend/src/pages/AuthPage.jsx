import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../App.css";

function AuthPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");

  const navigate = useNavigate();

  const handleAuthSubmit = async (e) => {
    e.preventDefault();

    const url = tab === "login"
      ? "http://localhost:5000/api/auth/login"
      : "http://localhost:5000/api/auth/signup";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      alert(data.message || "Success");

      if (tab === "login" && res.ok) {
        navigate("/home");
      }
    } catch (err) {
      console.error(err);
      alert("Request failed");
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

        {tab === "forgot" ? (
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
        ) : (
          <form onSubmit={handleAuthSubmit}>
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
            <button type="submit">{tab === "login" ? "Login" : "Signup"}</button>
          </form>
        )}
      </div>
    </div>
  );
}

export default AuthPage;
