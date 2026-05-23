import React, { useState, useEffect } from "react";
import { addCertification, updateCertification } from "./githubApi";
import "./CertForm.css";

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function CertForm({ editCert, onSuccess, onCancelEdit }) {
  const isEditMode = !!editCert;

  const [formData, setFormData] = useState({
    name: "",
    issuer: "",
    issueDate: "",
    credentialUrl: "",
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [pdfFile, setPdfFile] = useState(null);
  const [pdfName, setPdfName] = useState("");
  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");

  useEffect(() => {
    if (editCert) {
      setFormData({
        name: editCert.name || "",
        issuer: editCert.issuer || "",
        issueDate: editCert.issueDate ? editCert.issueDate.slice(0, 10) : "",
        credentialUrl: editCert.credentialUrl || "",
      });
      setImagePreview(editCert.imageUrl || null);
      setPdfName(editCert.pdfUrl ? "existing PDF" : "");
    } else {
      setFormData({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
      setImagePreview(null);
      setPdfName("");
    }
    setImageFile(null);
    setPdfFile(null);
    setMsgOk("");
    setMsgErr("");
  }, [editCert]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const handleImage = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/"))
      return setMsgErr("Please select a valid image file");
    if (file.size > 5 * 1024 * 1024)
      return setMsgErr("Image must be under 5MB");
    setImageFile(file);
    setMsgErr("");
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);
  };

  const handlePdf = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.type !== "application/pdf")
      return setMsgErr("Please select a valid PDF");
    if (file.size > 10 * 1024 * 1024)
      return setMsgErr("PDF must be under 10MB");
    setPdfFile(file);
    setPdfName(file.name);
    setMsgErr("");
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? editCert?.imageUrl || null : null);
  };

  const clearPdf = () => {
    setPdfFile(null);
    setPdfName(isEditMode && editCert?.pdfUrl ? "existing PDF" : "");
  };

  const resizeImage = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement("canvas");
          let { width, height } = img;
          if (width > 1200) {
            height = (height * 1200) / width;
            width = 1200;
          }
          canvas.width = width;
          canvas.height = height;
          canvas.getContext("2d").drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL("image/jpeg", 0.8));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const fileToBase64 = (file) =>
    new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target.result);
      reader.readAsDataURL(file);
    });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgOk("");
    setMsgErr("");

    if (!formData.name.trim())
      return setMsgErr("certification name is required");
    if (!formData.issuer.trim()) return setMsgErr("issuer is required");
    if (!isEditMode && !imageFile)
      return setMsgErr("certificate image is required");

    setLoading(true);
    try {
      if (isEditMode) {
        const payload = {
          name: formData.name.trim(),
          issuer: formData.issuer.trim(),
          issueDate: formData.issueDate || null,
          credentialUrl: formData.credentialUrl.trim() || null,
        };
        if (imageFile) payload.imageBase64 = await resizeImage(imageFile);
        if (pdfFile) payload.pdfBase64 = await fileToBase64(pdfFile);

        await updateCertification(editCert.slug, payload);
        setMsgOk("✓ updated! deploying in ~60s");
      } else {
        const slug = generateSlug(formData.name);
        const imageBase64 = await resizeImage(imageFile);
        const pdfBase64 = pdfFile ? await fileToBase64(pdfFile) : null;

        await addCertification({
          name: formData.name.trim(),
          issuer: formData.issuer.trim(),
          issueDate: formData.issueDate || null,
          credentialUrl: formData.credentialUrl.trim() || null,
          imageBase64,
          pdfBase64,
          slug,
        });

        setMsgOk("✓ added! deploying in ~60s");
        setFormData({ name: "", issuer: "", issueDate: "", credentialUrl: "" });
        setImageFile(null);
        setImagePreview(null);
        setPdfFile(null);
        setPdfName("");
      }
      if (onSuccess) setTimeout(onSuccess, 2000);
    } catch (err) {
      setMsgErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="cf-form" onSubmit={handleSubmit}>
      <div className="cf-body">
        <div className="cf-grid">
          <div className="cf-field cf-full">
            <label className="cf-label">
              certification name <span className="cf-req">*</span>
            </label>
            <input
              className="cf-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInput}
              placeholder="e.g. AWS Certified AI Practitioner"
              disabled={loading}
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">
              issuer <span className="cf-req">*</span>
            </label>
            <input
              className="cf-input"
              type="text"
              name="issuer"
              value={formData.issuer}
              onChange={handleInput}
              placeholder="e.g. Amazon Web Services"
              disabled={loading}
            />
          </div>

          <div className="cf-field">
            <label className="cf-label">
              issue date <span className="cf-optional">optional</span>
            </label>
            <input
              className="cf-input"
              type="date"
              name="issueDate"
              value={formData.issueDate}
              onChange={handleInput}
              disabled={loading}
            />
          </div>

          <div className="cf-field cf-full">
            <label className="cf-label">
              credential url <span className="cf-optional">optional</span>
            </label>
            <input
              className="cf-input"
              type="url"
              name="credentialUrl"
              value={formData.credentialUrl}
              onChange={handleInput}
              placeholder="https://example.com/verify"
              disabled={loading}
            />
          </div>

          <div className="cf-field cf-full">
            <label className="cf-label">
              certificate image{" "}
              {isEditMode ? (
                <span className="cf-optional">leave empty to keep current</span>
              ) : (
                <span className="cf-req">*</span>
              )}
            </label>
            {imagePreview ? (
              <div className="cf-preview-wrap">
                <img
                  className="cf-preview-img"
                  src={imagePreview}
                  alt="preview"
                />
                <button
                  type="button"
                  className="cf-clear-btn"
                  onClick={clearImage}
                  aria-label="Remove image"
                >
                  ✕
                </button>
                <span className="cf-preview-label">
                  {imageFile ? "new image" : "current image"}
                </span>
              </div>
            ) : (
              <label className="cf-upload-zone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <i
                  className="ti ti-photo-up cf-upload-icon"
                  aria-hidden="true"
                ></i>
                <div className="cf-upload-text">
                  drop image or <span className="cf-upload-link">browse</span>
                </div>
                <div className="cf-upload-hint">JPG / PNG · max 5MB</div>
              </label>
            )}
          </div>

          <div className="cf-field cf-full">
            <label className="cf-label">
              certificate pdf <span className="cf-optional">optional</span>
            </label>
            {pdfName ? (
              <div className="cf-pdf-row">
                <i
                  className="ti ti-file-type-pdf cf-pdf-icon"
                  aria-hidden="true"
                ></i>
                <span className="cf-pdf-name">{pdfName}</span>
                <button
                  type="button"
                  className="cf-pdf-clear"
                  onClick={clearPdf}
                  aria-label="Remove PDF"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="cf-upload-zone cf-upload-zone--pdf">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handlePdf}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <i
                  className="ti ti-upload cf-upload-icon"
                  aria-hidden="true"
                ></i>
                <div className="cf-upload-text">
                  drop PDF or <span className="cf-upload-link">browse</span>
                </div>
                <div className="cf-upload-hint">PDF · max 10MB</div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="cf-footer">
        {msgOk && (
          <span className="cf-msg-ok">
            <i className="ti ti-check" aria-hidden="true"></i> {msgOk}
          </span>
        )}
        {msgErr && <span className="cf-msg-err">⚠ {msgErr}</span>}
        {!msgOk && !msgErr && (
          <span className="cf-hint">changes go live in ~60s after submit</span>
        )}

        {isEditMode ? (
          <button
            type="submit"
            className="cf-btn cf-btn--save"
            disabled={loading}
          >
            {loading ? (
              "saving…"
            ) : (
              <>
                <i className="ti ti-device-floppy" aria-hidden="true"></i> save
                changes
              </>
            )}
          </button>
        ) : (
          <button
            type="submit"
            className="cf-btn cf-btn--add"
            disabled={loading}
          >
            {loading ? (
              "adding…"
            ) : (
              <>
                <i className="ti ti-plus" aria-hidden="true"></i> add
                certification
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

export default CertForm;
