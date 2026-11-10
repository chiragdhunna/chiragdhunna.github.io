import React, { useState, useEffect, useMemo } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CertCard from "./CertCard";
import Particle from "../Particle";
import "../Projects/Projects.css";
import CategoryFilterDropdown from "../common/CategoryFilterDropdown";
import { categoryMatches, getAvailableCategories } from "../../utils/categories";
import {
  countCerts,
  filterCerts,
  getPublicIssuers,
  issuerMatches,
  normalizeIssuer,
} from "../../utils/issuers";

const certsDataUrl = `${import.meta.env.BASE_URL}data/certs.json`;

function Certifications() {
  const [certs, setCerts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedIssuer, setSelectedIssuer] = useState("All");

  useEffect(() => {
    fetch(certsDataUrl)
      .then((res) => res.json())
      .then((data) => setCerts(data))
      .catch(() => setCerts([]));
  }, []);

  const availableCategories = useMemo(
    () => getAvailableCategories(certs),
    [certs],
  );
  const availableIssuers = useMemo(
    () => getPublicIssuers(certs),
    [certs],
  );
  const showIssuerFilter = availableIssuers.length >= 2;
  const showFilterBar = availableCategories.length > 0 || showIssuerFilter;

  useEffect(() => {
    if (categoryMatches(selectedCategory, "All")) return;
    const exists = availableCategories.some((category) =>
      categoryMatches(category, selectedCategory),
    );
    if (!exists) {
      setSelectedCategory("All");
    }
  }, [availableCategories, selectedCategory]);

  useEffect(() => {
    if (
      !selectedIssuer ||
      normalizeIssuer(selectedIssuer).toLowerCase() === "all"
    )
      return;
    const exists = availableIssuers.some((issuer) =>
      issuerMatches(issuer, selectedIssuer),
    );
    if (!exists) {
      setSelectedIssuer("All");
    }
  }, [availableIssuers, selectedIssuer]);

  const filteredCerts = useMemo(
    () =>
      filterCerts(certs, {
        category: selectedCategory,
        issuer: selectedIssuer,
      }),
    [certs, selectedCategory, selectedIssuer],
  );

  const getCategoryCount = (cat) =>
    countCerts(certs, { category: cat, issuer: selectedIssuer });

  const getIssuerCount = (iss) =>
    countCerts(certs, { category: selectedCategory, issuer: iss });

  const isAllActive =
    categoryMatches(selectedCategory, "All") &&
    (!selectedIssuer ||
      normalizeIssuer(selectedIssuer).toLowerCase() === "all");

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
                  className={`filter-pill ${isAllActive ? "filter-pill--active" : ""}`}
                  onClick={() => {
                    setSelectedCategory("All");
                    setSelectedIssuer("All");
                  }}
                  aria-pressed={isAllActive}
                >
                  <span className="filter-pill__icon" aria-hidden="true">
                    ⬡
                  </span>
                  <span className="filter-pill__label">All</span>
                  <span className="filter-pill__count">
                    {getCategoryCount("All")}
                  </span>
                </button>

                {availableCategories.length > 0 && (
                  <CategoryFilterDropdown
                    categories={availableCategories}
                    selected={selectedCategory}
                    onSelect={setSelectedCategory}
                    getCount={getCategoryCount}
                    isActive={!categoryMatches(selectedCategory, "All")}
                  />
                )}

                {showIssuerFilter && (
                  <CategoryFilterDropdown
                    label="Issuer"
                    allLabel="All issuers"
                    categories={availableIssuers}
                    selected={selectedIssuer}
                    onSelect={setSelectedIssuer}
                    getCount={getIssuerCount}
                    isActive={
                      normalizeIssuer(selectedIssuer).toLowerCase() !== "all"
                    }
                  />
                )}
              </div>
            </div>

            <p className="filter-meta">
              Showing <span className="filter-meta__num">{filteredCerts.length}</span>{" "}
              {filteredCerts.length === 1 ? "certification" : "certifications"}
              {!categoryMatches(selectedCategory, "All") && (
                <>
                  {" "}
                  in <span className="filter-meta__cat">{selectedCategory}</span>
                </>
              )}
              {normalizeIssuer(selectedIssuer).toLowerCase() !== "all" && (
                <>
                  {" "}
                  by <span className="filter-meta__cat">{selectedIssuer}</span>
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
