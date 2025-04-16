import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Particle from "../Particle";
import { AiOutlineDownload } from "react-icons/ai";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Configure PDF.js worker
const pdfjsVersion = pdfjs.version;
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

function ResumeNew() {
  const [width, setWidth] = useState(1200);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial width

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const onDocumentLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF Load Error:", error);
    setIsLoading(false);
    setError("Error loading PDF. Please try again later.");
  };

  const pdf = "/Chirag_Dhunna.pdf";

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

        <Row className="resume">
          {error ? (
            <div className="text-danger text-center mt-4">{error}</div>
          ) : (
            <div className="w-100 d-flex justify-content-center">
              <Document
                file={pdf}
                onLoadSuccess={onDocumentLoadSuccess}
                onLoadError={onDocumentLoadError}
                loading={<div className="text-center mt-4">Loading PDF...</div>}
              >
                {isLoading ? null : (
                  <Page
                    pageNumber={1}
                    scale={width > 786 ? 1.7 : 0.6}
                    renderAnnotationLayer={false}
                    renderTextLayer={false}
                  />
                )}
              </Document>
            </div>
          )}
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
