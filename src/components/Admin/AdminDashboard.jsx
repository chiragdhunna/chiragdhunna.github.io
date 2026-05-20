import React, { useState } from "react";
import CertForm from "./CertForm";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("certifications");

  const handleSuccess = () => {
    // Could add notifications or refresh data here
    setActiveTab("certifications");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <h1>Portfolio CMS</h1>
        <button onClick={onLogout} className="logout-btn">
          Logout
        </button>
      </div>

      <div className="admin-tabs">
        <button
          className={`tab-button ${activeTab === "certifications" ? "active" : ""}`}
          onClick={() => setActiveTab("certifications")}
        >
          Certifications
        </button>
        <button
          className={`tab-button ${activeTab === "projects" ? "active" : ""}`}
          onClick={() => setActiveTab("projects")}
        >
          Projects
        </button>
      </div>

      <div className="admin-content">
        {activeTab === "certifications" && (
          <CertForm onSuccess={handleSuccess} />
        )}
        {activeTab === "projects" && (
          <div className="placeholder-content">
            <p>Project management coming soon</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard;
