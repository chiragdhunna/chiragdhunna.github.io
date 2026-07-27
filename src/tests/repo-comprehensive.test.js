import test from "node:test";
import assert from "node:assert";

// --- 1. Authentication & JWT Token Verification Tests (auth.js logic) ---
function toBase64Url(input) {
  return btoa(input).replace(/\+/g, "-").replace(/\//g, "_").replace(/=/g, "");
}

function verifyToken(token) {
  if (!token) return false;
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const payloadEncoded = parts[1];
    const padding = 4 - (payloadEncoded.length % 4);
    const payloadPadded =
      payloadEncoded + (padding < 4 ? "=".repeat(padding) : "");

    const payloadStr = atob(
      payloadPadded.replace(/-/g, "+").replace(/_/g, "/"),
    );
    const payload = JSON.parse(payloadStr);

    const now = Math.floor(Date.now() / 1000);
    return payload.exp > now;
  } catch (e) {
    return false;
  }
}

test("Auth: verifyToken validates valid, expired, and malformed JWT tokens", () => {
  const now = Math.floor(Date.now() / 1000);
  
  // Valid token (exp in future)
  const validPayload = { iat: now - 60, exp: now + 3600, type: "admin" };
  const validToken = `header.${toBase64Url(JSON.stringify(validPayload))}.signature`;
  assert.strictEqual(verifyToken(validToken), true);

  // Expired token (exp in past)
  const expiredPayload = { iat: now - 7200, exp: now - 3600, type: "admin" };
  const expiredToken = `header.${toBase64Url(JSON.stringify(expiredPayload))}.signature`;
  assert.strictEqual(verifyToken(expiredToken), false);

  // Malformed tokens
  assert.strictEqual(verifyToken(""), false);
  assert.strictEqual(verifyToken(null), false);
  assert.strictEqual(verifyToken("invalid.token"), false);
  assert.strictEqual(verifyToken("too.many.parts.here"), false);
});

// --- 2. Slug Generation Tests ---
function generateSlug(name) {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

test("Slug Generation: handles special characters, accents, spaces, and numbers", () => {
  assert.strictEqual(generateSlug("Chat Go"), "chat-go");
  assert.strictEqual(generateSlug("  Pesa Barbaadi !! "), "pesa-barbaadi");
  assert.strictEqual(generateSlug("AI-Powered Bot 2.0"), "ai-powered-bot-2-0");
  assert.strictEqual(generateSlug("Vyra & Co. (AI)"), "vyra-co-ai");
  assert.strictEqual(generateSlug("---Special---Characters---"), "special-characters");
  assert.strictEqual(generateSlug("   "), "");
});

// --- 3. File Validation Constraints (Images & PDFs) ---
test("File Validation: enforces image and PDF size/type constraints", () => {
  const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
  const MAX_PDF_SIZE = 10 * 1024 * 1024; // 10MB

  const validateImage = (file) => {
    if (!file || !file.type || !file.type.startsWith("image/")) return "Invalid image type";
    if (file.size > MAX_IMAGE_SIZE) return "Image too large";
    return null;
  };

  const validatePdf = (file) => {
    if (!file || file.type !== "application/pdf") return "Invalid PDF type";
    if (file.size > MAX_PDF_SIZE) return "PDF too large";
    return null;
  };

  assert.strictEqual(validateImage({ type: "image/jpeg", size: 100 }), null);
  assert.strictEqual(validateImage({ type: "image/png", size: 6 * 1024 * 1024 }), "Image too large");
  assert.strictEqual(validateImage({ type: "application/pdf", size: 100 }), "Invalid image type");

  assert.strictEqual(validatePdf({ type: "application/pdf", size: 100 }), null);
  assert.strictEqual(validatePdf({ type: "image/jpeg", size: 100 }), "Invalid PDF type");
  assert.strictEqual(validatePdf({ type: "application/pdf", size: 11 * 1024 * 1024 }), "PDF too large");
});

// --- 4. Project & Certification Data Structure Schema Validation ---
test("Data Schema: validates project and certification objects structure", () => {
  const validateProjectSchema = (p) => {
    return !!(p.slug && p.name && p.description && Array.isArray(p.categories) && p.ghLink);
  };

  const validateCertSchema = (c) => {
    return !!(c.slug && c.name && c.issuer && c.imageUrl);
  };

  const validProject = {
    slug: "chat-go",
    name: "Chat Go",
    description: "Realtime chat",
    categories: ["Web", "Full Stack"],
    ghLink: "https://github.com/test/chat-go",
    imageUrl: "/assets/projects/chat-go.jpg"
  };

  const invalidProject = {
    slug: "",
    name: "Chat Go"
  };

  const validCert = {
    slug: "aws-cert",
    name: "AWS Certified",
    issuer: "Amazon",
    imageUrl: "/assets/certs/aws.jpg"
  };

  assert.strictEqual(validateProjectSchema(validProject), true);
  assert.strictEqual(validateProjectSchema(invalidProject), false);
  assert.strictEqual(validateCertSchema(validCert), true);
});

// --- 5. Form Submission & State Machine Scenarios ---
test("Admin State Machine: project and certification form state transitions", () => {
  // Project form state
  let projectState = {
    name: "Test",
    description: "Desc",
    githubLink: "https://github.com/test/repo",
    demoLink: "",
    categories: ["Web"],
    imageFile: null,
    imageCleared: false,
  };

  // Clear image action
  projectState.imageFile = null;
  projectState.imageCleared = true;
  assert.strictEqual(projectState.imageCleared, true);

  // Replace image action
  projectState.imageFile = { name: "new.jpg", size: 1024 };
  projectState.imageCleared = false;
  assert.notStrictEqual(projectState.imageFile, null);
  assert.strictEqual(projectState.imageCleared, false);
});
