import React, { useState } from "react";
import { issueToken } from "./auth";
import "./AdminLogin.css";

function AdminLogin({ onLoginSuccess, onGoHome }) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      if (!password.trim()) {
        setError("Enter your admin password");
        setLoading(false);
        return;
      }

      await issueToken(password);
      onLoginSuccess();
    } catch (err) {
      setError("Login failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-container">
      <div className="admin-grid-bg" />
      <div className="admin-glow" />

      <div className="admin-login-box">
        <div className="admin-login-header">
          <div className="admin-lock-icon">🔒</div>
          <div className="admin-badge">
            <span className="admin-badge-dot" />
            Portfolio CMS
          </div>
          <h1 className="admin-login-title">Admin Panel</h1>
          <p className="admin-login-subtitle">Restricted access</p>
        </div>

        <div className="admin-login-body">
          <form onSubmit={handleSubmit}>
            <div className="admin-form-group">
              <label htmlFor="password">Password</label>
              <div className="admin-input-wrap">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (error) setError("");
                  }}
                  placeholder="Enter admin password"
                  disabled={loading}
                  autoFocus
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  className="admin-eye-btn"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label="Toggle password visibility"
                  tabIndex={-1}
                >
                  {showPassword ? "🙈" : "👁"}
                </button>
              </div>
            </div>

            {error && (
              <div className="admin-error-message" key={error}>
                <span className="admin-error-icon">⚠</span>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="admin-login-btn"
            >
              {loading ? (
                <>
                  <span className="admin-spinner" />
                  Signing in…
                </>
              ) : (
                "Sign in"
              )}
            </button>
          </form>

          <div className="admin-divider">
            <span className="admin-divider-line" />
            <span className="admin-divider-text">or</span>
            <span className="admin-divider-line" />
          </div>

          <button type="button" className="admin-home-btn" onClick={onGoHome}>
            ← Return to portfolio
          </button>
        </div>

        <div className="admin-login-footer">
          <span>Secured · Portfolio CMS v2</span>
        </div>
      </div>
    </div>
  );
}

export default AdminLogin;
