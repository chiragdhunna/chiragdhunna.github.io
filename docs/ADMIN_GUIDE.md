# Admin CMS Guide

This guide describes how to manage portfolio content using the built-in Content Management System (CMS) at `/admin`.

---

## Table of Contents
1. [Access & Authentication](#access--authentication)
2. [Managing Projects](#managing-projects)
3. [Managing Certifications](#managing-certifications)
4. [Managing Resume](#managing-resume)
5. [Local Development Setup](#local-development-setup)
6. [Production Deployment of the Worker](#production-deployment-of-the-worker)

---

## Access & Authentication

- **URL Route**: Navigate to `/admin` (e.g. `https://chiragdhunna.github.io/admin` or `https://localhost:3000/admin` in dev).
- **Authentication**: Enter your admin password.
- **Session Duration**: The system issues an HMAC-SHA256 JWT signed via the browser's Web Crypto API. The token expires automatically after **4 hours** and is stored securely in `sessionStorage`.
- **Logout**: Click the **Logout** button in the dashboard header at any time to clear the session token.

---

## Managing Projects

The **Projects** tab allows managing all items showcased in the "Selected work" section of the portfolio homepage.

### Adding a Project
1. Click **+ Add Project**.
2. **Project Name**: Enter the title of your project. The slug is generated automatically in lowercase kebab-case (e.g., `Chat Go` -> `chat-go`).
3. **Slug**: Edit if you want a custom URL identifier.
4. **Description**: Concise summary of what the project does, technologies used, and architecture highlights.
5. **Categories**:
   - Click existing preset category pills (`Web`, `Mobile`, `Full Stack`, `Backend`, `Cloud`, `AI`) to toggle.
   - Or type a custom category in the **+ Add Custom Category** input and press Enter. Custom categories automatically populate public dynamic filters.
6. **Project Image**:
   - Click to browse or drag-and-drop an image file (`.png`, `.jpg`, `.jpeg`, `.webp`).
   - Images larger than 1200px are automatically downscaled client-side via HTML5 canvas to 1200px (85% JPEG) to keep repository sizes small.
   - Max file size limit: **5 MB**.
7. **Links**:
   - **GitHub URL**: Link to the public or source repository (e.g. `https://github.com/chiragdhunna/chat_go`).
   - **Demo / Release URL**: Optional live link or package link (e.g. `https://chat-go-taupe.vercel.app/`).
8. Click **Save Project**.

### Editing & Deleting Projects
- In the project list, click **Edit** to modify any fields or replace/clear the image.
- Click **Delete** to trigger a confirmation dialog. Deleting removes the entry from `public/data/projects.json` and commits the deletion to the repository.

---

## Managing Certifications

The **Certifications** tab powers the "Credentials" section of the portfolio homepage.

### Adding a Certification
1. Click **+ Add Certification**.
2. **Certification Name**: Full official credential title (e.g. `AWS Certified AI Practitioner`).
3. **Slug**: Auto-generated kebab-case string.
4. **Smart Issuer Picker**:
   - Select from 18 built-in industry defaults: `AWS`, `Microsoft`, `Google Cloud`, `Oracle`, `IBM`, `Cisco`, `CompTIA`, `Red Hat`, `Linux Foundation`, `HashiCorp`, `Databricks`, `Snowflake`, `NVIDIA`, `Salesforce`, `Meta`, `Coursera`, `Udemy`, `freeCodeCamp`.
   - The picker automatically resolves common aliases. For example, typing `Azure` or `Microsoft Azure` canonicalizes to `Microsoft`; typing `GCP` canonicalizes to `Google Cloud`.
   - If an issuer isn't listed, simply type a new name; it is saved as a custom issuer and dynamically integrated into public filters.
5. **Issue Date**: Optional credential date (`YYYY-MM-DD`).
6. **Categories**: Multi-select pills (e.g. `Cloud`, `AI`, `DevOps`, `Security`).
7. **Certificate Image**:
   - Upload the certificate preview image (auto-resized client-side).
8. **Certificate PDF**:
   - Optional PDF document upload.
   - Supports drag-and-drop with page-level drop protection.
   - Size limit: **10 MB**.
9. **Verification URL**: Optional direct link to external verification badge (Credly, Microsoft Learn, etc.).
10. Click **Save Certification**.

---

## Managing Resume

The **Resume** tab provides one-click replacement of the portfolio CV:

1. Switch to the **Resume** tab in `/admin`.
2. View the currently active resume (`Chirag_Dhunna.pdf`) with an embedded PDF preview.
3. Drag-and-drop a new PDF file onto the designated drop zone or click **Browse Files**.
4. The file is validated (`application/pdf`, max 10 MB) and uploaded directly to `public/resume/Chirag_Dhunna.pdf`.
5. The change triggers GitHub Actions deployment, updating both the inline PDF viewer and the direct download button on the homepage.

---

## Local Development Setup

To test the CMS locally:

1. Create a `.env.local` file in the repository root:
   ```bash
   VITE_ADMIN_PASSWORD=your_secure_password
   VITE_GITHUB_PAT=ghp_yourPersonalAccessToken
   ```

2. Generating a GitHub Personal Access Token (PAT):
   - Navigate to [GitHub Settings → Developer Settings → Personal Access Tokens → Fine-grained tokens](https://github.com/settings/tokens?type=beta) (or classic tokens).
   - Repository access: Select `chiragdhunna/chiragdhunna.github.io`.
   - Required permissions:
     - `Contents`: Read and write (to commit JSON and assets)
     - `Actions`: Read and write (to dispatch workflows)

3. Start the dev server:
   ```bash
   npm run dev
   ```
4. Open `https://localhost:3000/admin`. Note: Vite uses a self-signed certificate via `@vitejs/plugin-basic-ssl` to ensure Web Crypto API (`crypto.subtle`) is available in a secure HTTPS context. Accept the self-signed certificate in your browser.

---

## Production Deployment of the Worker

The Cloudflare Edge Worker proxies CMS requests in production so your GitHub PAT is never exposed to visitors:

1. Install Wrangler and authenticate:
   ```bash
   npx wrangler login
   ```
2. Configure secrets in Cloudflare:
   ```bash
   npx wrangler secret put ADMIN_SECRET
   # Enter your admin password

   npx wrangler secret put GITHUB_PAT
   # Enter your GitHub Personal Access Token
   ```
3. Deploy the Worker:
   ```bash
   npm run deploy-worker
   # Or: npx wrangler deploy workers/index.ts
   ```
4. Verify the worker URL matches `WORKER_URL` in [`src/components/Admin/githubApi.js`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/components/Admin/githubApi.js).
