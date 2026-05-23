import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import CertForm from "./CertForm";
import ProjectForm from "./ProjectForm";
import ResumeForm from "./ResumeForm";
import { deleteProject, deleteCertification } from "./githubApi";
import "./AdminDashboard.css";

const projectsDataUrl = `${import.meta.env.BASE_URL}data/projects.json`;
const certsDataUrl = `${import.meta.env.BASE_URL}data/certs.json`;

function CertsTab() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingCert, setEditingCert] = useState(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState(null);
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchCerts = () => {
    setLoading(true);
    fetch(`${certsDataUrl}?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setCerts(Array.isArray(d) ? d : []))
      .catch(() => setCerts([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchCerts();
  }, []);

  const handleEditSuccess = () => {
    setEditingCert(null);
    fetchCerts();
  };

  const handleDeleteConfirm = async (slug) => {
    setDeletingSlug(slug);
    setDeleteError("");
    try {
      await deleteCertification(slug);
      setConfirmDeleteSlug(null);
      if (editingCert?.slug === slug) setEditingCert(null);
      fetchCerts();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingSlug(null);
    }
  };

  const filtered = certs.filter(
    (c) =>
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.issuer?.toLowerCase().includes(search.toLowerCase()),
  );

  const isEditing = !!editingCert;

  return (
    <div className="cms-shell">
      {/* ── Sidebar ── */}
      <div className="proj-sidebar">
        <div className="sidebar-head">
          <span className="sidebar-label">certifications</span>
          <span className="sidebar-count">
            {search ? `${filtered.length}/${certs.length}` : certs.length}
          </span>
        </div>

        <div className="sidebar-search">
          <div className="sidebar-search-wrap">
            <i
              className="ti ti-search sidebar-search-icon"
              aria-hidden="true"
            ></i>
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="search certs…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="proj-list">
          {loading ? (
            <div className="empty-state">
              <i className="ti ti-loader-2 empty-icon" aria-hidden="true"></i>
              loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i
                className="ti ti-certificate-off empty-icon"
                aria-hidden="true"
              ></i>
              {search ? `no results for "${search}"` : "no certs yet"}
            </div>
          ) : (
            filtered.map((c) => {
              const isActive = editingCert?.slug === c.slug;
              const isConfirming = confirmDeleteSlug === c.slug;
              const isDeleting = deletingSlug === c.slug;

              return (
                <div
                  key={c.slug}
                  className={`proj-item ${isActive ? "active" : ""}`}
                >
                  <div className="proj-thumb">
                    {c.imageUrl ? (
                      <img
                        src={c.imageUrl}
                        alt={c.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      c.name?.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="proj-info">
                    <div className="proj-name">{c.name}</div>
                    <div className="proj-cats">
                      <span className="proj-cat">{c.issuer}</span>
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="delete-row">
                      <span className="confirm-text">delete?</span>
                      <button
                        className="confirm-yes"
                        onClick={() => handleDeleteConfirm(c.slug)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "…" : "yes"}
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => {
                          setConfirmDeleteSlug(null);
                          setDeleteError("");
                        }}
                        disabled={isDeleting}
                      >
                        no
                      </button>
                    </div>
                  ) : (
                    <div className="proj-actions">
                      <button
                        className="proj-act edit"
                        onClick={() => {
                          setEditingCert(c);
                          setConfirmDeleteSlug(null);
                        }}
                      >
                        edit
                      </button>
                      <button
                        className="proj-act del"
                        onClick={() => {
                          setConfirmDeleteSlug(c.slug);
                          setDeleteError("");
                        }}
                      >
                        del
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {deleteError && <div className="delete-error-bar">{deleteError}</div>}

        <div className="add-row">
          <button
            className="add-btn"
            onClick={() => {
              setEditingCert(null);
              setSearch("");
            }}
          >
            <i className="ti ti-plus" aria-hidden="true"></i>
            new certification
          </button>
        </div>
      </div>

      {/* ── Main panel ── */}
      <div className="proj-main">
        <div className="main-topbar">
          <div>
            <div className="mode-label">
              {isEditing ? "EDIT MODE" : "ADD MODE"}
            </div>
            <div className="mode-title">
              {isEditing ? editingCert.name : "New certification"}
            </div>
          </div>
          {isEditing && (
            <button className="cancel-btn" onClick={() => setEditingCert(null)}>
              ✕ cancel
            </button>
          )}
        </div>

        <CertForm
          editCert={editingCert}
          onSuccess={handleEditSuccess}
          onCancelEdit={() => setEditingCert(null)}
        />
      </div>
    </div>
  );
}

function ProjectsTab() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editingProject, setEditingProject] = useState(null);
  const [confirmDeleteSlug, setConfirmDeleteSlug] = useState(null);
  const [deletingSlug, setDeletingSlug] = useState(null);
  const [deleteError, setDeleteError] = useState("");

  const fetchProjects = () => {
    setLoading(true);
    fetch(`${projectsDataUrl}?t=${Date.now()}`)
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => setProjects(Array.isArray(d) ? d : []))
      .catch(() => setProjects([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleEditSuccess = () => {
    setEditingProject(null);
    fetchProjects();
  };

  const handleDeleteConfirm = async (slug) => {
    setDeletingSlug(slug);
    setDeleteError("");
    try {
      await deleteProject(slug);
      setConfirmDeleteSlug(null);
      if (editingProject?.slug === slug) setEditingProject(null);
      fetchProjects();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setDeletingSlug(null);
    }
  };

  const filtered = projects.filter(
    (p) =>
      p.name?.toLowerCase().includes(search.toLowerCase()) ||
      p.categories?.some((c) => c.toLowerCase().includes(search.toLowerCase())),
  );

  const isEditing = !!editingProject;

  return (
    <div className="cms-shell">
      <div className="proj-sidebar">
        <div className="sidebar-head">
          <span className="sidebar-label">projects</span>
          <span className="sidebar-count">
            {search ? `${filtered.length}/${projects.length}` : projects.length}
          </span>
        </div>

        <div className="sidebar-search">
          <div className="sidebar-search-wrap">
            <i
              className="ti ti-search sidebar-search-icon"
              aria-hidden="true"
            ></i>
            <input
              className="sidebar-search-input"
              type="text"
              placeholder="search projects…"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="proj-list">
          {loading ? (
            <div className="empty-state">
              <i className="ti ti-loader-2 empty-icon" aria-hidden="true"></i>
              loading…
            </div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <i className="ti ti-folder-off empty-icon" aria-hidden="true"></i>
              {search ? `no results for "${search}"` : "no projects yet"}
            </div>
          ) : (
            filtered.map((p) => {
              const isActive = editingProject?.slug === p.slug;
              const isConfirming = confirmDeleteSlug === p.slug;
              const isDeleting = deletingSlug === p.slug;

              return (
                <div
                  key={p.slug}
                  className={`proj-item ${isActive ? "active" : ""}`}
                >
                  <div className="proj-thumb">
                    {p.imageUrl ? (
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        onError={(e) => {
                          e.target.style.display = "none";
                        }}
                      />
                    ) : (
                      p.name?.slice(0, 2).toUpperCase()
                    )}
                  </div>
                  <div className="proj-info">
                    <div className="proj-name">{p.name}</div>
                    <div className="proj-cats">
                      {p.categories?.map((c) => (
                        <span key={c} className="proj-cat">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>

                  {isConfirming ? (
                    <div className="delete-row">
                      <span className="confirm-text">delete?</span>
                      <button
                        className="confirm-yes"
                        onClick={() => handleDeleteConfirm(p.slug)}
                        disabled={isDeleting}
                      >
                        {isDeleting ? "…" : "yes"}
                      </button>
                      <button
                        className="confirm-no"
                        onClick={() => {
                          setConfirmDeleteSlug(null);
                          setDeleteError("");
                        }}
                        disabled={isDeleting}
                      >
                        no
                      </button>
                    </div>
                  ) : (
                    <div className="proj-actions">
                      <button
                        className="proj-act edit"
                        onClick={() => {
                          setEditingProject(p);
                          setConfirmDeleteSlug(null);
                        }}
                      >
                        edit
                      </button>
                      <button
                        className="proj-act del"
                        onClick={() => {
                          setConfirmDeleteSlug(p.slug);
                          setDeleteError("");
                        }}
                      >
                        del
                      </button>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {deleteError && <div className="delete-error-bar">{deleteError}</div>}

        <div className="add-row">
          <button
            className="add-btn"
            onClick={() => {
              setEditingProject(null);
              setSearch("");
            }}
          >
            <i className="ti ti-plus" aria-hidden="true"></i>
            new project
          </button>
        </div>
      </div>

      <div className="proj-main">
        <div className="main-topbar">
          <div>
            <div className="mode-label">
              {isEditing ? "EDIT MODE" : "ADD MODE"}
            </div>
            <div className="mode-title">
              {isEditing ? editingProject.name : "New project"}
            </div>
          </div>
          {isEditing && (
            <button
              className="cancel-btn"
              onClick={() => setEditingProject(null)}
            >
              ✕ cancel
            </button>
          )}
        </div>

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
        {activeTab === "certifications" && <CertsTab />}
        {activeTab === "projects" && <ProjectsTab />}
        {activeTab === "resume" && <ResumeForm onSuccess={() => {}} />}
      </div>
    </div>
  );
}

export default AdminDashboard;
