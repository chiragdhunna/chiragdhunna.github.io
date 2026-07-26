import test from "node:test";
import assert from "node:assert";

// 1. Slug generation tests
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test("generateSlug: handles various naming conventions and edge cases", () => {
  assert.strictEqual(generateSlug("Chat Go"), "chat-go");
  assert.strictEqual(generateSlug("  Pesa Barbaadi !! "), "pesa-barbaadi");
  assert.strictEqual(generateSlug("AI-Powered Bot 2.0"), "ai-powered-bot-2-0");
  assert.strictEqual(generateSlug("Portfolio Admin Panel"), "portfolio-admin-panel");
  assert.strictEqual(generateSlug("Vyra & Co. (AI)"), "vyra-co-ai");
  assert.strictEqual(generateSlug("---Special---Characters---"), "special-characters");
  assert.strictEqual(generateSlug("   "), "");
  assert.strictEqual(generateSlug("12345"), "12345");
});

// 2. Image validation tests
test("Image validation: enforces type and size constraints (< 5MB, image/*)", () => {
  const MAX_SIZE = 5 * 1024 * 1024;

  const validateFile = (file) => {
    if (!file || !file.type || !file.type.startsWith("image/")) {
      return "Please select a valid image file";
    }
    if (file.size > MAX_SIZE) {
      return "Image must be under 5MB";
    }
    return null;
  };

  const validJpeg = { type: "image/jpeg", size: 2 * 1024 * 1024 };
  const validPng = { type: "image/png", size: 500 * 1024 };
  const oversizedImage = { type: "image/jpeg", size: 6 * 1024 * 1024 };
  const pdfFile = { type: "application/pdf", size: 1024 * 1024 };
  const textFile = { type: "text/plain", size: 100 };

  assert.strictEqual(validateFile(validJpeg), null);
  assert.strictEqual(validateFile(validPng), null);
  assert.strictEqual(validateFile(oversizedImage), "Image must be under 5MB");
  assert.strictEqual(validateFile(pdfFile), "Please select a valid image file");
  assert.strictEqual(validateFile(textFile), "Please select a valid image file");
});

// 3. Category management tests
test("Category management: toggling predefined categories and adding/removing custom categories", () => {
  const CATEGORY_OPTIONS = ["Web", "Mobile", "Full Stack", "Backend"];
  let categories = ["Web"];

  const toggleCat = (cat, currentCats) => {
    return currentCats.includes(cat)
      ? currentCats.filter((c) => c !== cat)
      : [...currentCats, cat];
  };

  // Toggle existing (remove)
  categories = toggleCat("Web", categories);
  assert.deepStrictEqual(categories, []);

  // Toggle new (add)
  categories = toggleCat("Mobile", categories);
  assert.deepStrictEqual(categories, ["Mobile"]);

  // Add custom category
  const addCustom = (inputVal, currentCats) => {
    const val = inputVal.trim();
    if (val && !currentCats.includes(val)) {
      return [...currentCats, val];
    }
    return currentCats;
  };

  categories = addCustom("AI", categories);
  assert.deepStrictEqual(categories, ["Mobile", "AI"]);

  // Attempt duplicate custom category
  categories = addCustom("AI", categories);
  assert.deepStrictEqual(categories, ["Mobile", "AI"]);

  // Attempt empty custom category
  categories = addCustom("   ", categories);
  assert.deepStrictEqual(categories, ["Mobile", "AI"]);
});

// 4. URL validation tests
test("URL validation: validates GitHub links and optional demo links", () => {
  const validateUrls = (githubLink, demoLink) => {
    try {
      new URL(githubLink);
      if (demoLink && demoLink.trim() !== "") {
        new URL(demoLink);
      }
      return null;
    } catch {
      return "please enter valid URLs";
    }
  };

  assert.strictEqual(validateUrls("https://github.com/user/repo", "https://example.com"), null);
  assert.strictEqual(validateUrls("https://github.com/user/repo", ""), null);
  assert.strictEqual(validateUrls("https://github.com/user/repo", null), null);
  assert.strictEqual(validateUrls("not-a-url", "https://example.com"), "please enter valid URLs");
  assert.strictEqual(validateUrls("https://github.com/user/repo", "invalid-demo"), "please enter valid URLs");
});

// 5. Form submission validation scenarios
test("Form submission validation: checks required fields for Add vs Edit modes", () => {
  const validateForm = ({ name, description, githubLink, categories, imageFile, isEditMode, imageCleared }) => {
    if (!name || !name.trim()) return "project name is required";
    if (!description || !description.trim()) return "description is required";
    if (!githubLink || !githubLink.trim()) return "github link is required";
    if (!categories || categories.length === 0) return "select at least one category";
    if (!isEditMode && !imageFile) return "image is required";
    return null;
  };

  // Add mode missing image
  assert.strictEqual(
    validateForm({ name: "Proj", description: "Desc", githubLink: "https://gh.com/a/b", categories: ["Web"], imageFile: null, isEditMode: false }),
    "image is required"
  );

  // Add mode valid
  assert.strictEqual(
    validateForm({ name: "Proj", description: "Desc", githubLink: "https://gh.com/a/b", categories: ["Web"], imageFile: { size: 100 }, isEditMode: false }),
    null
  );

  // Edit mode without new image file (allowed if existing image or cleared)
  assert.strictEqual(
    validateForm({ name: "Proj", description: "Desc", githubLink: "https://gh.com/a/b", categories: ["Web"], imageFile: null, isEditMode: true }),
    null
  );

  // Missing name
  assert.strictEqual(
    validateForm({ name: "", description: "Desc", githubLink: "https://gh.com/a/b", categories: ["Web"], imageFile: { size: 100 }, isEditMode: false }),
    "project name is required"
  );
});

// 6. Image clearing and replacing state machine tests
test("Image state machine: clearing image vs replacing image vs keeping current image", () => {
  let state = {
    imageFile: null,
    imagePreview: "/assets/projects/existing.jpg",
    imageCleared: false,
  };

  // Action: Clear image
  const clearImage = () => {
    state.imageFile = null;
    state.imagePreview = null;
    state.imageCleared = true;
  };

  clearImage();
  assert.strictEqual(state.imageFile, null);
  assert.strictEqual(state.imagePreview, null);
  assert.strictEqual(state.imageCleared, true);

  // Action: Upload replacement image
  const handleImage = (file) => {
    state.imageFile = file;
    state.imageCleared = false;
    state.imagePreview = "data:image/jpeg;base64,newpreview";
  };

  handleImage({ type: "image/jpeg", size: 1024 });
  assert.notStrictEqual(state.imageFile, null);
  assert.strictEqual(state.imageCleared, false);
  assert.strictEqual(state.imagePreview, "data:image/jpeg;base64,newpreview");

  // Action: Build payload for updateProject based on state
  const buildPayload = (s, formData) => {
    const payload = { ...formData };
    if (s.imageFile) {
      payload.imageBase64 = "processed_base64_string";
    } else if (s.imageCleared) {
      payload.imageCleared = true;
      payload.imageUrl = null;
    }
    return payload;
  };

  // Test payload when image is cleared
  state.imageFile = null;
  state.imageCleared = true;
  let payloadCleared = buildPayload(state, { name: "Project" });
  assert.strictEqual(payloadCleared.imageCleared, true);
  assert.strictEqual(payloadCleared.imageUrl, null);
  assert.strictEqual(payloadCleared.imageBase64, undefined);

  // Test payload when image is replaced with new file
  state.imageFile = { name: "new.jpg" };
  state.imageCleared = false;
  let payloadReplaced = buildPayload(state, { name: "Project" });
  assert.strictEqual(payloadReplaced.imageBase64, "processed_base64_string");
  assert.strictEqual(payloadReplaced.imageCleared, undefined);

  // Test payload when keeping current image (neither cleared nor new file)
  state.imageFile = null;
  state.imageCleared = false;
  let payloadKept = buildPayload(state, { name: "Project" });
  assert.strictEqual(payloadKept.imageBase64, undefined);
  assert.strictEqual(payloadKept.imageCleared, undefined);
});

test("Certification Form & API state machine: clearing and replacing certification images and PDFs", () => {
  let certState = {
    imageFile: null,
    imagePreview: "/assets/certs/aws.jpg",
    imageCleared: false,
    pdfFile: null,
    pdfName: "existing.pdf",
    pdfCleared: false,
  };

  // Clear certification image and PDF
  const clearCertAssets = () => {
    certState.imageFile = null;
    certState.imagePreview = null;
    certState.imageCleared = true;
    certState.pdfFile = null;
    certState.pdfName = "";
    certState.pdfCleared = true;
  };

  clearCertAssets();
  assert.strictEqual(certState.imagePreview, null);
  assert.strictEqual(certState.imageCleared, true);
  assert.strictEqual(certState.pdfName, "");
  assert.strictEqual(certState.pdfCleared, true);

  // Build payload for updateCertification
  const buildCertPayload = (s) => {
    const payload = { name: "AWS Cert", issuer: "AWS" };
    if (s.imageFile) {
      payload.imageBase64 = "base64_img";
    } else if (s.imageCleared) {
      payload.imageCleared = true;
    }
    if (s.pdfFile) {
      payload.pdfBase64 = "base64_pdf";
    } else if (s.pdfCleared) {
      payload.pdfCleared = true;
    }
    return payload;
  };

  let payload = buildCertPayload(certState);
  assert.strictEqual(payload.imageCleared, true);
  assert.strictEqual(payload.pdfCleared, true);
});
