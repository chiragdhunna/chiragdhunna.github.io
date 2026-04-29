import React from "react";
import { Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Particle from "../Particle";
import { AiOutlineDownload } from "react-icons/ai";

function ResumeNew() {
  const pdf = "/resume/Chirag_Dhunna.pdf";

  return (
    <div>
      <Container fluid className="resume-section">
        <Particle />
        <Row style={{ justifyContent: "center", position: "relative" }}>
          <Button
            variant="primary"
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{ maxWidth: "250px" }}
          >
            <AiOutlineDownload />
            &nbsp;Download CV
          </Button>
        </Row>

        <Row
          className="resume"
          style={{
            justifyContent: "center",
            overflow: "auto",
            WebkitOverflowScrolling: "touch",
          }}
        >
          <iframe
            src={pdf}
            title="Resume PDF"
            style={{
              width: "100%",
              maxWidth: "1120px",
              height: "90vh",
              border: "none",
              borderRadius: "12px",
              display: "block",
              margin: "0 auto",
            }}
          />
        </Row>

        <Row
          style={{
            justifyContent: "center",
            position: "relative",
            marginTop: "2rem",
          }}
        >
          <Button
            variant="primary"
            href={pdf}
            target="_blank"
            rel="noopener noreferrer"
            style={{ maxWidth: "250px" }}
          >
            <AiOutlineDownload />
            &nbsp;Download CV
          </Button>
        </Row>
      </Container>
    </div>
  );
}

export default ResumeNew;
