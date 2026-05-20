import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import CertForm from "./CertForm";
import ProjectForm from "./ProjectForm";
import "./AdminDashboard.css";

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("certifications");
  const navigate = useNavigate();

  const handleSuccess = () => {
    setActiveTab("certifications");
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-header">
        <div className="admin-header-left">
          <button className="home-btn" onClick={() => navigate("/")}>
            <span className="home-btn-arrow">←</span>
            <span className="home-btn-text">Home</span>
          </button>
          <h1>Portfolio CMS</h1>
        </div>
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
        {activeTab === "projects" && <ProjectForm onSuccess={handleSuccess} />}
      </div>
    </div>
  );
}

export default AdminDashboard;
