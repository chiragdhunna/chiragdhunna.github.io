import React, { useState, useEffect } from "react";
import { Container, Row, Col } from "react-bootstrap";
import CertCard from "./CertCard";
import Particle from "../Particle";

function Certifications() {
  const [certs, setCerts] = useState([]);

  useEffect(() => {
    fetch("/data/certs.json")
      .then((res) => res.json())
      .then((data) => setCerts(data))
      .catch(() => setCerts([]));
  }, []);

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

        <Row style={{ justifyContent: "center", paddingBottom: "10px" }}>
          {certs.length > 0 ? (
            certs.map((cert, index) => (
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
