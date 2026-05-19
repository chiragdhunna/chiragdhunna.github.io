# 🚀 CMS Workflow - Quick Start Guide

Your portfolio now has a complete **Certification Management System** with automatic GitHub syncing!

## What Was Built

✅ **Admin UI** (`/admin` route) - Lazy-loaded password-protected panel  
✅ **Certification Form** - Upload image + PDF + title  
✅ **JWT Authentication** - Secure Web Crypto-based tokens  
✅ **GitHub Actions Workflow** - Automatic deployment on upload  
✅ **Zero External Dependencies** - Everything uses GitHub APIs  

## How It Works (3-Step Process)

1. **You submit** → Go to `your-site.com/admin`, login, fill form, upload image/PDF
2. **Workflow processes** → `cms-update.yml` validates JWT, saves files, updates JSON
3. **Site rebuilds** → `deploy.yml` triggers automatically, live in ~60 seconds

## Setup (5 Minutes)

### Step 1: Create Environment Variables

Create `.env.local` in your project root (never commit this):

```bash
VITE_ADMIN_PASSWORD=MySecurePassword123!
VITE_GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**To get your GitHub PAT:**
1. Go to https://github.com/settings/personal-access-tokens/new
2. Name: `CMS Token`
3. Expiration: 90 days
4. Select repository: `chiragdhunna.github.io`
5. Permissions:
   - ✓ Contents: Read and write
   - ✓ Actions: Read and write
6. Generate and copy the token

### Step 2: Add GitHub Secrets

In your GitHub repo settings (Settings → Secrets and variables → Actions):

```
ADMIN_SECRET = MySecurePassword123!
```
(Same value as `VITE_ADMIN_PASSWORD`)

### Step 3: Test It

**Development:**
```bash
npm run dev
# Go to http://localhost:5173/admin
```

**Production:**
- Go to https://chiragdhunna.github.io/admin
- Enter your admin password
- Fill in the form and submit!

## File Structure

```
src/components/Admin/
├── AdminApp.jsx          ← Main component (lazy-loaded)
├── AdminLogin.jsx        ← Login page
├── AdminDashboard.jsx    ← Dashboard with tabs
├── CertForm.jsx          ← Upload form for certifications
├── auth.js               ← JWT functions
└── githubApi.js          ← GitHub dispatch integration

.github/workflows/
└── cms-update.yml        ← Handles uploads & updates

public/data/
├── certs.json           ← Certification database
└── projects.json        ← Projects database (future use)
```

## Features

- 🖼️ **Image Upload** - JPG/PNG (auto-resized to 1200px max)
- 📄 **PDF Support** - Optional certificate PDFs
- 🔐 **Secure Auth** - JWT in sessionStorage (4-hour expiry)
- 🤖 **Auto Deploy** - Triggers rebuild on every upload
- 🔄 **Real Database** - All data in `certs.json` (part of repo)
- 📱 **Responsive** - Works on desktop and mobile

## Example Upload

Fill out the form with:
- **Name**: AWS Certified AI Practitioner
- **Issuer**: Amazon Web Services
- **Issue Date**: 2026-05-17
- **Credential URL**: https://aws.amazon.com/credentials
- **Image**: Your certificate badge (PNG/JPG)
- **PDF**: Your certificate PDF (optional)

Click "Add Certification" → Check in ~60 seconds for live update

## What Gets Saved

New entry in `public/data/certs.json`:
```json
{
  "id": "cert_aws",
  "slug": "aws-certified-ai-practitioner",
  "name": "AWS Certified AI Practitioner",
  "issuer": "Amazon Web Services",
  "imageUrl": "/assets/certs/aws-certified-ai-practitioner.jpg",
  "pdfUrl": "/assets/certs/aws-certified-ai-practitioner.pdf",
  "credentialUrl": "https://aws.amazon.com/credentials",
  "issueDate": "2026-05-17T00:00:00Z",
  "createdAt": "2026-05-18T10:30:00Z"
}
```

## Workflow Flow Chart

```
Admin Form Submit
    ↓
Issue JWT Token
    ↓
Send repository_dispatch
    ↓
GitHub Actions: cms-update.yml
    ↓
[Validate JWT] → [Decode Files] → [Create Slug] → [Save Assets]
    ↓
Update certs.json
    ↓
Git commit & push
    ↓
Trigger deploy.yml
    ↓
Rebuild & deploy to gh-pages
    ↓
Site live! 🎉 (60 seconds)
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| "Admin password not configured" | Add `VITE_ADMIN_PASSWORD` to `.env.local` |
| "GitHub API error: 401" | Check your GitHub PAT is valid & not expired |
| "JWT validation failed" | Ensure `ADMIN_SECRET` in GitHub matches `VITE_ADMIN_PASSWORD` |
| Changes not appearing | Check GitHub Actions logs, hard refresh (Ctrl+Shift+R) |
| Image too large | Max 5MB (auto-resized anyway) |
| PDF too large | Max 10MB |

## Security Notes

🔒 **Passwords**: Stored in sessionStorage only (cleared on tab close)  
🔒 **JWT**: Validated server-side in the workflow  
🔒 **Secrets**: Never hardcoded, always in GitHub Secrets  
🔒 **CORS**: No external APIs, everything through GitHub  

## Next Steps

- 🎯 Test the admin panel and upload a test certification
- 📝 Customize the form if needed
- 🚀 Push the `cms-workflow` branch and create a pull request
- ✅ Merge when ready

## For Future Development

The structure supports:
- Project uploads (same flow as certs)
- Edit/delete operations (just add more event types)
- Bulk uploads (future enhancement)
- Email notifications (future enhancement)

---

**Questions?** See [src/components/Admin/README.md](src/components/Admin/README.md) for detailed documentation.

Happy publishing! 🚀
