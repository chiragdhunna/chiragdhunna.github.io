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
 * Delete a file from GitHub by path.
 * Fetches the SHA first, then deletes the file.
 */
async function deleteFileFromGitHub(path) {
  const token = getStoredToken();

  if (!token) {
    throw new Error("Not authenticated");
  }

  if (isProduction()) {
    const getRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "get", path }),
    });

    if (!getRes.ok) {
      if (getRes.status === 404) {
        console.warn(
          `[deleteFileFromGitHub] File not found, skipping: ${path}`,
        );
        return;
      }

      const err = await getRes.json().catch(() => ({}));
      throw new Error(
        `Failed to get SHA for ${path}: ${err.error || getRes.statusText}`,
      );
    }

    const { sha } = await getRes.json();

    const deleteRes = await fetch(WORKER_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ action: "delete-file", path, sha }),
    });

    if (!deleteRes.ok) {
      const err = await deleteRes.json().catch(() => ({}));
      throw new Error(
        `Failed to delete ${path}: ${err.error || deleteRes.statusText}`,
      );
    }

    return;
  }

  const pat = import.meta.env.VITE_GITHUB_PAT;

  if (!pat) {
    throw new Error("GitHub PAT not available in development");
  }

  const getRes = await fetch(
    `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github.v3+json",
      },
    },
  );

  if (!getRes.ok) {
    if (getRes.status === 404) {
      console.warn(`[deleteFileFromGitHub] File not found, skipping: ${path}`);
      return;
    }

    throw new Error(`Failed to get SHA for ${path}: ${getRes.statusText}`);
  }

  const { sha } = await getRes.json();

  const deleteRes = await fetch(
    `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${pat}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        message: `chore: delete ${path}`,
        sha,
      }),
    },
  );

  if (!deleteRes.ok) {
    const err = await deleteRes.json().catch(() => ({}));
    throw new Error(
      `Failed to delete ${path}: ${err.message || deleteRes.statusText}`,
    );
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
 * Delete a certification by slug
 */
export async function deleteCertification(slug) {
  const certsPath = "public/data/certs.json";

  console.log(`[deleteCertification] Reading certs.json...`);
  const existing = await getFileFromGitHub(certsPath);

  if (!existing || !Array.isArray(existing.content)) {
    throw new Error("[deleteCertification] Could not read certs.json");
  }

  const filtered = existing.content.filter((c) => c.slug !== slug);

  if (filtered.length === existing.content.length) {
    throw new Error(`[deleteCertification] No cert found with slug: ${slug}`);
  }

  const cert = existing.content.find((c) => c.slug === slug);

  if (cert?.imageUrl?.startsWith("/assets/certs/")) {
    const imagePath = `public${cert.imageUrl}`;
    console.log(`[deleteCertification] Deleting image: ${imagePath}`);
    await deleteFileFromGitHub(imagePath).catch((err) =>
      console.warn(
        `[deleteCertification] Image delete failed (non-fatal): ${err.message}`,
      ),
    );
  }

  if (cert?.pdfUrl?.startsWith("/assets/certs/")) {
    const pdfPath = `public${cert.pdfUrl}`;
    console.log(`[deleteCertification] Deleting PDF: ${pdfPath}`);
    await deleteFileFromGitHub(pdfPath).catch((err) =>
      console.warn(
        `[deleteCertification] PDF delete failed (non-fatal): ${err.message}`,
      ),
    );
  }

  console.log(
    `[deleteCertification] Removing "${slug}", ${filtered.length} remaining...`,
  );

  const updatedContent = toBase64(JSON.stringify(filtered, null, 2));
  await uploadFileToGitHub(
    certsPath,
    `data:application/json;base64,${updatedContent}`,
  );

  return dispatchCmsEvent("delete-cert", { slug });
}

/**
 * Update an existing certification by slug
 */
export async function updateCertification(slug, updatedData) {
  const certsPath = "public/data/certs.json";

  console.log(`[updateCertification] Reading certs.json...`);
  const existing = await getFileFromGitHub(certsPath);

  if (!existing || !Array.isArray(existing.content)) {
    throw new Error("[updateCertification] Could not read certs.json");
  }

  const index = existing.content.findIndex((c) => c.slug === slug);

  if (index === -1) {
    throw new Error(`[updateCertification] No cert found with slug: ${slug}`);
  }

  // Upload new image if provided
  if (updatedData.imageBase64) {
    const imagePath = `public/assets/certs/${slug}.jpg`;
    console.log(`[updateCertification] Uploading new image...`);
    await uploadFileToGitHub(imagePath, updatedData.imageBase64);
    updatedData.imageUrl = `/assets/certs/${slug}.jpg`;
    delete updatedData.imageBase64;
  }

  // Upload new PDF if provided
  if (updatedData.pdfBase64) {
    const pdfPath = `public/assets/certs/${slug}.pdf`;
    console.log(`[updateCertification] Uploading new PDF...`);
    await uploadFileToGitHub(pdfPath, updatedData.pdfBase64);
    updatedData.pdfUrl = `/assets/certs/${slug}.pdf`;
    delete updatedData.pdfBase64;
  }

  existing.content[index] = {
    ...existing.content[index],
    ...updatedData,
    slug,
  };

  console.log(`[updateCertification] Saving updated certs.json...`);

  const updatedContent = toBase64(JSON.stringify(existing.content, null, 2));
  await uploadFileToGitHub(
    certsPath,
    `data:application/json;base64,${updatedContent}`,
  );

  return dispatchCmsEvent("update-cert", { slug, ...updatedData });
}

/**
 * Add a new project
 */
export async function addProject(projectData) {
  // 1. Upload image
  const imagePath = `public/assets/projects/${projectData.slug}.jpg`;
  console.log(`[addProject] Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, projectData.imageBase64);

  // 2. Read existing projects.json
  const projectsPath = "public/data/projects.json";
  console.log(`[addProject] Reading existing projects.json...`);
  const existing = await getFileFromGitHub(projectsPath);

  let projects = [];

  if (existing === null) {
    console.log(`[addProject] projects.json not found, starting fresh.`);
  } else if (Array.isArray(existing.content)) {
    projects = existing.content;
    console.log(`[addProject] Found ${projects.length} existing project(s).`);
  } else {
    throw new Error(
      `[addProject] projects.json has unexpected shape: ${JSON.stringify(existing.content).slice(0, 100)}`,
    );
  }

  // 3. Append new project
  projects.push({
    id: projectData.slug,
    slug: projectData.slug,
    name: projectData.name,
    description: projectData.description,
    categories: projectData.categories || ["Web"],
    imageUrl: `/assets/projects/${projectData.slug}.jpg`,
    ghLink: projectData.githubLink || null,
    demoLink: projectData.demoLink || null,
    createdAt: new Date().toISOString(),
  });

  // 4. Commit updated projects.json
  console.log(
    `[addProject] Uploading updated projects.json with ${projects.length} project(s)...`,
  );
  const updatedContent = toBase64(JSON.stringify(projects, null, 2));
  await uploadFileToGitHub(
    projectsPath,
    `data:application/json;base64,${updatedContent}`,
  );

  console.log(`[addProject] Done. Dispatching event...`);

  // 5. Dispatch event
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

/**
 * Delete a project by slug
 */
export async function deleteProject(slug) {
  const projectsPath = "public/data/projects.json";

  console.log(`[deleteProject] Reading projects.json...`);
  const existing = await getFileFromGitHub(projectsPath);

  if (!existing || !Array.isArray(existing.content)) {
    throw new Error("[deleteProject] Could not read projects.json");
  }

  const filtered = existing.content.filter((p) => p.slug !== slug);

  if (filtered.length === existing.content.length) {
    throw new Error(`[deleteProject] No project found with slug: ${slug}`);
  }

  const project = existing.content.find((p) => p.slug === slug);

  if (project?.imageUrl?.startsWith("/assets/projects/")) {
    const imagePath = `public${project.imageUrl}`;
    console.log(`[deleteProject] Deleting image: ${imagePath}`);
    await deleteFileFromGitHub(imagePath).catch((err) =>
      console.warn(
        `[deleteProject] Image delete failed (non-fatal): ${err.message}`,
      ),
    );
  }

  console.log(
    `[deleteProject] Removing "${slug}", ${filtered.length} remaining...`,
  );

  const updatedContent = toBase64(JSON.stringify(filtered, null, 2));
  await uploadFileToGitHub(
    projectsPath,
    `data:application/json;base64,${updatedContent}`,
  );

  console.log(`[deleteProject] Done. Dispatching event...`);

  return dispatchCmsEvent("delete-project", { slug });
}

/**
 * Update an existing project by slug
 */
export async function updateProject(slug, updatedData) {
  const projectsPath = "public/data/projects.json";

  console.log(`[updateProject] Reading projects.json...`);
  const existing = await getFileFromGitHub(projectsPath);

  if (!existing || !Array.isArray(existing.content)) {
    throw new Error("[updateProject] Could not read projects.json");
  }

  const index = existing.content.findIndex((p) => p.slug === slug);

  if (index === -1) {
    throw new Error(`[updateProject] No project found with slug: ${slug}`);
  }

  // If a new image was provided, upload it
  if (updatedData.imageBase64) {
    const imagePath = `public/assets/projects/${slug}.jpg`;
    console.log(`[updateProject] Uploading new image to ${imagePath}...`);
    await uploadFileToGitHub(imagePath, updatedData.imageBase64);
    // Update imageUrl to the new path
    updatedData.imageUrl = `/assets/projects/${slug}.jpg`;
    delete updatedData.imageBase64;
  }

  // Merge — preserve slug and createdAt, update everything else
  existing.content[index] = {
    ...existing.content[index],
    ...updatedData,
    slug, // never allow slug to change
  };

  console.log(`[updateProject] Saving updated projects.json...`);

  const updatedContent = toBase64(JSON.stringify(existing.content, null, 2));
  await uploadFileToGitHub(
    projectsPath,
    `data:application/json;base64,${updatedContent}`,
  );

  console.log(`[updateProject] Done. Dispatching event...`);

  return dispatchCmsEvent("update-project", { slug, ...updatedData });
}
