import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

function ResetPasswordPage() {
  const { token } = useParams();
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleResetSubmit = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch(`http://localhost:5000/api/auth/reset-password/${token}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();
      alert(data.message || "Password reset.");

      if (res.ok) navigate("/");
    } catch (err) {
      console.error(err);
      alert("Request failed");
    }
  };

  return (
    <form onSubmit={handleResetSubmit} style={{ padding: "2rem" }}>
      <h2>Reset Password</h2>
      <input
        type="password"
        placeholder="New password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      <button type="submit">Reset</button>
    </form>
  );
}

export default ResetPasswordPage;
