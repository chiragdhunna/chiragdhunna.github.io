import React, { useState } from "react";
import { addProject } from "./githubApi";
import "./ProjectForm.css";

function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

const CATEGORY_OPTIONS = ["Web", "Mobile", "Full Stack", "Backend"];

function ProjectForm({ onSuccess }) {
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
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCategoryToggle = (category) => {
    setFormData((prev) => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter((c) => c !== category)
        : [...prev.categories, category],
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

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

    const reader = new FileReader();
    reader.onload = (e) => setImagePreview(e.target.result);
    reader.readAsDataURL(file);
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
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (!formData.name.trim()) return setError("Project name is required");
    if (!formData.description.trim())
      return setError("Description is required");
    if (!formData.githubLink.trim()) return setError("GitHub link is required");
    if (formData.categories.length === 0)
      return setError("Select at least one category");
    if (!imageFile) return setError("Project image is required");

    try {
      new URL(formData.githubLink);
      if (formData.demoLink) new URL(formData.demoLink);
    } catch {
      return setError("Please enter valid URLs");
    }

    setLoading(true);

    try {
      const slug = generateSlug(formData.name);
      const imageBase64 = await resizeImage(imageFile);

      await addProject({
        name: formData.name.trim(),
        description: formData.description.trim(),
        githubLink: formData.githubLink.trim(),
        demoLink: formData.demoLink.trim() || null,
        categories: formData.categories,
        imageBase64,
        slug,
      });

      setSuccess("✓ Submitted! The live site will update in ~60 seconds.");
      setFormData({
        name: "",
        description: "",
        githubLink: "",
        demoLink: "",
        categories: [],
      });
      setImageFile(null);
      setImagePreview(null);

      if (onSuccess) setTimeout(onSuccess, 2000);
    } catch (err) {
      setError("Submission failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="project-form" onSubmit={handleSubmit}>
      <h2>Add New Project</h2>

      <div className="form-group">
        <label htmlFor="name">Project Name *</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
          placeholder="e.g., Portfolio CMS"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="description">Description *</label>
        <textarea
          id="description"
          name="description"
          value={formData.description}
          onChange={handleInputChange}
          placeholder="Describe your project..."
          rows="4"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label>
          Categories *{" "}
          <span className="label-hint">(select all that apply)</span>
        </label>
        <div className="category-pills">
          {CATEGORY_OPTIONS.map((cat) => (
            <button
              key={cat}
              type="button"
              className={`category-pill ${formData.categories.includes(cat) ? "category-pill--active" : ""}`}
              onClick={() => handleCategoryToggle(cat)}
              disabled={loading}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      <div className="form-group">
        <label htmlFor="githubLink">GitHub Link *</label>
        <input
          type="url"
          id="githubLink"
          name="githubLink"
          value={formData.githubLink}
          onChange={handleInputChange}
          placeholder="https://github.com/username/project"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="demoLink">Demo Link (Optional)</label>
        <input
          type="url"
          id="demoLink"
          name="demoLink"
          value={formData.demoLink}
          onChange={handleInputChange}
          placeholder="https://example.com/demo"
          disabled={loading}
        />
      </div>

      <div className="form-group">
        <label htmlFor="image">Project Image (JPG/PNG) *</label>
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

      {error && <div className="form-error">{error}</div>}
      {success && <div className="form-success">{success}</div>}

      <button type="submit" disabled={loading} className="submit-btn">
        {loading ? "Submitting..." : "Add Project"}
      </button>
    </form>
  );
}

export default ProjectForm;
