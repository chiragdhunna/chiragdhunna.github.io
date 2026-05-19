/**
 * GitHub API integration for CMS operations
 * Uses repository_dispatch to trigger workflows
 */

import { getStoredToken } from "./auth";

const GITHUB_API = "https://api.github.com/repos";
const OWNER = "chiragdhunna";
const REPO = "chiragdhunna.github.io";

/**
 * Dispatch a CMS event to GitHub Actions
 * @param {string} eventType - Event type (add-cert, update-cert, delete-cert, etc.)
 * @param {object} payload - Event payload
 * @returns {Promise<boolean>} - Success status
 */
export async function dispatchCmsEvent(eventType, payload) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(
      `${GITHUB_API}/${OWNER}/${REPO}/dispatches`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
          "X-Admin-Token": token,
        },
        body: JSON.stringify({
          event_type: eventType,
          client_payload: payload,
        }),
      }
    );

    if (!response.ok) {
      throw new Error(
        `GitHub API error: ${response.status} ${response.statusText}`
      );
    }

    return true;
  } catch (error) {
    console.error("Failed to dispatch CMS event:", error);
    throw error;
  }
}

/**
 * Add a new certification
 * @param {object} certData - Certification data
 * @returns {Promise<boolean>} - Success status
 */
export async function addCertification(certData) {
  return dispatchCmsEvent("add-cert", {
    name: certData.name,
    issuer: certData.issuer,
    issueDate: certData.issueDate,
    imageBase64: certData.imageBase64,
    pdfBase64: certData.pdfBase64,
    credentialUrl: certData.credentialUrl || null,
  });
}

/**
 * Update an existing certification
 * @param {string} certId - Certification ID
 * @param {object} certData - Updated certification data
 * @returns {Promise<boolean>} - Success status
 */
export async function updateCertification(certId, certData) {
  return dispatchCmsEvent("update-cert", {
    id: certId,
    ...certData,
  });
}

/**
 * Delete a certification
 * @param {string} certId - Certification ID
 * @returns {Promise<boolean>} - Success status
 */
export async function deleteCertification(certId) {
  return dispatchCmsEvent("delete-cert", {
    id: certId,
  });
}

/**
 * Add a new project
 * @param {object} projectData - Project data
 * @returns {Promise<boolean>} - Success status
 */
export async function addProject(projectData) {
  return dispatchCmsEvent("add-project", {
    name: projectData.name,
    description: projectData.description,
    imageBase64: projectData.imageBase64,
    projectUrl: projectData.projectUrl,
    demoUrl: projectData.demoUrl || null,
    tags: projectData.tags || [],
  });
}
