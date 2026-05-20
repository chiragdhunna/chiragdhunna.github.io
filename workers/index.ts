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

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://chiragdhunna.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

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
