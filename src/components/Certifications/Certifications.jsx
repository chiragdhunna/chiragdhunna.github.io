import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CertCard from "./CertCard";
import Particle from "../Particle";
import "../Projects/Projects.css";
import CategoryFilterDropdown from "../common/CategoryFilterDropdown";
import { categoryMatches, getAvailableCategories } from "../../utils/categories";

const certsDataUrl = `${import.meta.env.BASE_URL}data/certs.json`;

function Certifications() {
  const [certs, setCerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");

  useEffect(() => {
    fetch(certsDataUrl)
      .then((res) => res.json())
      .then((data) => setCerts(data))
      .catch(() => setCerts([]));
  }, []);

  const availableCategories = getAvailableCategories(certs);
  const showFilterBar = availableCategories.length > 0;

  useEffect(() => {
    if (selectedCategory === "All") return;
    const exists = availableCategories.some((category) =>
      categoryMatches(category, selectedCategory),
    );
    if (!exists) {
      setSelectedCategory("All");
    }
  }, [availableCategories, selectedCategory]);

  const filteredCerts =
    selectedCategory === "All"
      ? certs
      : certs.filter((cert) =>
          cert.categories?.some((category) =>
            categoryMatches(category, selectedCategory),
          ),
        );

  const getCount = (label) =>
    label === "All"
      ? certs.length
      : certs.filter((cert) =>
          cert.categories?.some((category) => categoryMatches(category, label)),
        ).length;

  return (
    <Container fluid className="project-section" style={{ minHeight: "100vh" }}>
      <Particle />
      <Container>
        <h1 className="project-heading">
          My <strong className="purple">Certifications</strong>
        </h1>
        <p style={{ color: "white" }}>
          Here are some certifications and credentials I've earned.
        </p>

        {showFilterBar && (
          <>
            <div className="filter-bar">
              <div className="filter-track">
                <button
                  className={`filter-pill ${selectedCategory === "All" ? "filter-pill--active" : ""}`}
                  onClick={() => setSelectedCategory("All")}
                  aria-pressed={selectedCategory === "All"}
                >
                  <span className="filter-pill__icon" aria-hidden="true">
                    ⬡
                  </span>
                  <span className="filter-pill__label">All</span>
                  <span className="filter-pill__count">{getCount("All")}</span>
                </button>

                <CategoryFilterDropdown
                  categories={availableCategories}
                  selected={selectedCategory}
                  onSelect={setSelectedCategory}
                  getCount={getCount}
                  isActive={selectedCategory !== "All"}
                />
              </div>
            </div>

            <p className="filter-meta">
              Showing <span className="filter-meta__num">{filteredCerts.length}</span>{" "}
              {filteredCerts.length === 1 ? "certification" : "certifications"}
              {selectedCategory !== "All" && (
                <>
                  {" "}
                  in <span className="filter-meta__cat">{selectedCategory}</span>
                </>
              )}
            </p>
          </>
        )}

        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {filteredCerts.length > 0 ? (
            filteredCerts.map((cert, index) => (
              <Col md={4} className="project-card" key={cert.id || index}>
                <CertCard
                  imgPath={cert.imageUrl}
                  title={cert.name}
                  issuer={cert.issuer}
                  issueDate={cert.issueDate}
                  pdfUrl={cert.pdfUrl}
                  credentialUrl={cert.credentialUrl}
                />
              </Col>
            ))
          ) : (
            <p style={{ color: "white", textAlign: "center" }}>
              No Certifications Available
            </p>
          )}
        </Row>
      </Container>
    </Container>
  );
}

export default Certifications;
