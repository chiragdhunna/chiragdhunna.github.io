import React, { useState } from "react";
import { uploadResume } from "./githubApi";
import "./ResumeForm.css";

function ResumeForm({ onSuccess }) {
  const [resumeFile, setResumeFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("");

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.type !== "application/pdf") {
        setMessageType("error");
        setMessage("Please upload a PDF file");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        // 10MB limit
        setMessageType("error");
        setMessage("File size must be less than 10MB");
        return;
      }
      setResumeFile(file);
      setMessage("");
    }
  };

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
          document.getElementById("resume-input").value = "";
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
          <label htmlFor="resume-input" className="file-input-label">
            <div className="file-input-box">
              <span className="file-icon">📄</span>
              <span className="file-text">
                {resumeFile ? resumeFile.name : "Click to select PDF file"}
              </span>
            </div>
            <input
              id="resume-input"
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
