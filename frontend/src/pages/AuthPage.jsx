import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "../Auth.css";


function AuthPage() {
  const [tab, setTab] = useState("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [resetEmail, setResetEmail] = useState("");
  const [theme, setTheme] = useState("dark");

  const navigate = useNavigate();

  useEffect(() => {
    document.body.className = theme; // set body class to theme
  }, [theme]);

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
    <>
      {/* 🌗 Theme Toggle Button */}
      <button
        className="theme-toggle"
        onClick={() => setTheme(theme === "light" ? "dark" : "light")}
      >
        {theme === "light" ? "Dark Mode" : "Light Mode"}
      </button>

      <div className="auth-container">
        <div className="auth-box">
          <div className="tab-buttons">
            <button className={tab === "login" ? "active" : ""} onClick={() => setTab("login")}>Login</button>
            <button className={tab === "signup" ? "active" : ""} onClick={() => setTab("signup")}>Signup</button>
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
              <p onClick={() => setTab("login")} className="back-to-login">Back to Login</p>
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
              {tab === "login" && (
              <p className="forgot-link" onClick={() => setTab("forgot")}>
              Forgot Password?
              </p>
              )}

            </form>
          )}
        </div>
      </div>
    </>
  );
}

export default AuthPage;
