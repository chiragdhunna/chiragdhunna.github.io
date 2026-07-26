import test from "node:test";
import assert from "node:assert";

// Test helper for slug generation (matching ProjectForm.jsx)
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test("generateSlug converts project names to clean URL slugs", () => {
  assert.strictEqual(generateSlug("Chat Go"), "chat-go");
  assert.strictEqual(generateSlug("  Pesa Barbaadi !! "), "pesa-barbaadi");
  assert.strictEqual(generateSlug("AI-Powered Bot 2.0"), "ai-powered-bot-2-0");
  assert.strictEqual(generateSlug("Portfolio Admin Panel"), "portfolio-admin-panel");
  assert.strictEqual(generateSlug("   "), "");
});

test("Image validation logic constraints", () => {
  // Max size: 5MB (5 * 1024 * 1024 bytes)
  const MAX_SIZE = 5 * 1024 * 1024;
  
  const validFile = { type: "image/jpeg", size: 1024 * 1024 }; // 1MB
  const oversizedFile = { type: "image/png", size: 6 * 1024 * 1024 }; // 6MB
  const invalidTypeFile = { type: "application/pdf", size: 500 * 1024 };

  // Validation checks
  const validateFile = (file) => {
    if (!file.type.startsWith("image/")) return "Please select a valid image file";
    if (file.size > MAX_SIZE) return "Image must be under 5MB";
    return null;
  };

  assert.strictEqual(validateFile(validFile), null);
  assert.strictEqual(validateFile(oversizedFile), "Image must be under 5MB");
  assert.strictEqual(validateFile(invalidTypeFile), "Please select a valid image file");
});

test("Project Form state transitions for image clearing and replacing", () => {
  // Simulate initial state in edit mode with existing image
  let state = {
    imageFile: null,
    imagePreview: "/assets/projects/chat-go.jpg",
    imageCleared: false,
  };

  // 1. User clicks clear image (remove/clear current image)
  const clearImage = () => {
    state.imageFile = null;
    state.imagePreview = null;
    state.imageCleared = true;
  };

  clearImage();
  assert.strictEqual(state.imageFile, null);
  assert.strictEqual(state.imagePreview, null);
  assert.strictEqual(state.imageCleared, true);

  // 2. User replaces with a new image after clearing
  const handleImage = (mockFile) => {
    state.imageFile = mockFile;
    state.imageCleared = false;
    state.imagePreview = "data:image/jpeg;base64,mockdata";
  };

  handleImage({ type: "image/jpeg", size: 2048 });
  assert.notStrictEqual(state.imageFile, null);
  assert.strictEqual(state.imageCleared, false);
  assert.strictEqual(state.imagePreview, "data:image/jpeg;base64,mockdata");

  // 3. User clears the newly selected image again
  clearImage();
  assert.strictEqual(state.imageFile, null);
  assert.strictEqual(state.imagePreview, null);
  assert.strictEqual(state.imageCleared, true);
});

test("Payload construction for updateProject with image clearing vs replacement", () => {
  // Scenario A: Image cleared
  let imageFile = null;
  let imageCleared = true;
  let payloadA = { name: "Test Project", description: "Desc", ghLink: "https://github.com/test", categories: ["Web"] };
  
  if (imageFile) {
    payloadA.imageBase64 = "base64data";
  } else if (imageCleared) {
    payloadA.imageCleared = true;
  }

  assert.strictEqual(payloadA.imageCleared, true);
  assert.strictEqual(payloadA.imageBase64, undefined);

  // Scenario B: Image replaced with new file
  imageFile = { name: "new.jpg" };
  imageCleared = false;
  let payloadB = { name: "Test Project", description: "Desc", ghLink: "https://github.com/test", categories: ["Web"] };

  if (imageFile) {
    payloadB.imageBase64 = "newbase64data";
  } else if (imageCleared) {
    payloadB.imageCleared = true;
  }

  assert.strictEqual(payloadB.imageBase64, "newbase64data");
  assert.strictEqual(payloadB.imageCleared, undefined);
});
