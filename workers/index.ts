/**
 * Cloudflare Worker for Portfolio CMS
 */

interface Env {
  ADMIN_SECRET: string;
  GITHUB_PAT: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
}

const GITHUB_API = "https://api.github.com/repos";

/**
 * Fetch a file from GitHub contents API.
 */
async function getFromGithub(
  path: string,
  env: Env,
): Promise<{ content: string; sha: string } | null> {
  const response = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "portfolio-cms-worker",
      },
    },
  );

  if (response.status === 404) {
    return null;
  }

  const responseText = await response.text();

  if (!response.ok) {
    throw new Error(`GitHub fetch failed: ${responseText}`);
  }

  const data = JSON.parse(responseText);

  if (!data.content || !data.sha) {
    throw new Error("GitHub fetch response missing content or sha");
  }

  return {
    content: data.content,
    sha: data.sha,
  };
}

/**
 * Upload file to GitHub
 */
async function uploadToGithub(
  path: string,
  base64Content: string,
  env: Env,
): Promise<{ sha: string }> {
  console.log("Uploading file:", path);

  // Check if file already exists
  let sha: string | null = null;

  const existingFileRes = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "User-Agent": "portfolio-cms-worker",
      },
    },
  );

  console.log("Existing file check status:", existingFileRes.status);

  if (existingFileRes.ok) {
    const existingFile = await existingFileRes.json();
    sha = existingFile.sha;
    console.log("Existing SHA:", sha);
  }

  // Upload / overwrite file
  const payload = {
    message: `chore: upload ${path}`,
    content: base64Content,
    branch: "master",
    ...(sha ? { sha } : {}),
  };

  console.log("Uploading to GitHub...");

  const uploadRes = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "portfolio-cms-worker",
      },
      body: JSON.stringify(payload),
    },
  );

  const uploadText = await uploadRes.text();

  console.log("GitHub upload status:", uploadRes.status);
  console.log("GitHub upload response:", uploadText);

  if (!uploadRes.ok) {
    throw new Error(`GitHub upload failed: ${uploadText}`);
  }

  const uploadData = JSON.parse(uploadText);

  return {
    sha: uploadData.content.sha,
  };
}

/**
 * Delete a file from GitHub contents API.
 */
async function deleteFromGithub(
  path: string,
  sha: string,
  env: Env,
): Promise<void> {
  console.log("Deleting file:", path, "sha:", sha);

  const deleteRes = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "portfolio-cms-worker",
      },
      body: JSON.stringify({
        message: `chore: delete ${path}`,
        sha,
        branch: "master",
      }),
    },
  );

  const deleteText = await deleteRes.text();

  console.log("Delete status:", deleteRes.status);

  if (!deleteRes.ok) {
    throw new Error(`GitHub delete failed: ${deleteText}`);
  }
}

/**
 * Dispatch repository event
 */
async function dispatchEvent(
  eventType: string,
  payload: Record<string, unknown>,
  env: Env,
): Promise<void> {
  console.log("Dispatching GitHub event:", eventType);

  const dispatchRes = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        "User-Agent": "portfolio-cms-worker",
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: payload,
      }),
    },
  );

  const dispatchText = await dispatchRes.text();

  console.log("Dispatch status:", dispatchRes.status);
  console.log("Dispatch response:", dispatchText);

  if (!dispatchRes.ok) {
    throw new Error(`Dispatch failed: ${dispatchText}`);
  }
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://chiragdhunna.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // =========================
    // PREFLIGHT
    // =========================
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    // =========================
    // HEALTH CHECK
    // =========================
    if (request.method === "GET") {
      return new Response(
        JSON.stringify({
          success: true,
          message: "Worker running",
        }),
        {
          status: 200,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }

    try {
      const body = await request.json();

      console.log("Incoming request body keys:", Object.keys(body));

      // =========================
      // HANDLE FILE FETCH
      // =========================
      if (body.action === "get") {
        const {
          path,
        }: {
          path: string;
        } = body;

        if (!path) {
          throw new Error("Missing path");
        }

        const result = await getFromGithub(path, env);

        if (!result) {
          return new Response(
            JSON.stringify({
              success: false,
              error: "Not found",
            }),
            {
              status: 404,
              headers: {
                ...corsHeaders,
                "Content-Type": "application/json",
              },
            },
          );
        }

        return new Response(
          JSON.stringify({
            success: true,
            content: result.content,
            sha: result.sha,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // =========================
      // HANDLE FILE UPLOAD
      // =========================
      if (body.action === "upload") {
        const {
          path,
          content,
        }: {
          path: string;
          content: string;
        } = body;

        if (!path || !content) {
          throw new Error("Missing path or content");
        }

        const result = await uploadToGithub(path, content, env);

        console.log("Upload successful");

        return new Response(
          JSON.stringify({
            success: true,
            sha: result.sha,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // =========================
      // HANDLE DISPATCH EVENT
      // =========================
      if (body.action === "dispatch") {
        const {
          eventType,
          payload,
        }: {
          eventType: string;
          payload: Record<string, unknown>;
        } = body;

        if (!eventType) {
          throw new Error("Missing eventType");
        }

        await dispatchEvent(eventType, payload || {}, env);

        console.log("Dispatch successful");

        return new Response(
          JSON.stringify({
            success: true,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      // =========================
      // HANDLE FILE DELETE
      // =========================
      if (body.action === "delete-file") {
        const {
          path,
          sha,
        }: {
          path: string;
          sha: string;
        } = body;

        if (!path || !sha) {
          throw new Error("Missing path or sha");
        }

        await deleteFromGithub(path, sha, env);

        return new Response(
          JSON.stringify({
            success: true,
          }),
          {
            status: 200,
            headers: {
              ...corsHeaders,
              "Content-Type": "application/json",
            },
          },
        );
      }

      throw new Error("Invalid action");
    } catch (err: any) {
      console.error("Worker error:", err);

      return new Response(
        JSON.stringify({
          success: false,
          error: err.message,
        }),
        {
          status: 500,
          headers: {
            ...corsHeaders,
            "Content-Type": "application/json",
          },
        },
      );
    }
  },
};
