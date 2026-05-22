import "./Projects.css";
import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import ProjectCard from "./ProjectCards";
import Particle from "../Particle";

const CATEGORIES = [
  { label: "All", icon: "⬡" },
  { label: "Web", icon: "🌐" },
  { label: "Mobile", icon: "📱" },
  { label: "Full Stack", icon: "⚡" },
  { label: "Backend", icon: "🖥" },
];

const projectsDataUrl = `${import.meta.env.BASE_URL}data/projects.json`;

function Projects() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    fetch(projectsDataUrl)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to load");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setProjects(data);
      })
      .catch((err) => {
        console.error("[Projects] Failed to fetch projects.json:", err);
      })
      .finally(() => setLoading(false));
  }, []);

  const handleCategoryChange = (category) => {
    if (category === selectedCategory) return;
    setAnimating(true);
    setTimeout(() => {
      setSelectedCategory(category);
      setAnimating(false);
    }, 200);
  };

  const filteredProjects =
    selectedCategory === "All"
      ? projects
      : projects.filter((p) => p.categories?.includes(selectedCategory));

  const getCount = (label) =>
    label === "All"
      ? projects.length
      : projects.filter((p) => p.categories?.includes(label)).length;

  return (
    <Container fluid className="project-section" style={{ minHeight: "100vh" }}>
      <Particle />
      <Container>
        <h1 className="project-heading">
          My Recent <strong className="purple">Works </strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are a few projects I've worked on recently.
        </p>

        {/* ── Filter Bar ── */}
        <div className="filter-bar">
          <div className="filter-track">
            {CATEGORIES.map(({ label, icon }) => {
              const active = selectedCategory === label;
              return (
                <button
                  key={label}
                  className={`filter-pill ${active ? "filter-pill--active" : ""}`}
                  onClick={() => handleCategoryChange(label)}
                  aria-pressed={active}
                >
                  <span className="filter-pill__icon" aria-hidden="true">
                    {icon}
                  </span>
                  <span className="filter-pill__label">{label}</span>
                  <span className="filter-pill__count">{getCount(label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* ── Result meta ── */}
        <p className="filter-meta">
          Showing{" "}
          <span className="filter-meta__num">{filteredProjects.length}</span>{" "}
          {filteredProjects.length === 1 ? "project" : "projects"}
          {selectedCategory !== "All" && (
            <>
              {" "}
              in <span className="filter-meta__cat">{selectedCategory}</span>
            </>
          )}
        </p>

        {/* ── Cards Grid ── */}
        <Row
          style={{ justifyContent: "center", paddingBottom: "10px" }}
          className={
            animating ? "projects-grid--fade" : "projects-grid--visible"
          }
        >
          {loading ? (
            <p style={{ color: "white", textAlign: "center" }}>
              Loading projects...
            </p>
          ) : filteredProjects.length > 0 ? (
            filteredProjects.map((project, index) => (
              <Col
                md={4}
                className="project-card"
                key={`${selectedCategory}-${index}`}
                style={{ animationDelay: `${index * 60}ms` }}
              >
                <ProjectCard
                  imgPath={project.imageUrl}
                  isBlog={false}
                  title={project.name}
                  description={project.description}
                  ghLink={project.ghLink}
                  demoLink={project.demoLink}
                />
              </Col>
            ))
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>
              No projects available
            </p>
          )}
        </Row>
      </Container>
    </Container>
  );
}

export default Projects;
