# Troubleshooting Guide

This guide covers common issues, root causes, and verified solutions across local development, the admin CMS, Cloudflare Workers, and GitHub Actions deployments.

---

## 1. Local Development & Setup

### "Your connection is not private" / SSL Warning in Browser
- **Cause**: In development, `vite.config.js` uses `@vitejs/plugin-basic-ssl` to serve over HTTPS on `https://localhost:3000`. This enables the browser's native Web Crypto API (`crypto.subtle`) required for HMAC-SHA256 JWT operations.
- **Solution**: In Chrome/Edge/Firefox, click **Advanced** → **Proceed to localhost (unsafe)**. This is normal and safe for local development.

### Port 3000 Already in Use
- **Cause**: Another local process is occupying port 3000.
- **Solution**:
  ```bash
  # Identify the process listening on port 3000
  lsof -i :3000
  # Or start Vite on an alternate port
  npx vite --port 3001
  ```

### `crypto.subtle` is Unavailable / Insecure Context Warning
- **Cause**: Accessing the app over plain `http://` instead of `https://` causes modern browsers to disable `window.crypto.subtle`.
- **Solution**: Always navigate using `https://localhost:3000`. In development mode (`import.meta.env.DEV`), `auth.js` automatically falls back to an unsigned development token to prevent lockouts, but production strictly requires HTTPS.

---

## 2. Admin CMS & Authentication

### "Admin password not configured" / 401 Unauthorized
- **Cause**: Missing `VITE_ADMIN_PASSWORD` in your local `.env.local` or missing `ADMIN_SECRET` in GitHub Secrets / Cloudflare Worker secrets.
- **Solution**:
  - Local dev: Ensure `.env.local` exists in the repo root with:
    ```bash
    VITE_ADMIN_PASSWORD=your_secure_password
    ```
  - Production: In GitHub Repository Settings → Secrets and variables → Actions, set `ADMIN_SECRET`. For the Cloudflare Worker, run:
    ```bash
    npx wrangler secret put ADMIN_SECRET
    ```

### "Token expired" / Automatic Logout
- **Cause**: Admin JWT tokens are intentionally configured with a 4-hour lifespan (`exp = now + 4 * 3600`) in `sessionStorage` for security.
- **Solution**: Re-enter your admin password at `/admin` to generate a fresh token.

---

## 3. Cloudflare Worker & GitHub API Operations

### GitHub API Error: `401 Bad credentials`
- **Cause**: The GitHub Personal Access Token (PAT) is invalid, expired, or revoked.
- **Solution**:
  1. Generate a new PAT at [GitHub Personal Access Tokens](https://github.com/settings/tokens).
  2. Verify required scopes:
     - `Contents`: Read and write
     - `Actions`: Read and write
  3. Update `.env.local` locally (`VITE_GITHUB_PAT=ghp_...`).
  4. Update Cloudflare Worker secret:
     ```bash
     npx wrangler secret put GITHUB_PAT
     ```

### GitHub API Error: `409 Conflict`
- **Cause**: A concurrent write modified `public/data/certs.json` or `public/data/projects.json`, causing the file's Git SHA to change.
- **Solution**: Refresh the `/admin` browser tab. The CMS will re-fetch the latest content and SHA before performing the write.

### GitHub API Error: `404 Not Found`
- **Cause**: Either `WORKER_URL` in [`src/components/Admin/githubApi.js`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/components/Admin/githubApi.js) points to an incorrect Worker route, or `GITHUB_OWNER` / `GITHUB_REPO` in `wrangler.toml` does not match your GitHub repository.
- **Solution**: Verify `wrangler.toml`:
  ```toml
  [vars]
  GITHUB_OWNER = "chiragdhunna"
  GITHUB_REPO = "chiragdhunna.github.io"
  ```

### CORS Blocked on Worker Requests
- **Cause**: The Cloudflare Worker enforces strict CORS:
  ```typescript
  "Access-Control-Allow-Origin": "https://chiragdhunna.github.io"
  ```
- **Solution**: In local development, the CMS automatically bypasses the Worker and calls GitHub API directly using `VITE_GITHUB_PAT`. In production, requests must originate from `https://chiragdhunna.github.io`.

---

## 4. File Uploads & Asset Validation

### "File size exceeds 5MB limit" / "Invalid file type"
- **Cause**: Image uploads must be `< 5 MB` and have an `image/*` MIME type. PDF uploads must be `< 10 MB` and have an `application/pdf` MIME type.
- **Solution**: Compress the image or PDF before uploading. Images are automatically resized client-side to 1200px max, but the initial file size must still adhere to the 5 MB validation gate.

### Dropped File Opens in Browser Tab
- **Cause**: Dragging and dropping outside the designated upload zone.
- **Solution**: The CMS includes page-level drag-and-drop protection in `DropZone.jsx` and `AdminDashboard.jsx`. Ensure you drop files inside the dotted drop container.

---

## 5. CI/CD & GitHub Actions

### Changes Saved in Admin But Not Visible on Live Site
- **Cause 1 - CI/CD in Progress**: GitHub Actions takes approximately 60 seconds to execute tests, build the Vite app, and deploy to `gh-pages`. Check the **Actions** tab on your GitHub repository.
- **Cause 2 - Browser CDN Cache**: GitHub Pages caches static JSON responses for several minutes. Hard-refresh the page (`Ctrl + Shift + R` or `Cmd + Shift + R`).
- **Cause 3 - `[skip ci]` in Commit**: If a commit message contains `[skip ci]`, GitHub Actions will not run the deployment workflow.

### Deploy Workflow Fails on Build
- **Cause**: A compilation or test failure in `npm test` or `npm run build`.
- **Solution**: Run tests and build locally to diagnose:
  ```bash
  npm test
  npm run build
  ```
