import React, { useState, useEffect } from "react";
import { addProject, updateProject } from "./githubApi";
import "./ProjectForm.css";

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_OPTIONS = ["Web", "Mobile", "Full Stack", "Backend"];

function ProjectForm({ editProject, onSuccess, onCancelEdit }) {
  const isEditMode = !!editProject;

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    githubLink: "",
    demoLink: "",
    categories: [],
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [msgOk, setMsgOk] = useState("");
  const [msgErr, setMsgErr] = useState("");
  const [customCatInput, setCustomCatInput] = useState("");

  useEffect(() => {
    if (editProject) {
      setFormData({
        name: editProject.name || "",
        description: editProject.description || "",
        githubLink: editProject.ghLink || "",
        demoLink: editProject.demoLink || "",
        categories: editProject.categories || [],
      });
      setImagePreview(editProject.imageUrl || null);
    } else {
      setFormData({
        name: "",
        description: "",
        githubLink: "",
        demoLink: "",
        categories: [],
      });
      setImagePreview(null);
    }
    setImageFile(null);
    setMsgOk("");
    setMsgErr("");
    setCustomCatInput("");
  }, [editProject]);

  const handleInput = (e) => {
    const { name, value } = e.target;
    setFormData((p) => ({ ...p, [name]: value }));
  };

  const toggleCat = (cat) => {
    setFormData((p) => ({
      ...p,
      categories: p.categories.includes(cat)
        ? p.categories.filter((c) => c !== cat)
        : [...p.categories, cat],
    }));
  };

  const addCustomCat = () => {
    const val = customCatInput.trim();
    if (val && !formData.categories.includes(val)) {
      setFormData((p) => ({ ...p, categories: [...p.categories, val] }));
    }
    setCustomCatInput("");
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

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(isEditMode ? editProject?.imageUrl || null : null);
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsgOk("");
    setMsgErr("");
    const { name, description, githubLink, demoLink, categories } = formData;
    if (!name.trim()) return setMsgErr("project name is required");
    if (!description.trim()) return setMsgErr("description is required");
    if (!githubLink.trim()) return setMsgErr("github link is required");
    if (!categories.length) return setMsgErr("select at least one category");
    if (!isEditMode && !imageFile) return setMsgErr("image is required");
    try {
      new URL(githubLink);
      if (demoLink) new URL(demoLink);
    } catch {
      return setMsgErr("please enter valid URLs");
    }

    setLoading(true);
    try {
      if (isEditMode) {
        const payload = {
          name: name.trim(),
          description: description.trim(),
          ghLink: githubLink.trim(),
          demoLink: demoLink.trim() || null,
          categories,
        };
        if (imageFile) payload.imageBase64 = await resizeImage(imageFile);
        await updateProject(editProject.slug, payload);
        setMsgOk("✓ updated! deploying in ~60s");
      } else {
        const slug = generateSlug(name);
        const imageBase64 = await resizeImage(imageFile);
        await addProject({
          name: name.trim(),
          description: description.trim(),
          githubLink: githubLink.trim(),
          demoLink: demoLink.trim() || null,
          categories,
          imageBase64,
          slug,
        });
        setMsgOk("✓ added! deploying in ~60s");
        setFormData({
          name: "",
          description: "",
          githubLink: "",
          demoLink: "",
          categories: [],
        });
        setImageFile(null);
        setImagePreview(null);
      }
      if (onSuccess) setTimeout(onSuccess, 2000);
    } catch (err) {
      setMsgErr(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="pf-form" onSubmit={handleSubmit}>
      <div className="pf-body">
        <div className="pf-grid">
          <div className="pf-field pf-full">
            <label className="pf-label">
              project name <span className="pf-req">*</span>
            </label>
            <input
              className="pf-input"
              type="text"
              name="name"
              value={formData.name}
              onChange={handleInput}
              placeholder="e.g. Chat Go"
              disabled={loading}
            />
          </div>

          <div className="pf-field pf-full">
            <label className="pf-label">
              description <span className="pf-req">*</span>
            </label>
            <textarea
              className="pf-input pf-textarea"
              name="description"
              value={formData.description}
              onChange={handleInput}
              placeholder="What does this project do?"
              disabled={loading}
            />
          </div>

          <div className="pf-field pf-full">
            <label className="pf-label">
              categories <span className="pf-req">*</span>
            </label>
            <div className="pf-cats">
              {/* Predefined category pills */}
              {CATEGORY_OPTIONS.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  className={`pf-cat ${formData.categories.includes(cat) ? "pf-cat--on" : ""}`}
                  onClick={() => toggleCat(cat)}
                  disabled={loading}
                >
                  {cat}
                </button>
              ))}

              {/* Custom category pills */}
              {formData.categories
                .filter((c) => !CATEGORY_OPTIONS.includes(c))
                .map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    className="pf-cat pf-cat--on pf-cat--custom"
                    onClick={() => toggleCat(cat)}
                    disabled={loading}
                    title="click to remove"
                  >
                    {cat} ✕
                  </button>
                ))}

              {/* Custom category input */}
              <div className="pf-cat-add">
                <input
                  className="pf-cat-input"
                  type="text"
                  placeholder="+ custom…"
                  value={customCatInput}
                  onChange={(e) => setCustomCatInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      addCustomCat();
                    }
                  }}
                  disabled={loading}
                />
              </div>
            </div>
          </div>

          <div className="pf-field">
            <label className="pf-label">
              github <span className="pf-req">*</span>
            </label>
            <input
              className="pf-input"
              type="url"
              name="githubLink"
              value={formData.githubLink}
              onChange={handleInput}
              placeholder="https://github.com/…"
              disabled={loading}
            />
          </div>

          <div className="pf-field">
            <label className="pf-label">
              demo link
              <span className="pf-optional"> optional</span>
            </label>
            <input
              className="pf-input"
              type="url"
              name="demoLink"
              value={formData.demoLink}
              onChange={handleInput}
              placeholder="https://example.com"
              disabled={loading}
            />
          </div>

          <div className="pf-field pf-full">
            <label className="pf-label" id="img-label">
              project image{" "}
              {isEditMode ? (
                <span className="pf-optional">
                  {" "}
                  leave empty to keep current
                </span>
              ) : (
                <span className="pf-req">*</span>
              )}
            </label>

            {imagePreview ? (
              <div className="pf-preview-wrap">
                <img
                  className="pf-preview-img"
                  src={imagePreview}
                  alt="preview"
                />
                <button
                  type="button"
                  className="pf-img-clear"
                  onClick={clearImage}
                  aria-label="Remove image"
                >
                  ✕
                </button>
              </div>
            ) : (
              <label className="pf-upload-zone">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImage}
                  disabled={loading}
                  style={{ display: "none" }}
                />
                <i
                  className="ti ti-photo-up pf-upload-icon"
                  aria-hidden="true"
                ></i>
                <div className="pf-upload-text">
                  drop image or <span className="pf-upload-link">browse</span>
                </div>
                <div className="pf-upload-hint">JPG / PNG · max 5MB</div>
              </label>
            )}
          </div>
        </div>
      </div>

      <div className="pf-footer">
        {msgOk && (
          <span className="pf-msg-ok">
            <i className="ti ti-check" aria-hidden="true"></i> {msgOk}
          </span>
        )}
        {msgErr && <span className="pf-msg-err">⚠ {msgErr}</span>}
        {!msgOk && !msgErr && (
          <span className="pf-hint">changes go live in ~60s after submit</span>
        )}

        {isEditMode ? (
          <button
            type="submit"
            className="pf-btn pf-btn--save"
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
            className="pf-btn pf-btn--add"
            disabled={loading}
          >
            {loading ? (
              "adding…"
            ) : (
              <>
                <i className="ti ti-plus" aria-hidden="true"></i> add project
              </>
            )}
          </button>
        )}
      </div>
    </form>
  );
}

export default ProjectForm;
