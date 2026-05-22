import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import CertForm from "./CertForm";
import ProjectForm from "./ProjectForm";
import ResumeForm from "./ResumeForm";
import { deleteProject } from "./githubApi";
import "./AdminDashboard.css";

const projectsDataUrl = `${import.meta.env.BASE_URL}data/projects.json`;

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loadingProjects, setLoadingProjects] = useState(true);
  const [editingProject, setEditingProject] = useState(null);
  const [confirmDelete, setConfirmDelete] = useState(null); // slug of project pending delete
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchProjects = () => {
    setLoadingProjects(true);
    fetch(`${projectsDataUrl}?t=${Date.now()}`)
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setProjects(Array.isArray(data) ? data : []))
      .catch(() => setProjects([]))
      .finally(() => setLoadingProjects(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEditSuccess = () => {
    setEditingProject(null);
    fetchProjects();
  };

  const handleDeleteClick = (slug) => {
    setConfirmDelete(slug);
    setDeleteError("");
  };

  const handleDeleteConfirm = async (slug) => {
    setDeletingSlug(slug);
    setDeleteError("");
    try {
      await deleteProject(slug);
      setConfirmDelete(null);
      fetchProjects();
    } catch (err) {
      setDeleteError(`Delete failed: ${err.message}`);
    } finally {
      setDeletingSlug(null);
    }
  };

  const handleDeleteCancel = () => {
    setConfirmDelete(null);
    setDeleteError("");
  };

  return (
    <div className="projects-tab">
      {/* ── Left: Project List ── */}
      <div className="project-list-panel">
        <div className="panel-header">
          <h3>All Projects</h3>
          <span className="project-count">{projects.length}</span>
        </div>

        {loadingProjects ? (
          <div className="panel-loading">Loading...</div>
        ) : projects.length === 0 ? (
          <div className="panel-empty">No projects yet</div>
        ) : (
          <ul className="project-list">
            {projects.map((project) => {
              const isConfirming = confirmDelete === project.slug;
              const isDeleting = deletingSlug === project.slug;
              const isEditing = editingProject?.slug === project.slug;

              return (
                <li
                  key={project.slug}
                  className={`project-list-item ${isEditing ? "project-list-item--editing" : ""}`}
                >
                  <div className="project-list-item-info">
                    <img
                      src={project.imageUrl}
                      alt={project.name}
                      className="project-list-thumb"
                      onError={(e) => {
                        e.target.style.display = "none";
                      }}
                    />
                    <div className="project-list-meta">
                      <span className="project-list-name">{project.name}</span>
                      <div className="project-list-cats">
                        {project.categories?.map((c) => (
                          <span key={c} className="project-list-cat">
                            {c}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="delete-confirm">
                      <span className="delete-confirm-text">Delete?</span>
                      <button
                        className="delete-confirm-yes"
                        onClick={() => handleDeleteConfirm(project.slug)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "Deleting..." : "Yes"}
                      </button>
                      <button
                        className="delete-confirm-no"
                        onClick={handleDeleteCancel}
                        disabled={isDeleting}
                      >
                        No
                      </button>
                    </div>
                  ) : (
                    <div className="project-list-actions">
                      <button
                        className="action-btn action-btn--edit"
                        onClick={() => setEditingProject(project)}
                        disabled={isDeleting}
                      >
                        Edit
                      </button>
                      <button
                        className="action-btn action-btn--delete"
                        onClick={() => handleDeleteClick(project.slug)}
                        disabled={isDeleting}
                      >
                        Delete
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )}

        {deleteError && <div className="delete-error">{deleteError}</div>}
      </div>

      {/* ── Right: Add / Edit Form ── */}
      <div className="project-form-panel">
        <ProjectForm
          editProject={editingProject}
          onSuccess={handleEditSuccess}
          onCancelEdit={() => setEditingProject(null)}
        />
      </div>
    </div>
  );
}

function AdminDashboard({ onLogout }) {
  const [activeTab, setActiveTab] = useState("certifications");
  const navigate = useNavigate();

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
        {["certifications", "projects", "resume"].map((tab) => (
          <button
            key={tab}
            className={`tab-button ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </button>
        ))}
      </div>

      <div className="admin-content">
        {activeTab === "certifications" && <CertForm onSuccess={() => {}} />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "resume" && <ResumeForm onSuccess={() => {}} />}
      </div>
    </div>
  );
}

export default AdminDashboard;
