# Portfolio CMS Setup Guide

## Overview

This is a GitHub-based CMS for managing certifications and projects without touching code. Everything uses GitHub Actions and the repository as a database.

## Architecture

- **Admin UI**: React component at `/admin` (lazy-loaded, never in public bundle)
- **Authentication**: JWT tokens with Web Crypto API (4-hour sessions in sessionStorage)
- **Database**: JSON files in `public/data/`
  - `certs.json` - Certifications
  - `projects.json` - Projects
- **Assets**:
  - `public/assets/certs/<slug>.jpg` - Certification images
  - `public/assets/certs/<slug>.pdf` - Certificate PDFs
  - `public/assets/projects/<slug>.jpg` - Project images
- **Workflow**: GitHub Actions (`cms-update.yml`) processes dispatch events

## Setup Instructions

### 1. Set Environment Variables

Create a `.env.local` file (never commit this):

```
VITE_ADMIN_PASSWORD=your_secure_password_here
VITE_GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

#### Creating the GitHub PAT:

1. Go to [GitHub Settings → Personal Access Tokens (Fine-grained)](https://github.com/settings/personal-access-tokens/new)
2. Set name: `CMS Token`
3. Expiration: 90 days (renewable)
4. Resource owner: Your account
5. Repository access: Only select `chiragdhunna.github.io`
6. Permissions needed:
   - Repository permissions → Contents: `Read and write`
   - Repository permissions → Actions: `Read and write`
7. Click "Generate token" and copy it
8. Add to `.env.local` as `VITE_GITHUB_PAT`

### 2. Add GitHub Secrets

In your GitHub repository Settings → Secrets and variables → Actions:

1. Create secret `ADMIN_SECRET` with the same value as `VITE_ADMIN_PASSWORD`
2. (Optional) Create secret `OVERLEAF_PROJECT_ID` if using resume sync

### 3. Test the Admin Panel

1. **Development**: Run `npm run dev` and navigate to `http://localhost:5173/admin`
2. **Production**: Go to `https://chiragdhunna.github.io/admin`

### 4. Usage

#### Adding a Certification

1. Go to `/admin`
2. Enter your admin password
3. Fill in:
   - **Certification Name**: e.g., "AWS Certified AI Practitioner"
   - **Issuer**: e.g., "Amazon Web Services"
   - **Issue Date**: Date you received the cert
   - **Credential URL** (optional): Link to verify the credential
   - **Image**: JPG/PNG (max 5MB, auto-resized to 1200px)
   - **PDF** (optional): Certificate PDF (max 10MB)
4. Click "Add Certification"
5. Wait 60 seconds for the live site to update

#### Behind the Scenes

1. Admin UI encodes files to base64
2. Issues JWT token signed with admin password
3. Sends `repository_dispatch` event to GitHub Actions with JWT
4. `cms-update.yml` workflow:
   - Validates JWT with admin secret
   - Decodes files from base64
   - Creates slug from name (kebab-case)
   - Saves image to `public/assets/certs/<slug>.jpg`
   - Saves PDF to `public/assets/certs/<slug>.pdf`
   - Appends entry to `public/data/certs.json`
   - Commits changes with message "chore: update certifications from CMS"
   - Triggers `deploy.yml` to rebuild the site

## Data Schema

### Certification Entry

```json
{
  "id": "cert_aws",
  "slug": "aws-certified-ai-practitioner",
  "name": "AWS Certified AI Practitioner",
  "issuer": "Amazon Web Services",
  "imageUrl": "/assets/certs/aws-certified-ai-practitioner.jpg",
  "pdfUrl": "/assets/certs/aws-certified-ai-practitioner.pdf",
  "credentialUrl": "https://example.com/verify",
  "issueDate": "2026-05-17T00:00:00Z",
  "createdAt": "2026-05-18T00:00:00Z"
}
```

### Project Entry

```json
{
  "id": "proj_myproject",
  "slug": "my-awesome-project",
  "name": "My Awesome Project",
  "description": "A brief description",
  "imageUrl": "/assets/projects/my-awesome-project.jpg",
  "projectUrl": "https://github.com/user/repo",
  "demoUrl": "https://demo.example.com",
  "tags": ["React", "Node.js", "MongoDB"],
  "createdAt": "2026-05-18T00:00:00Z"
}
```

## Security Notes

- **Passwords in sessionStorage only**: Not localStorage (cleared on tab close)
- **JWT validation**: Happens server-side in the workflow
- **No hardcoded secrets**: Use GitHub Secrets for sensitive data
- **CORS-free**: No external API calls, everything goes through GitHub
- **Base64 encoding**: Files are safer transmitted as text

## Troubleshooting

### "Admin password not configured"

Add `VITE_ADMIN_PASSWORD` to `.env.local`

### "GitHub API error: 401"

Check your `VITE_GITHUB_PAT`:

- Is it valid and not expired?
- Does it have the right scopes (Contents + Actions)?
- Is the repo correct?

### "JWT validation failed"

Ensure `ADMIN_SECRET` in GitHub Secrets exactly matches `VITE_ADMIN_PASSWORD`

### Changes not appearing

1. Check GitHub Actions tab in repo settings
2. Verify `cms-update.yml` workflow ran successfully
3. Check the `deploy.yml` workflow also completed
4. Hard-refresh browser cache (Ctrl+Shift+R)

## Future Enhancements

- [ ] Project management form
- [ ] Edit existing certifications
- [ ] Delete certifications from UI
- [ ] Bulk upload support
- [ ] Activity log viewer
- [ ] Email notifications on successful uploads

## Files Created

```
src/components/Admin/
├── AdminApp.jsx              # Main admin component (lazy-loaded)
├── AdminLogin.jsx            # Login form
├── AdminLogin.css
├── AdminDashboard.jsx        # Dashboard with tabs
├── AdminDashboard.css
├── CertForm.jsx              # Certification form
├── CertForm.css
├── auth.js                   # JWT functions
└── githubApi.js              # GitHub dispatch integration

.github/workflows/
└── cms-update.yml            # GitHub Actions workflow

.env.example                  # Environment variable template
```
