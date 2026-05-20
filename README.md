# Chirag Dhunna's Portfolio

A modern, responsive personal portfolio website built with React.js with an integrated **Portfolio CMS** for managing certifications and projects without touching code.

🌐 **[View Live Portfolio](https://chiragdhunna.github.io)**

## 📋 Quick Navigation

- [Overview](#overview)
- [🆕 New CMS Features](#-new-cms-features)
- [Quick Start Guide](#quick-start-guide)
- [Core Features](#core-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Installation & Setup](#installation--setup)
- [Running the Project](#running-the-project)
- [CMS Architecture](#cms-architecture)
- [Data Schemas](#data-schemas)
- [Security & Authentication](#security--authentication)
- [Admin Panel Guide](#admin-panel-guide)
- [Customization](#customization)
- [Troubleshooting](#troubleshooting)
- [Component Reference](#component-reference)
- [License](#license)

---

## 🎯 Overview

This portfolio showcases professional work, skills, and accomplishments with a unique feature: an **integrated Content Management System** built entirely on GitHub infrastructure. No external database, backend server, or cloud functions needed.

**Live URL:** https://chiragdhunna.github.io

**Key Innovation:** This portfolio uses **GitHub as a database** with **GitHub Actions workflows** to process CMS events. Edit content via an admin panel, and your changes go live automatically in ~60 seconds.

---

## 🆕 New CMS Features

### What's New in This Version

This portfolio now includes a **complete Content Management System** for zero-code management:

#### 1. Certifications Page (`/certifications`)

- New navigation item between "Projects" and "Resume"
- Displays certifications with badges, issuer info, and dates
- One-click access to verification links and PDFs
- Data sourced from `public/data/certs.json`

#### 2. Admin Control Panel (`/admin`)

- **Password-protected dashboard** at `/admin` route
- **Lazy-loaded** - never shipped in public bundle
- **Secure JWT authentication** using Web Crypto API
- **4-hour sessions** stored in `sessionStorage` (auto-clearing)

#### 3. Certification Upload Form

- Upload badge image (JPG/PNG, auto-resized to 1200px)
- Optional PDF certificate
- Credential verification URL
- Issue date tracking
- Automatic slug generation

#### 4. GitHub Actions CMS Workflow (`cms-update.yml`)

- Processes CMS events automatically
- Validates JWT tokens before any changes
- Handles file encoding/decoding
- Updates JSON database
- Triggers automatic deployment
- Changes live in ~60 seconds

#### 5. Navbar Update

- New "Certifications" link with icon
- Placed between "Projects" and "Resume"
- Consistent styling with existing nav

---

## 🚀 Quick Start Guide

### ⏱️ 5-Minute Setup

#### Step 1: Create Environment Variables

Create `.env.local` in project root **(never commit)**:

```bash
VITE_ADMIN_PASSWORD=MySecurePassword123!
VITE_GITHUB_PAT=ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Generating GitHub Personal Access Token (PAT):**

1. Go to [GitHub Settings → Personal Access Tokens (Fine-grained)](https://github.com/settings/personal-access-tokens/new)
2. **Name:** `CMS Token`
3. **Expiration:** 90 days
4. **Repository access:** Select only `chiragdhunna.github.io`
5. **Permissions:**
   - ✓ Contents: Read and write
   - ✓ Actions: Read and write
6. Generate and copy token

#### Step 2: Add GitHub Secrets

In repository **Settings → Secrets and variables → Actions:**

- **Name:** `ADMIN_SECRET`
- **Value:** Same password as `VITE_ADMIN_PASSWORD`

#### Step 3: Test

```bash
npm run dev
# Visit http://localhost:5173/admin
# Enter your password
```

### 📝 Using the Admin Panel

**To Add a Certification:**

1. Navigate to `/admin`
2. Enter admin password
3. Fill form:
   - Certification Name (e.g., "AWS Certified AI Practitioner")
   - Issuer (e.g., "Amazon Web Services")
   - Issue Date (date picker)
   - Credential URL (optional)
   - Image file (JPG/PNG, max 5MB)
   - PDF file (optional, max 10MB)
4. Click "Add Certification"
5. Wait ~60 seconds for site to update

**Behind the Scenes:**

1. ✅ Admin UI validates input
2. 🖼️ Converts image to base64, resizes to 1200px
3. 📄 Converts PDF to base64
4. 🔐 Issues JWT token (HMAC-SHA256)
5. 🚀 Sends GitHub Actions event
6. ⚙️ Workflow validates JWT, saves files
7. 📊 Updates `certs.json` with new entry
8. 🔄 Triggers deploy workflow
9. ✨ Site live in ~60 seconds

---

## ✨ Core Features

### Portfolio Features

- **Responsive Design** - Desktop, tablet, mobile optimized
- **Smooth Animations** - Particle effects, parallax, typewriter text
- **Multi-page Navigation** - Home, About, Projects, Certifications, Resume
- **Interactive Elements** - Hover effects, smooth scrolling
- **GitHub Integration** - Activity calendar
- **Tech Stack Showcase** - Visual skills display
- **Dark Theme** - Professional dark mode
- **Automated Resume Sync** - Syncs from Overleaf via GitHub Actions

### CMS Features (New)

- **Certification Management** - Add/manage without coding
- **Admin Dashboard** - Password-protected panel
- **JWT Security** - Web Crypto API authentication
- **File Uploads** - Browser-based image/PDF upload
- **GitHub Database** - JSON files in repository
- **Auto Deploy** - Changes go live automatically
- **Zero External Dependencies** - GitHub-only solution
- **Secure Sessions** - 4-hour expiring tokens

---

## 🛠️ Tech Stack

### Frontend

- **React** 18.2.0 - UI framework
- **React Router** 6.2.2 - Client-side routing
- **Vite** 6.2.2 - Build tool
- **Bootstrap** 5.1.3 - CSS framework
- **React Bootstrap** 2.2.1 - Bootstrap components

### CMS Tech (New)

- **Web Crypto API** - JWT signing (no dependencies)
- **HMAC-SHA256** - Token signing
- **Base64 Encoding** - Secure file transmission
- **GitHub Actions** - Workflow automation
- **Python 3.11** - Workflow processing

### Libraries

- **react-tsparticles** - Particle animations
- **react-parallax-tilt** - 3D tilt effects
- **typewriter-effect** - Text animation
- **react-icons** - Icon library
- **react-pdf** - PDF viewing
- **axios** - HTTP client

### Build & Deployment

- **gh-pages** - GitHub Pages deployment

---

## 📁 Project Structure

```
chiragdhunna.github.io/
├── .github/workflows/
│   ├── build-resume.yml           # Resume sync from Overleaf
│   ├── deploy.yml                 # Deploy to GitHub Pages
│   └── cms-update.yml             # 🆕 CMS event processing
├── public/
│   ├── CHIRAG_DHUNNA.pdf         # Auto-synced resume
│   ├── data/                      # 🆕 JSON databases
│   │   ├── certs.json            # Certifications
│   │   └── projects.json         # Projects
│   ├── assets/
│   │   └── certs/                # 🆕 Cert images & PDFs
│   ├── _redirects
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── components/
│   │   ├── Navbar.jsx            # Updated with Certifications
│   │   ├── Footer.jsx
│   │   ├── Particle.jsx
│   │   ├── Pre.jsx
│   │   ├── ScrollToTop.jsx
│   │   ├── Home/
│   │   ├── About/
│   │   ├── Projects/
│   │   ├── Certifications/       # 🆕 New section
│   │   │   ├── Certifications.jsx
│   │   │   └── CertCard.jsx
│   │   ├── Admin/                # 🆕 Admin UI (lazy-loaded)
│   │   │   ├── AdminApp.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── CertForm.jsx
│   │   │   ├── ProjectForm.jsx
│   │   │   ├── auth.js           # JWT utilities
│   │   │   ├── githubApi.js      # GitHub integration
│   │   │   ├── AdminLogin.css
│   │   │   ├── AdminDashboard.css
│   │   │   ├── CertForm.css
│   │   │   ├── ProjectForm.css
│   │   │   └── README.md
│   │   └── Resume/
│   ├── App.jsx                   # Updated with /admin route
│   ├── App.css
│   ├── style.css
│   ├── index.jsx
│   └── ...
├── .env.local                    # 🆕 Environment variables (not committed)
├── .env.example                  # 🆕 Template for env vars
├── .gitignore
├── CMS_SETUP.md                  # 🆕 CMS quick start
├── README.md                     # This file
├── package.json
├── vite.config.js
└── index.html
```

---

## 📋 Installation & Setup

### Prerequisites

- **Node.js** v14.0.0+ - [Download](https://nodejs.org/)
- **npm** v6.0.0+ - Comes with Node.js
- **Git** - For version control

### Verify Installation

```bash
node --version
npm --version
git --version
```

### Clone & Install

```bash
# Clone repository
git clone https://github.com/chiragdhunna/chiragdhunna.github.io.git
cd chiragdhunna.github.io

# Install dependencies
npm install

# Setup environment variables
cp .env.example .env.local
# Edit .env.local with your values
```

---

## 🏃 Running the Project

### Development Server

```bash
npm run dev
```

- Starts at `http://localhost:5173`
- Hot Module Replacement (HMR) enabled
- Dev-friendly error messages

**Test Admin Panel:**

- Navigate to `http://localhost:5173/admin`
- Enter password from `.env.local`

### Preview Production Build

```bash
npm run preview
```

- Builds and serves locally
- Shows production-like behavior

### Build for Production

```bash
npm run build
```

- Creates optimized `dist/` folder
- Minified JavaScript and CSS
- Ready for deployment

### Deploy to GitHub Pages

```bash
npm run deploy
```

- Runs build automatically
- Deploys `dist/` to `gh-pages` branch
- Live at https://chiragdhunna.github.io

---

## 📊 CMS Architecture

### System Overview

```
Browser Admin Panel          GitHub Repository       GitHub Actions
    ↓                              ↓                        ↓
1. User fills form           .env.local (dev)    Workflow: cms-update.yml
2. Issues JWT token          .env.example
3. Converts to base64        certs.json          Step 1: Check JWT valid
4. Sends to GitHub           assets/certs/       Step 2: Decode files
5. Waits for update          ...                 Step 3: Create slug
                                                 Step 4: Save assets
                                                 Step 5: Update JSON
                                                 Step 6: Git commit+push
                                                 Step 7: Trigger deploy
                                                        ↓
                                                 Site rebuilds & goes live
                                                 ✅ Changes visible (~60s)
```

### Data Flow: Detailed

1. **Admin Submission** - User fills form at `/admin`
2. **Client Processing** - Image resized, files encoded to base64
3. **Token Generation** - JWT created using HMAC-SHA256
4. **GitHub API Call** - `repository_dispatch` event sent
5. **Workflow Trigger** - `cms-update.yml` receives event
6. **JWT Validation** - Python script validates signature
7. **File Decoding** - Base64 decoded back to binary
8. **File Storage** - Images/PDFs saved to `public/assets/certs/`
9. **JSON Update** - New entry appended to `certs.json`
10. **Git Operations** - Changes committed and pushed
11. **Deploy Trigger** - `deploy.yml` workflow starts
12. **Site Rebuild** - React app built with new data
13. **Live Update** - Changes visible on site

### GitHub Actions Workflow (`cms-update.yml`)

**Events Handled:**

- `add-cert` - Add certification
- `update-cert` - Update certification (extensible)
- `delete-cert` - Delete certification (extensible)
- `add-project` - Add project (extensible)
- `update-project` - Update project (extensible)
- `delete-project` - Delete project (extensible)

**Security Checks:**

1. ✅ Validates JWT signature with `ADMIN_SECRET`
2. ✅ Checks file MIME types (JPG/PNG for images, PDF for docs)
3. ✅ Enforces file size limits (5MB images, 10MB PDFs)
4. ✅ Sanitizes filenames (removes special characters)
5. ✅ Never processes if validation fails

**Operations:**

1. Checkout repository
2. Setup Python 3.11
3. Validate JWT signature
4. Decode base64 files
5. Update JSON database
6. Create meaningful commit
7. Push to main branch
8. Trigger deploy workflow

---

## 📋 Data Schemas

### Certification Entry

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

**Fields:**

- `id` - Unique identifier (auto-generated)
- `slug` - URL-friendly kebab-case (auto-generated from name)
- `name` - Certification title
- `issuer` - Organization that issued it
- `imageUrl` - Path to badge image (JPG/PNG)
- `pdfUrl` - Path to certificate PDF (optional)
- `credentialUrl` - URL to verify on issuer's site (optional)
- `issueDate` - ISO 8601 date earned
- `createdAt` - ISO 8601 timestamp added to portfolio

### Project Entry (Extensible)

```json
{
  "id": "proj_myproject",
  "slug": "my-awesome-project",
  "name": "My Awesome Project",
  "description": "Brief description",
  "imageUrl": "/assets/projects/my-awesome-project.jpg",
  "projectUrl": "https://github.com/username/repo",
  "demoUrl": "https://demo.example.com",
  "tags": ["React", "Node.js"],
  "createdAt": "2026-05-18T00:00:00Z"
}
```

---

## 🔐 Security & Authentication

### JWT Authentication

**How It Works:**

1. User enters password
2. Client creates JWT using Web Crypto API
3. Token = Header.Payload.Signature (all base64url encoded)
4. Signature = HMAC-SHA256(Header.Payload, password)
5. Stored in `sessionStorage` with 4-hour expiry
6. Sent with every API call
7. Workflow validates signature before processing

**Token Expiration:**

- Valid for 4 hours from issue time
- Auto-cleared when tab/browser closes
- Can manually logout anytime

### Password Security

**Create Strong Password:**

- ✅ 12+ characters
- ✅ Mix of uppercase, lowercase, numbers, symbols
- ✅ Example: `Tr0p!cal_Sun$et2026`

**Storage:**

- `.env.local` - Development (never commit)
- GitHub Secret `ADMIN_SECRET` - Production (encrypted)
- Never in source code

### GitHub PAT Security

**Use Fine-Grained Tokens:**

- Scoped to single repository
- Limited to required permissions only
- Set 90-day expiration
- Rotate regularly

**Required Permissions:**

- ✓ Contents: Read and write
- ✓ Actions: Read and write
- ✗ No admin access needed

**If Compromised:**

1. Revoke immediately in GitHub Settings
2. Create new token
3. Update `.env.local` and GitHub Secrets
4. No redeploy needed (workflow uses Secrets)

### Workflow Security

**JWT Validation Process:**

1. Extract JWT from payload
2. Split into 3 parts: header.payload.signature
3. Recreate signature using `ADMIN_SECRET`
4. Compare with provided signature
5. If mismatch: job fails, nothing changes

**File Validation:**

1. Check MIME types (JPG/PNG for images, PDF for docs)
2. Check file sizes (5MB images, 10MB PDFs)
3. Sanitize filenames
4. Validate JSON before writing

**No External Calls:**

- Everything processed in workflow
- No third-party services
- No tracking or analytics

---

## 👥 Admin Panel Guide

### AdminApp Component

**Purpose:** Main admin container

**Behavior:**

1. On load: Checks for valid token in `sessionStorage`
2. If valid: Shows AdminDashboard
3. If not: Shows AdminLogin
4. Handles logout and routing

**Lazy Loading:**

- Component loaded via `React.lazy()` in `App.jsx`
- Only fetched when visiting `/admin`
- Never in main production bundle

### AdminLogin Component

**Features:**

- Fullscreen centered form
- No navbar or particles
- Show/hide password toggle
- "Back to Portfolio" button
- Error messages
- Loading state

**Process:**

1. Enter password
2. Click "Login" or press Enter
3. JWT token created
4. Redirect to dashboard

### AdminDashboard Component

**Layout:**

- Tab interface (Certifications | Projects)
- User greeting
- Logout button (top-right)
- Responsive design
- Dark theme matching portfolio

### CertForm Component

**Form Fields:**

1. **Certification Name** (required)
   - Used to generate slug
   - Example: "AWS Certified AI Practitioner"

2. **Issuer** (required)
   - Organization name
   - Example: "Amazon Web Services"

3. **Issue Date** (required)
   - Date picker
   - Used for sorting/display

4. **Credential URL** (optional)
   - Link to verify credential
   - Opens in new tab from cert card

5. **Certificate Image** (required)
   - JPG/PNG only
   - Max 5MB (auto-resized to 1200px)
   - Converted to base64 before sending

6. **Certificate PDF** (optional)
   - PDF only
   - Max 10MB
   - Converted to base64 before sending

**Submission Flow:**

1. Validate all required fields
2. Check file sizes
3. Verify file types
4. Resize image to 1200px max
5. Convert to base64
6. Get JWT token
7. Prepare payload
8. Send to GitHub
9. Show loading state
10. Display result message

**Success Message:**

```
✅ Certification submitted!
   The live site will update in ~60 seconds.
   Hard refresh to see changes.
```

### Authentication Utilities

**Key Functions in `auth.js`:**

```javascript
issueToken(password); // Create JWT (4-hour valid)
getStoredToken(); // Get token from sessionStorage
verifyToken(token); // Check if token expired
clearToken(); // Remove token (logout)
```

### GitHub Integration

**Key Function in `githubApi.js`:**

```javascript
dispatchCmsEvent(eventType, payload, token);
// Sends repository_dispatch event to trigger workflow
```

**Handles:**

- Authentication headers
- JWT in payload
- GitHub REST API call
- Error handling

---

## ✏️ Customization

### Add Certifications (No Coding)

1. Visit `/admin`
2. Login with password
3. Fill form and submit
4. Wait ~60 seconds
5. New certification appears on site

### Add Certifications (Manual)

Edit `public/data/certs.json` and add entry with schema from [Data Schemas](#data-schemas).

### Update Home Section

Edit [src/components/Home/Home.jsx](src/components/Home/Home.jsx):

- Introduction text
- Social links
- Tagline

### Update About Section

Edit [src/components/About/About.jsx](src/components/About/About.jsx):

- Bio
- Skills
- Tools

### Update Projects

Edit [src/components/Projects/Projects.jsx](src/components/Projects/Projects.jsx) or add via admin (future feature).

### Update Resume

Your resume auto-syncs from Overleaf:

1. Edit in [Overleaf](https://www.overleaf.com)
2. GitHub Actions downloads daily
3. Manual trigger: Actions tab → "Sync Resume" → Run workflow
4. No manual uploads needed

### Style Customization

**CSS Files:**

- [src/style.css](src/style.css) - Global styles
- [src/App.css](src/App.css) - App styles
- `src/components/Admin/*.css` - Admin styles

**Theme Colors:**

- Dark background: `#0d1117`
- Card background: `#161b22`
- Text: `#c9d1d9`
- Purple accent: `#c770f0`

Modify CSS variables to customize globally.

### Add New Features

**For Project Management:**

1. Enhance `ProjectForm.jsx`
2. Add to AdminDashboard tabs
3. Handle events: `add-project`, `update-project`, `delete-project`
4. Update `cms-update.yml` workflow

**For Other Content:**

1. Create `public/data/<content>.json`
2. Create display React component
3. Create form in `Admin/`
4. Add to dashboard
5. Update workflow
6. Add route in `App.jsx`

---

## 🐛 Troubleshooting

### Setup Issues

#### "Admin password not configured"

**Solution:**

1. Create `.env.local` in project root
2. Add: `VITE_ADMIN_PASSWORD=your_password_here`
3. Restart dev server: `npm run dev`

#### "GitHub API error: 401"

**Solution:**

1. Check `.env.local` has `VITE_GITHUB_PAT`
2. Verify token not expired
3. Check permissions: Contents + Actions
4. Create new token if needed
5. Update `.env.local` and GitHub Secrets

#### "JWT validation failed"

**Problem:** `ADMIN_SECRET` doesn't match password

**Solution:**

1. Go to GitHub repo Settings → Secrets
2. Edit `ADMIN_SECRET`
3. Ensure **exactly matches** `.env.local` password
4. Try again

### CMS Issues

#### "Changes not appearing"

**Checklist:**

1. Wait 60+ seconds
2. Check GitHub Actions → latest run
3. Verify `cms-update.yml` succeeded
4. Verify `deploy.yml` also ran
5. Hard refresh: `Ctrl+Shift+R`
6. Check browser console for errors

#### "Image too large"

**Limits:**

- Max 5MB
- Auto-resized to 1200px width

**Solution:**

1. Compress image
2. Retry upload

#### "Failed to validate MIME type"

**Accepted:**

- Images: JPG, PNG only
- PDFs: PDF only

**Solution:**

1. Convert to supported format
2. Retry upload

#### "Can't login to admin panel"

**Debugging:**

1. Check password spelling
2. Verify `.env.local` configured
3. Clear `sessionStorage`: F12 → Console → `sessionStorage.clear()`
4. Refresh page

#### "Admin panel not loading"

**Solution:**

1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failures
4. Hard refresh: `Ctrl+Shift+R`
5. Try incognito mode

#### "Workflow runs but no changes"

**Problem:** Workflow succeeded but `deploy.yml` didn't run

**Solution:**

1. Check GitHub Actions → `deploy.yml`
2. Verify it triggered after `cms-update.yml`
3. If not: check Actions enabled in Settings
4. Verify `deploy.yml` has `on: push` trigger

#### "Token expired"

**Expected:** 4-hour expiration

**Solution:**

1. Logout from admin
2. Login again
3. New token created

#### "Can't find certs.json"

**Solution:**

1. Check `public/data/certs.json` exists
2. If missing: create with `[]`
3. Hard refresh browser
4. Check browser Network tab

#### "Certifications page empty"

**Troubleshooting:**

1. Upload test certification
2. Wait 60 seconds
3. Hard refresh: `Ctrl+Shift+R`
4. Check browser DevTools Network tab

### Build Issues

#### Build fails locally

```bash
# Clean and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

#### Port 5173 already in use

```bash
npm run dev -- --port 3001
```

---

## 📚 Component Reference

### Page Sections

**Home** (`src/components/Home/`)

- Home.jsx, Home2.jsx, Type.jsx

**About** (`src/components/About/`)

- About.jsx, AboutCard.jsx, Techstack.jsx, Toolstack.jsx, Github.jsx

**Projects** (`src/components/Projects/`)

- Projects.jsx, ProjectCards.jsx

**Certifications** (`src/components/Certifications/`)

- Certifications.jsx, CertCard.jsx

**Admin** (`src/components/Admin/`)

- AdminApp.jsx, AdminLogin.jsx, AdminDashboard.jsx, CertForm.jsx, ProjectForm.jsx
- auth.js, githubApi.js

**Resume** (`src/components/Resume/`)

- ResumeNew.jsx

### Layout Components

- **Navbar.jsx** - Navigation (updated with Certifications)
- **Footer.jsx** - Footer
- **Pre.jsx** - Preloader
- **Particle.jsx** - Particle background
- **ScrollToTop.jsx** - Scroll button

---

## 🔄 Resume Synchronization

Your resume auto-syncs from Overleaf:

1. **Edit in Overleaf** - Make LaTeX changes
2. **Auto Sync** - GitHub Actions downloads daily
3. **Manual Trigger** - Actions → "Sync Resume" → Run workflow
4. **No Manual Upload** - Fully automated

**Setup (if using):**

1. Share Overleaf project (link sharing enabled)
2. Copy project ID from share URL
3. Add GitHub Secret: `OVERLEAF_PROJECT_ID`
4. Workflow runs daily at midnight UTC

---

## 📄 License

This project is open source and available under the MIT License.

---

## 🤝 Contributing

Contributions welcome! Feel free to fork and submit pull requests.

---

## 📧 Contact & Links

- **GitHub:** [chiragdhunna](https://github.com/chiragdhunna)
- **Portfolio:** [chiragdhunna.github.io](https://chiragdhunna.github.io)

---

## 📚 Reference Documents

- **[CMS_SETUP.md](CMS_SETUP.md)** - Quick CMS setup guide
- **[src/components/Admin/README.md](src/components/Admin/README.md)** - Admin component docs

---

**Last Updated:** May 21, 2026  
**Status:** CMS complete and functional  
**Next Steps:** Project management via CMS (extensible architecture ready)
