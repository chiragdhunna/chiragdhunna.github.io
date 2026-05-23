# GitHub Copilot Instructions

# Save this file at: .github/copilot-instructions.md

# VS Code Copilot reads this automatically for every suggestion in this repo.

## Who you are helping

This is Chirag Dhunna's personal portfolio — a React 18 + Vite + GitHub Pages site.
Live: https://chiragdhunna.github.io
Stack: React Router v6, Bootstrap 5, react-bootstrap, GitHub Actions, gh-pages branch.

Study the existing codebase before suggesting anything. Specifically:

-- How `src/components/Projects/Projects.jsx` and `ProjectCards.jsx` are structured
-- How `src/App.jsx` defines routes
-- How `src/components/Navbar.jsx` adds nav items
-- How `.github/workflows/deploy.yml` works

- The dark theme CSS variables in `src/style.css` and `src/App.css`

Every suggestion must be consistent with those patterns. Do not introduce new patterns
unless the existing codebase gives no precedent.

---

## Feature to build: Portfolio CMS

The owner needs to manage projects and certifications without touching code. The system
works entirely through GitHub — no external database, no backend server, no Vercel/Netlify
functions. The repo is the database.

### What to build

1. **Certifications tab** — a new `/certifications` route and nav item, structured
   identically to the existing Projects section. Data comes from `public/data/certs.json`.

2. **Admin UI** — a password-protected React admin panel at `/admin`. Lazy-loaded so it
   never ships in the public bundle. Has two tabs: Projects and Certifications.
   Each tab has a form to add new entries (name, description, image upload, URLs, etc).
   Certifications also accept a PDF upload.

3. **CMS Processing** — Uploads are handled by the Cloudflare Worker in production or by the GitHub API in development. The worker/API validates the admin JWT, writes assets and JSON to the repository, and ensures `deploy.yml` runs to rebuild the site. No manual steps after form submission.

---

## Architecture rules — never deviate from these

### The repo is the database

- Projects → `public/data/projects.json` (array of objects)
- Certifications → `public/data/certs.json` (array of objects)
- Project images → `public/assets/projects/<slug>.jpg`
- Cert images → `public/assets/certs/<slug>.jpg`
- Cert PDFs → `public/assets/certs/<slug>.pdf`
- Never suggest localStorage, Supabase, Firebase, or any external storage.

### Data shapes

```ts
interface ProjectEntry {
  id: string; // nanoid
  slug: string; // kebab-case from name
  name: string;
  description: string;
  imageUrl: string; // "/assets/projects/<slug>.jpg"
  projectUrl: string;
  demoUrl?: string;
  tags: string[];
  createdAt: string; // ISO 8601
}

interface CertEntry {
  id: string;
  slug: string;
  name: string;
  issuer: string;
  issueDate: string; // ISO 8601
  imageUrl: string; // "/assets/certs/<slug>.jpg"
  pdfUrl?: string; // "/assets/certs/<slug>.pdf"
  credentialUrl?: string;
  createdAt: string;
}
```

### Auth — simple, zero dependencies

- One secret: `ADMIN_PASSWORD` stored in GitHub Secrets, exposed to the Admin UI
  build only via `VITE_ADMIN_PASSWORD` (Vite env var).
- On login, issue a 4-hour JWT signed with `ADMIN_PASSWORD` using the browser's native
  Web Crypto API (HMAC-SHA256). Store in `sessionStorage` only — never localStorage.
- Every GitHub API call from the Admin UI sends the JWT in an `X-Admin-Token` header.
- The GitHub Actions workflow validates the JWT using Python's `hmac` + `hashlib`
  before touching any files. If validation fails, the job exits immediately.
- A fine-grained GitHub PAT (scoped to this repo, Contents + Actions write) is stored
  as `VITE_GITHUB_PAT` in `.env.local` and as a GitHub Secret for the workflow.

### Admin UI — lazy loaded, never public

```jsx
// In App.jsx
const AdminApp = React.lazy(() => import("./components/Admin/AdminApp"));
<Route
  path="/admin/*"
  element={
    <Suspense fallback={<Pre />}>
      <AdminApp />
    </Suspense>
  }
/>;
```

All admin components live in `src/components/Admin/`. They are never imported by any
non-admin component. The public bundle has zero admin code.

### CMS Processing (Worker / API)

- Admin form submission → `dispatchCmsEvent()` → Cloudflare Worker (production) or GitHub API (development)
- Event types: `add-project`, `update-project`, `delete-project`,
  `add-cert`, `update-cert`, `delete-cert`
- Processing: Worker/API validates JWT, decodes files, updates JSON, and pushes changes; `deploy.yml` handles deployment.
- Never string-concat JSON in shell. Use `jq` or Python for any server-side JSON manipulation.
- Sanitize all payload fields before using them in file paths (no path traversal).

### Image handling in the browser

- Convert uploaded images to base64 client-side using canvas before sending.
- Resize to max 1200px width on the client before encoding.
- PDFs are read as base64 via FileReader.

---

## File layout to produce

```
src/components/
  Certifications/
    Certifications.jsx     ← mirrors Projects.jsx exactly in structure
    CertCard.jsx           ← mirrors ProjectCards.jsx
  Admin/
    AdminApp.jsx           ← checks session, routes to Login or Dashboard
    AdminLogin.jsx         ← fullscreen centered, no navbar, no particles
    AdminDashboard.jsx     ← two tabs: Projects | Certifications
    ProjectForm.jsx        ← add project form
    CertForm.jsx           ← add cert form (+ PDF upload)
    auth.ts                ← issueToken(), verifyToken(), getStoredToken()
    githubApi.ts           ← dispatchCmsEvent(), addProject(), addCert(), etc.

public/data/
  projects.json            ← start as []
  certs.json               ← start as []

.github/workflows/
  deploy.yml               ← Deploy workflow

.env.local (never commit)
  VITE_ADMIN_PASSWORD=
  VITE_GITHUB_PAT=

GitHub Secrets
  ADMIN_SECRET             ← same value as VITE_ADMIN_PASSWORD
```

---

## UI/UX rules

- Certifications page must be visually identical to the Projects page — same dark card
  style, same particle background, same Bootstrap grid layout.
- CertCard shows: badge/image on top, name, issuer + year, "Verify Credential" button
  (if credentialUrl set), "View Certificate" button (if pdfUrl set).
- Admin UI uses a dark theme matching the portfolio (`#0d1117` background, `#161b22`
  cards, `#c9d1d9` text — GitHub dark palette).
- Admin login is fullscreen, centered, no Navbar, no Particle component.
- After form submission, show an optimistic success message:
  "Submitted! The live site will update in ~60 seconds."
- Navbar gets a fifth item: Certifications, placed between Projects and Resume.
  Use `AiOutlineSafetyCertificate` from `react-icons/ai`.

---

## What Copilot must never suggest

- External databases (Supabase, Firebase, MongoDB, etc.)
- A separate backend server or Express/Fastify API
- Netlify or Vercel serverless functions
- localStorage for auth tokens
- New npm packages for JWT (use Web Crypto API)
  -- Modifying `deploy.yml`
- Hardcoding secrets or PATs in source files
- `document.cookie` for session management

---

## Copilot behaviour guidelines

1. **Read the existing code first.** Before writing any component, check how the
   nearest equivalent is built in the codebase and match it exactly.

2. **Security before convenience.** JWT validation happens in the workflow BEFORE any
   file write. If the token is missing or invalid, the job fails immediately.

3. **JSON integrity.** Always read → parse → modify in memory → JSON.stringify with
   2-space indent → write back. Never patch files with sed or string replacement.

4. **One source of truth.** The JSON files in `public/data/` are the only source of
   truth for both the portfolio UI and the Admin UI. The Admin UI reads from the same
   files the public site renders.

5. **Keep the public build lean.** The Admin bundle is code-split via React.lazy.
   Never import admin modules from non-admin components.

6. **Match existing style tokens.** Use the same CSS variables and class names already
   present in `src/style.css`. Do not introduce new design systems or utility libraries.
