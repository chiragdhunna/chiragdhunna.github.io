import React from "react";
import Card from "react-bootstrap/Card";
import Button from "react-bootstrap/Button";
import { CgFileDocument } from "react-icons/cg";

function CertCard(props) {
  const year = props.issueDate ? new Date(props.issueDate).getFullYear() : null;

  return (
    <Card className="project-card-view">
      <div
        className="card-img-container"
        style={{
          width: "100%",
          height: "300px",
          padding: "1rem",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "transparent",
          borderTopLeftRadius: "inherit",
          borderTopRightRadius: "inherit",
        }}
      >
        <Card.Img
          variant="top"
          src={props.imgPath}
          alt="cert-img"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      </div>

      <Card.Body>
        <Card.Title>{props.title}</Card.Title>
        <Card.Text style={{ color: "#c9d1d9", marginBottom: "0.25rem" }}>
          {props.issuer}
          {year ? ` • ${year}` : ""}
        </Card.Text>
        {props.issueDate && (
          <Card.Text style={{ textAlign: "justify" }}>
            Issued: {new Date(props.issueDate).toLocaleDateString()}
          </Card.Text>
        )}

        <div className="d-flex justify-content-center gap-2">
          {props.pdfUrl && (
            <Button
              variant="primary"
              as="a"
              href={props.pdfUrl}
              target="_blank"
              rel="noopener noreferrer"
            >
              <CgFileDocument /> &nbsp; View Certificate
            </Button>
          )}
        </div>
      </Card.Body>
    </Card>
  );
}

export default CertCard;
