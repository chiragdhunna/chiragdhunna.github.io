/**
 * GitHub API integration for CMS operations
 * Uses Cloudflare Worker proxy in production, direct API in development
 */

import { getStoredToken } from "./auth";

const GITHUB_API = "https://api.github.com/repos";
const OWNER = "chiragdhunna";
const REPO = "chiragdhunna.github.io";
const WORKER_URL = "https://portfolio-cms-worker.chigsdroid.workers.dev";

/**
 * Determine if running in production or development
 */
function isProduction() {
  return import.meta.env.PROD;
}

/**
 * Fetch a file's content and SHA from GitHub
 * In prod: Uses Cloudflare Worker (requires "get" action support in worker)
 * In dev: Uses direct GitHub API
 *
 * @param {string} path - Repo-relative path to the file
 * @returns {{ content: any, sha: string } | null} Parsed JSON content + SHA, or null if not found
 */
async function getFileFromGitHub(path) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  if (isProduction()) {
    // Production: Use Cloudflare Worker
    // Your worker must handle action: "get" and return { content: <base64>, sha: <string> }
    const response = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", path }),
    });

    if (!response.ok) {
      if (response.status === 404) return null;
      const error = await response.json();
      throw new Error(`Fetch failed: ${error.error}`);
    }

    const data = await response.json();
    return {
      content: JSON.parse(atob(data.content)),
      sha: data.sha,
    };
  }

  // Development: Use direct GitHub API
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
    if (response.status === 404) return null;
    throw new Error(`Failed to fetch ${path}: ${response.statusText}`);
  }

  const data = await response.json();
  return {
    content: JSON.parse(atob(data.content)),
    sha: data.sha,
  };
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
        // Error response is not JSON
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
 * Add a new certification
 * Uploads image (and optional PDF), appends to certs.json, then dispatches event.
 *
 * @param {object} certData
 * @param {string} certData.slug
 * @param {string} certData.name
 * @param {string} certData.issuer
 * @param {string} certData.issueDate
 * @param {string} certData.imageBase64
 * @param {string} [certData.pdfBase64]
 * @param {string} [certData.credentialUrl]
 */
export async function addCertification(certData) {
  // Upload image
  const imagePath = `public/assets/certs/${certData.slug}.jpg`;

  console.log(`Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, certData.imageBase64);

  // Upload PDF if provided
  if (certData.pdfBase64) {
    const pdfPath = `public/assets/certs/${certData.slug}.pdf`;

    console.log(`Uploading PDF to ${pdfPath}...`);
    await uploadFileToGitHub(pdfPath, certData.pdfBase64);
  }

  // Fetch existing certs.json using the auth-aware helper so it works in
  // both dev and production (fixes the bug where VITE_GITHUB_PAT was used
  // directly here, causing an empty fetch in prod and wiping the list).
  const certsPath = "public/data/certs.json";
  let certs = [];

  try {
    const existing = await getFileFromGitHub(certsPath);

    if (existing && Array.isArray(existing.content)) {
      certs = existing.content;
    }
  } catch (error) {
    console.warn("Failed to fetch existing certs.json, starting fresh:", error);
  }

  // Append the new certificate — never replaces the full list
  certs.push({
    id: certData.slug,
    slug: certData.slug,
    name: certData.name,
    issuer: certData.issuer,
    issueDate: certData.issueDate,
    imageUrl: `/assets/certs/${certData.slug}.jpg`,
    pdfUrl: certData.pdfBase64 ? `/assets/certs/${certData.slug}.pdf` : null,
    credentialUrl: certData.credentialUrl || null,
    createdAt: new Date().toISOString(),
  });

  // Upload the updated list back to GitHub
  console.log("Updating certs.json...");
  const updatedCertsContent = btoa(JSON.stringify(certs, null, 2));
  await uploadFileToGitHub(
    certsPath,
    `data:application/json;base64,${updatedCertsContent}`,
  );

  // Dispatch GitHub Actions event
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
 *
 * @param {string} certId
 * @param {object} certData - Fields to update
 */
export async function updateCertification(certId, certData) {
  return dispatchCmsEvent("update-cert", {
    id: certId,
    ...certData,
  });
}

/**
 * Delete a certification
 *
 * @param {string} certId
 */
export async function deleteCertification(certId) {
  return dispatchCmsEvent("delete-cert", {
    id: certId,
  });
}

/**
 * Add a new project
 * Uploads image then dispatches event.
 *
 * @param {object} projectData
 * @param {string} projectData.slug
 * @param {string} projectData.name
 * @param {string} projectData.description
 * @param {string} projectData.githubLink
 * @param {string} [projectData.demoLink]
 * @param {string} projectData.imageBase64
 */
export async function addProject(projectData) {
  // Upload image
  const imagePath = `public/assets/projects/${projectData.slug}.jpg`;

  console.log(`Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, projectData.imageBase64);

  // Dispatch event
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
 *
 * @param {string} resumeBase64 - Base64-encoded PDF (with or without data URL prefix)
 */
export async function uploadResume(resumeBase64) {
  const resumePath = "public/resume/Chirag_Dhunna.pdf";

  console.log(`Uploading resume to ${resumePath}...`);
  await uploadFileToGitHub(resumePath, resumeBase64);

  // Dispatch event
  return dispatchCmsEvent("upload-resume", {
    fileName: "Chirag_Dhunna.pdf",
  });
}
