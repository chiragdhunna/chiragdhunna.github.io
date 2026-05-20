/**
 * Cloudflare Worker for Portfolio CMS
 * Handles GitHub API calls with JWT validation
 */

interface Env {
  ADMIN_SECRET: string;
  GITHUB_PAT: string;
  GITHUB_OWNER: string;
  GITHUB_REPO: string;
}

const GITHUB_API = "https://api.github.com/repos";

/**
 * Validate JWT token
 */
async function validateJWT(token: string, secret: string): Promise<boolean> {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return false;

    const [headerB64, payloadB64, signatureB64] = parts;

    // Decode payload
    const payloadJson = JSON.parse(
      new TextDecoder().decode(
        Uint8Array.from(
          atob(payloadB64.replace(/-/g, "+").replace(/_/g, "/")),
          (c) => c.charCodeAt(0),
        ),
      ),
    );

    // Check expiration
    if (payloadJson.exp && payloadJson.exp < Date.now() / 1000) {
      return false;
    }

    // Verify signature using Web Crypto API
    const encoder = new TextEncoder();
    const secretKey = await crypto.subtle.importKey(
      "raw",
      encoder.encode(secret),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const messageBuffer = encoder.encode(`${headerB64}.${payloadB64}`);
    const signatureBuffer = Uint8Array.from(
      atob(signatureB64.replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const isValid = await crypto.subtle.verify(
      "HMAC",
      secretKey,
      signatureBuffer,
      messageBuffer,
    );

    return isValid;
  } catch (e) {
    console.error("JWT validation error:", e);
    return false;
  }
}

/**
 * Upload file to GitHub
 */
async function uploadToGithub(
  path: string,
  base64Content: string,
  env: Env,
): Promise<{ sha: string }> {
  try {
    // Get existing file SHA
    let sha = null;
    try {
      const getRes = await fetch(
        `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
        {
          headers: {
            Authorization: `Bearer ${env.GITHUB_PAT}`,
            Accept: "application/vnd.github.v3+json",
          },
        },
      );

      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }
    } catch (e) {
      // File doesn't exist yet
    }

    // Upload file
    const uploadRes = await fetch(
      `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/contents/${path}`,
      {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${env.GITHUB_PAT}`,
          Accept: "application/vnd.github.v3+json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: `chore: upload asset for CMS`,
          content: base64Content,
          ...(sha && { sha }),
        }),
      },
    );

    if (!uploadRes.ok) {
      const error = await uploadRes.json();
      throw new Error(`GitHub API error: ${error.message}`);
    }

    const result = await uploadRes.json();
    return { sha: result.content.sha };
  } catch (error) {
    console.error("GitHub upload error:", error);
    throw error;
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
  const dispatchRes = await fetch(
    `${GITHUB_API}/${env.GITHUB_OWNER}/${env.GITHUB_REPO}/dispatches`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${env.GITHUB_PAT}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        event_type: eventType,
        client_payload: payload,
      }),
    },
  );

  if (!dispatchRes.ok) {
    const error = await dispatchRes.json();
    throw new Error(`Dispatch error: ${error.message}`);
  }
}

/**
 * Handle incoming requests
 */
export default {
  async fetch(request: Request, env: any): Promise<Response> {
    const corsHeaders = {
      "Access-Control-Allow-Origin": "https://chiragdhunna.github.io",
      "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
    };

    // HANDLE PREFLIGHT
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: corsHeaders,
      });
    }

    try {
      // EXAMPLE BODY PARSING
      const body = await request.json();

      // YOUR EXISTING LOGIC HERE
      // GitHub API calls etc.

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
    } catch (err: any) {
      return new Response(
        JSON.stringify({
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
