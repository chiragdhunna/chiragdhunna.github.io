/**
 * GitHub API integration for CMS operations
 * Uses repository_dispatch to trigger workflows
 */

import { getStoredToken } from "./auth";

const GITHUB_API = "https://api.github.com/repos";
const OWNER = "chiragdhunna";
const REPO = "chiragdhunna.github.io";

/**
 * Upload a file to GitHub and return its content SHA
 * @param {string} path - File path in repo (e.g., "public/assets/certs/test.jpg")
 * @param {string} base64Content - Base64 encoded file content
 * @returns {Promise<string>} - File SHA
 */
async function uploadFileToGitHub(path, base64Content) {
  try {
    // First, try to get the existing file's SHA
    let sha = null;
    try {
      const getResponse = await fetch(
        `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (getResponse.ok) {
        const fileData = await getResponse.json();
        sha = fileData.sha;
      }
    } catch (e) {
      // File doesn't exist, that's OK
    }

    // Upload the file
    const putBody = {
      message: `chore: upload asset for CMS`,
      content: base64Content,
      branch: "cms-workflow",
    };

    // Include SHA if file exists (for update)
    if (sha) {
      putBody.sha = sha;
    }

    const response = await fetch(
      `${GITHUB_API}/${OWNER}/${REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
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
 * Dispatch a CMS event to GitHub Actions (small payload only)
 * @param {string} eventType - Event type
 * @param {object} payload - Event payload (must be <10KB)
 * @returns {Promise<boolean>} - Success status
 */
export async function dispatchCmsEvent(eventType, payload) {
  const token = getStoredToken();
  if (!token) {
    throw new Error("Not authenticated");
  }

  try {
    const response = await fetch(`${GITHUB_API}/${OWNER}/${REPO}/dispatches`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${import.meta.env.VITE_GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: {
          ...payload,
          adminToken: token,
        },
      }),
    });

    if (!response.ok) {
      let errorMessage = `GitHub API error: ${response.status} ${response.statusText}`;
      try {
        const errorData = await response.json();
        errorMessage += ` - ${errorData.message || JSON.stringify(errorData)}`;
      } catch (e) {
        // Error response is not JSON
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
 * @param {object} certData - Certification data
 * @returns {Promise<boolean>} - Success status
 */
export async function addCertification(certData) {
  // Upload image first
  const imagePath = `public/assets/certs/${certData.slug}.jpg`;
  console.log(`Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, certData.imageBase64.split(",")[1]);

  // Upload PDF if provided
  if (certData.pdfBase64) {
    const pdfPath = `public/assets/certs/${certData.slug}.pdf`;
    console.log(`Uploading PDF to ${pdfPath}...`);
    await uploadFileToGitHub(pdfPath, certData.pdfBase64.split(",")[1]);
  }

  // Dispatch event (without file content)
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
  // Upload image first
  const imagePath = `public/assets/projects/${projectData.slug}.jpg`;
  console.log(`Uploading image to ${imagePath}...`);
  await uploadFileToGitHub(imagePath, projectData.imageBase64.split(",")[1]);

  // Dispatch event (without file content)
  return dispatchCmsEvent("add-project", {
    name: projectData.name,
    description: projectData.description,
    githubLink: projectData.githubLink,
    demoLink: projectData.demoLink || null,
    slug: projectData.slug,
  });
}
