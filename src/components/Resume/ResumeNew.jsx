import React, { useState, useEffect } from "react";
import { Container, Row } from "react-bootstrap";
import Button from "react-bootstrap/Button";
import Particle from "../Particle";
import { AiOutlineDownload } from "react-icons/ai";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";

// Configure PDF.js worker (use explicit https)
const pdfjsVersion = pdfjs.version;
pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/build/pdf.worker.min.js`;

// OVERLEAF SETUP:
// Option 1: Use local PDF (synced via GitHub Actions)
// Option 2: Use direct Overleaf link (uncomment and add your project ID)
// const OVERLEAF_PROJECT_ID = "YOUR_PROJECT_ID_HERE";
// const OVERLEAF_PDF = `https://www.overleaf.com/download/project/${OVERLEAF_PROJECT_ID}/build/output.pdf?compileGroup=standard`;

function ResumeNew() {
  const [width, setWidth] = useState(1200);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfData, setPdfData] = useState(null);

  useEffect(() => {
    const handleResize = () => setWidth(window.innerWidth);
    window.addEventListener("resize", handleResize);
    handleResize(); // Set initial width

    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fetch PDF as ArrayBuffer and pass bytes to react-pdf to avoid serving issues
  useEffect(() => {
    const controller = new AbortController();
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const res = await fetch(pdf, { signal: controller.signal });
        console.log(
          "Resume fetch status:",
          res.status,
          res.headers.get("content-type"),
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buf = await res.arrayBuffer();
        setPdfData(new Uint8Array(buf));
      } catch (err) {
        if (err.name === "AbortError") return;
        console.error("Error fetching PDF:", err);
        setError("Error loading PDF. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
    return () => controller.abort();
  }, [pdf]);

  const onDocumentLoadSuccess = () => {
    setIsLoading(false);
    setError(null);
  };

  const onDocumentLoadError = (error) => {
    console.error("PDF Load Error:", error);
    setIsLoading(false);
    setError("Error loading PDF. Please try again later.");
  };

  // Use local PDF (synced from Overleaf via GitHub Actions)
  // Or replace with OVERLEAF_PDF to load directly from Overleaf
  const pdf = "/CHIRAG_DHUNNA.pdf";

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
                file={pdfData || pdf}
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
