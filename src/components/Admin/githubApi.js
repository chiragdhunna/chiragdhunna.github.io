/**
 * GitHub API integration for CMS operations
 * Uses Cloudflare Worker proxy in production, direct API in development
 */

import { getStoredToken } from "./auth";

const GITHUB_API = "https://api.github.com/repos";
const OWNER = "chiragdhunna";
const REPO = "chiragdhunna.github.io";
const BRANCH = "master";
const WORKER_URL = "https://portfolio-cms-worker.chigsdroid.workers.dev";

/**
 * Determine if running in production or development
 */
function isProduction() {
  return import.meta.env.PROD;
}

/**
 * Unicode-safe base64 encoder (handles emojis, accents, CJK, etc.)
 * btoa() crashes on any character outside Latin-1 — this fixes that.
 */
function toBase64(str) {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Fetch a JSON file from GitHub.
 * In prod: Uses the Cloudflare Worker so the browser never needs repo access.
 * In dev: Uses the direct GitHub API with the local PAT.
 *
 * @param {string} path - Repo-relative path, e.g. "public/data/certs.json"
 * @returns {{ content: any, sha?: string } | null}
 */
async function getFileFromGitHub(path) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  if (isProduction()) {
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", path }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`[getFileFromGitHub] File not found (404): ${path}`);
        return null;
      }

      const error = await response.json().catch(() => ({}));
      throw new Error(`Fetch failed: ${error.error || response.statusText}`);
    }

    const data = await response.json();

    if (!data.content) {
      throw new Error("Worker get response is missing content");
    }

    // GitHub base64 includes newlines — strip them before decoding
    const cleaned = data.content.replace(/\s/g, "");
    const parsed = JSON.parse(atob(cleaned));

    return { content: parsed, sha: data.sha };
  }

  const pat = import.meta.env.VITE_GITHUB_PAT;

  if (!pat) {
    throw new Error("GitHub PAT not available in development");
  }

  const response = await fetch(
    `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (!response.ok) {
    if (response.status === 404) {
      console.warn(`[getFileFromGitHub] File not found (404): ${path}`);
      return null;
    }

    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  const data = await response.json();
  // Strip whitespace/newlines from GitHub's base64 before decoding
  const cleaned = data.content.replace(/\s/g, "");
  const parsed = JSON.parse(atob(cleaned));

  return { content: parsed, sha: data.sha };
}

/**
 * Upload a file to GitHub
 * In prod: Uses Cloudflare Worker
 * In dev: Uses direct GitHub API
 *
 * @param {string} path - Repo-relative path to the file
 * @param {string} base64Content - Base64 content (with or without data URL prefix)
 * @returns {string} SHA of the uploaded file
 */
async function uploadFileToGitHub(path, base64Content) {
  try {
    const token = getStoredToken();

    if (!token) {
      throw new Error("Not authenticated");
    }

    if (isProduction()) {
      // Production: Use Cloudflare Worker
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "upload",
          path,
          content: base64Content.split(",")[1], // Remove data URL prefix
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Upload failed: ${error.error}`);
      }

      const data = await response.json();
      return data.sha;
    }

    // Development: Use direct GitHub API
    const pat = import.meta.env.VITE_GITHUB_PAT;

    if (!pat) {
      throw new Error("GitHub PAT not available in development");
    }

    // Get existing file SHA (needed to overwrite an existing file)
    let sha = null;

    try {
      const getResponse = await fetch(
        `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${pat}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist yet, that's fine
      console.warn("Existing file not found:", e);
    }

    // Upload the file
    const putBody = {
      message: "chore: upload asset for CMS",
      content: base64Content.split(",")[1],
    };

    if (sha) {
      putBody.sha = sha;
    }

    const response = await fetch(
      `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${pat}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(putBody),
      },
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(
        `Failed to upload file: ${errorData.message || response.statusText}`,
      );
    }

    const data = await response.json();
    return data.content.sha;
  } catch (error) {
    console.error(`Failed to upload ${path}:`, error);
    throw error;
  }
}

/**
 * Dispatch a CMS event to GitHub Actions
 * In prod: Uses Cloudflare Worker
 * In dev: Uses direct GitHub API
 *
 * @param {string} eventType - The repository_dispatch event type
 * @param {object} payload - The client_payload to send with the event
 * @returns {boolean} true on success
 */
export async function dispatchCmsEvent(eventType, payload) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    if (isProduction()) {
      // Production: Use Cloudflare Worker
      const response = await fetch(WORKER_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          action: "dispatch",
          eventType,
          payload,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`Dispatch failed: ${error.error}`);
      }

      return true;
    }

    // Development: Use direct GitHub API
    const pat = import.meta.env.VITE_GITHUB_PAT;

    if (!pat) {
      throw new Error("GitHub PAT not available in development");
    }

    const response = await fetch(`${GITHUB_API}/${OWNER}/${REPO}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: payload,
      }),
    });

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;

      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch (e) {
        console.warn("Non-JSON error response:", e);
      }

      throw new Error(errorMessage);
    }

    return true;
  } catch (error) {
    console.error("Failed to dispatch CMS event:", error);
    throw error;
  }
}

/**
 * Add a new certification.
 * Uploads image (and optional PDF), reads the existing certs.json,
 * appends the new entry, then commits the updated file back.
 */
export async function addCertification(certData) {
  // 1. Upload image
  const imagePath = `public/assets/certs/${certData.slug}.jpg`;
  console.log(`[addCertification] Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, certData.imageBase64);

  // 2. Upload PDF if provided
  if (certData.pdfBase64) {
    const pdfPath = `public/assets/certs/${certData.slug}.pdf`;
    console.log(`[addCertification] Uploading PDF to ${pdfPath}...`);
    await uploadFileToGitHub(pdfPath, certData.pdfBase64);
  }

  // 3. Read existing certs.json — THROW on failure so we never
  //    silently start with an empty list and wipe existing certs.
  const certsPath = "public/data/certs.json";
  let certs = [];

  console.log(`[addCertification] Reading existing certs.json...`);

  const existing = await getFileFromGitHub(certsPath);

  if (existing === null) {
    // File doesn't exist yet — this is the very first cert, start fresh
    console.log(`[addCertification] certs.json not found, starting fresh.`);
    certs = [];
  } else if (Array.isArray(existing.content)) {
    certs = existing.content;
    console.log(`[addCertification] Found ${certs.length} existing cert(s).`);
  } else {
    // File exists but content is not an array — something is wrong, abort
    throw new Error(
      `[addCertification] certs.json has unexpected shape: ${JSON.stringify(existing.content).slice(0, 100)}`,
    );
  }

  // 4. Append — never replace
  certs.push({
    id: certData.slug,
    slug: certData.slug,
    name: certData.name,
    issuer: certData.issuer,
    issueDate: certData.issueDate || null,
    imageUrl: `/assets/certs/${certData.slug}.jpg`,
    pdfUrl: certData.pdfBase64 ? `/assets/certs/${certData.slug}.pdf` : null,
    credentialUrl: certData.credentialUrl || null,
    createdAt: new Date().toISOString(),
  });

  console.log(
    `[addCertification] Uploading updated certs.json with ${certs.length} cert(s)...`,
  );

  // 5. Encode with Unicode-safe encoder and commit back
  const updatedCertsContent = toBase64(JSON.stringify(certs, null, 2));
  await uploadFileToGitHub(
    certsPath,
    `data:application/json;base64,${updatedCertsContent}`,
  );

  console.log(`[addCertification] Done. Dispatching event...`);

  // 6. Dispatch GitHub Actions event
  return dispatchCmsEvent("add-cert", {
    name: certData.name,
    issuer: certData.issuer,
    issueDate: certData.issueDate,
    credentialUrl: certData.credentialUrl || null,
    hasPdf: !!certData.pdfBase64,
    slug: certData.slug,
  });
}

/**
 * Update an existing certification
 */
export async function updateCertification(certId, certData) {
  return dispatchCmsEvent("update-cert", {
    id: certId,
    ...certData,
  });
}

/**
 * Delete a certification
 */
export async function deleteCertification(certId) {
  return dispatchCmsEvent("delete-cert", {
    id: certId,
  });
}

/**
 * Add a new project
 */
export async function addProject(projectData) {
  const imagePath = `public/assets/projects/${projectData.slug}.jpg`;

  console.log(`[addProject] Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, projectData.imageBase64);

  return dispatchCmsEvent("add-project", {
    name: projectData.name,
    description: projectData.description,
    githubLink: projectData.githubLink,
    demoLink: projectData.demoLink || null,
    slug: projectData.slug,
  });
}

/**
 * Upload a new resume (replaces the existing file)
 */
export async function uploadResume(resumeBase64) {
  const resumePath = "public/resume/Chirag_Dhunna.pdf";

  console.log(`[uploadResume] Uploading resume to ${resumePath}...`);
  await uploadFileToGitHub(resumePath, resumeBase64);

  return dispatchCmsEvent("upload-resume", {
    fileName: "Chirag_Dhunna.pdf",
  });
}
