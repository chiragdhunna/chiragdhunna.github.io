import React, { useState, useEffect } from "react";
import { verifyToken, clearToken, getStoredToken } from "./auth";
import AdminLogin from "./AdminLogin";
import AdminDashboard from "./AdminDashboard";

function AdminApp() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getStoredToken();
    if (token && verifyToken(token)) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  const handleLoginSuccess = () => setIsAuthenticated(true);

  const handleLogout = () => {
    clearToken();
    setIsAuthenticated(false);
  };

  const handleGoHome = () => {
    window.location.href = "/";
    // If using React Router, replace with: navigate("/")
  };

  if (loading) return null;

  return (
    <>
      {isAuthenticated ? (
        <AdminDashboard onLogout={handleLogout} />
      ) : (
        <AdminLogin
          onLoginSuccess={handleLoginSuccess}
          onGoHome={handleGoHome}
        />
      )}
    </>
  );
}

export default AdminApp;
