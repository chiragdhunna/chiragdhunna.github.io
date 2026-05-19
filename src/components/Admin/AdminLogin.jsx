import React, { useState } from "react";
import { issueToken } from "./auth";
import "./AdminLogin.css";

function AdminLogin({ onLoginSuccess }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // Verify password against env variable
      const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD;
      if (!adminPassword) {
        setError("Admin password not configured");
        setLoading(false);
        return;
      }

      if (password !== adminPassword) {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      // Issue JWT token
      await issueToken(password);
      onLoginSuccess();
    } catch (err) {
      setError("Login failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-login-box">
        <h1 className="admin-login-title">Admin Panel</h1>
        <p className="admin-login-subtitle">Portfolio CMS</p>

        <form onSubmit={handleSubmit}>
          <div className="admin-form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter admin password"
              disabled={loading}
              autoFocus
            />
          </div>

          {error && <div className="admin-error-message">{error}</div>}

          <button type="submit" disabled={loading} className="admin-login-btn">
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AdminLogin;
