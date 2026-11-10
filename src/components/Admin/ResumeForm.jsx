import React, { useRef, useState } from "react";
import { uploadResume } from "./githubApi";
import { validatePdf } from "./fileDrop";
import { useFileDrop } from "./useFileDrop";
import "./ResumeForm.css";

function ResumeForm({ onSuccess }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");
  const multipleDropRef = useRef(false);
  const fileInputRef = useRef(null);

  const handleResumeFile = (file) => {
    const validationError = validatePdf(file);
    if (validationError) {
      setMessageType("error");
      setMessage(validationError);
      multipleDropRef.current = false;
      return;
    }

    setResumeFile(file);
    if (multipleDropRef.current) {
      setMessageType("error");
      setMessage("Only the first file was used");
      multipleDropRef.current = false;
      return;
    }
    setMessage("");
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      multipleDropRef.current = false;
      handleResumeFile(file);
    }
  };

  const { isDragging, dropProps } = useFileDrop({
    onFile: handleResumeFile,
    disabled: loading,
    onMultiple: () => {
      multipleDropRef.current = true;
    },
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!resumeFile) {
      setMessageType("error");
      setMessage("Please select a PDF file");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          await uploadResume(reader.result);
          setMessageType("success");
          setMessage(
            "✓ Resume uploaded successfully! The site will update in ~60 seconds.",
          );
          setResumeFile(null);
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setTimeout(() => onSuccess && onSuccess(), 2000);
        } catch (error) {
          setMessageType("error");
          setMessage(`Failed to upload resume: ${error.message}`);
          console.error("Upload error:", error);
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(resumeFile);
    } catch (error) {
      setMessageType("error");
      setMessage(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="resume-form-container">
      <h2>Upload Resume</h2>
      <p className="resume-form-subtitle">
        Upload a new resume to replace the existing one
      </p>

      <form onSubmit={handleSubmit} className="resume-form">
        <div className="form-group">
          <label htmlFor="resume-input" className="file-input-label" {...dropProps}>
            <div
              className={`file-input-box ${isDragging ? "file-input-box--dragging" : ""}`}
            >
              <span className="file-icon">📄</span>
              <span className="file-text">
                {resumeFile
                  ? resumeFile.name
                  : "Click to select or drag & drop a PDF"}
              </span>
            </div>
            <input
              id="resume-input"
              ref={fileInputRef}
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              disabled={loading}
              className="file-input"
            />
          </label>
          <small className="form-help">
            Maximum file size: 10MB. PDF format required.
          </small>
        </div>

        {message && (
          <div className={`form-message ${messageType}`}>
            {messageType === "success" && "✓ "}
            {message}
          </div>
        )}

        <button
          type="submit"
          disabled={!resumeFile || loading}
          className="submit-btn"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>
      </form>
    </div>
  );
}

export default ResumeForm;
