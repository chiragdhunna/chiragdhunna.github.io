import React, { useState } from "react";
import { addCertification } from "./githubApi";
import "./CertForm.css";

// Helper function to generate slug from name
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CertForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });

  const [imageFile, setImageFile] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate image
      if (!file.type.startsWith("image/")) {
        setError("Please select a valid image file");
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return;
      }

      setImageFile(file);
      setError("");

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handlePdfChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate PDF
      if (file.type !== "application/pdf") {
        setError("Please select a valid PDF file");
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError("PDF size must be less than 10MB");
        return;
      }

      setPdfFile(file);
      setError("");
    }
  };

  const resizeImage = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let width = img.width;
          let height = img.height;

          // Resize if wider than 1200px
          if (width > 1200) {
            height = (height * 1200) / width;
            width = 1200;
          }

          canvas.width = width;
          canvas.height = height;

          const ctx = canvas.getContext("2d");
          ctx.drawImage(img, 0, 0, width, height);

          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  };

  const fileToBase64 = (file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target.result);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // Validation
    if (!formData.name.trim()) {
      setError("Certification name is required");
      return;
    }

    if (!formData.issuer.trim()) {
      setError("Issuer is required");
      return;
    }

    // Issue date is optional now; no validation required

    if (!imageFile) {
      setError("Certificate image is required");
      return;
    }

    setLoading(true);

    try {
      // Generate slug from name
      const slug = generateSlug(formData.name);

      // Resize and encode image
      const imageBase64 = await resizeImage(imageFile);

      // Encode PDF if provided
      let pdfBase64 = null;
      if (pdfFile) {
        pdfBase64 = await fileToBase64(pdfFile);
      }

      // Submit to GitHub Actions
      await addCertification({
        name: formData.name.trim(),
        issuer: formData.issuer.trim(),
        issueDate: formData.issueDate,
        imageBase64,
        pdfBase64,
        credentialUrl: formData.credentialUrl.trim() || null,
        slug,
      });

      setSuccess("✓ Submitted! The live site will update in ~60 seconds.");

      // Reset form
      setFormData({
        name: "",
        issuer: "",
        issueDate: "",
        credentialUrl: "",
      });
      setImageFile(null);
      setPdfFile(null);
      setImagePreview(null);

      if (onSuccess) {
        setTimeout(onSuccess, 2000);
      }
    } catch (err) {
      setError("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="cert-form" onSubmit={handleSubmit}>
      <h2>Add New Certification</h2>

      <div className="form-group">
        <label htmlFor="name">Certification Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., AWS Certified AI Practitioner"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="issuer">Issuer *</label>
        <input
          type="text"
          id="issuer"
          name="issuer"
          value={formData.issuer}
          onChange={handleInputChange}
          placeholder="e.g., Amazon Web Services"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="issueDate">Issue Date (Optional)</label>
        <input
          type="date"
          id="issueDate"
          name="issueDate"
          value={formData.issueDate}
          onChange={handleInputChange}
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="credentialUrl">Credential URL (Optional)</label>
        <input
          type="url"
          id="credentialUrl"
          name="credentialUrl"
          value={formData.credentialUrl}
          onChange={handleInputChange}
          placeholder="https://example.com/verify"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Certificate Image (JPG/PNG) *</label>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="image"
            accept="image/*"
            onChange={handleImageChange}
            disabled={loading}
          />
          <span className="file-input-label">
            {imageFile ? imageFile.name : "Choose image file"}
          </span>
        </div>
        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview} alt="Preview" />
            <p className="preview-label">Image Preview</p>
          </div>
        )}
      </div>

      <div className="form-group">
        <label htmlFor="pdf">Certificate PDF (Optional)</label>
        <div className="file-input-wrapper">
          <input
            type="file"
            id="pdf"
            accept=".pdf"
            onChange={handlePdfChange}
            disabled={loading}
          />
          <span className="file-input-label">
            {pdfFile ? pdfFile.name : "Choose PDF file"}
          </span>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Submitting..." : "Add Certification"}
      </button>
    </form>
  );
}

export default CertForm;
