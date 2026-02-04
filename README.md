# Chirag Dhunna's Portfolio

A modern, responsive personal portfolio website built with React.js, showcasing projects, skills, and professional experience.

## 📋 Table of Contents

- [Overview](#overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Project](#running-the-project)
- [Building for Production](#building-for-production)
- [Deployment](#deployment)
- [Available Scripts](#available-scripts)
- [Component Documentation](#component-documentation)
- [Customization](#customization)
- [License](#license)

## 🎯 Overview

This is a self-developed personal portfolio website designed to showcase professional work, skills, and accomplishments. Built with modern web technologies, it features a responsive design, smooth animations, and interactive elements.

**Live URL:** https://chiragdhunna.github.io

## ✨ Features

- **Responsive Design** - Works seamlessly on desktop, tablet, and mobile devices
- **Smooth Animations** - Particle effects and parallax animations for an engaging experience
- **Multi-page Navigation** - Home, About, Projects, and Resume sections
- **Interactive Elements** - Hover effects, typewriter animations, and smooth scrolling
- **Automated Resume Sync** - Automatically syncs resume from Overleaf via GitHub Actions
- **PDF Resume Download** - View and download resume in PDF format
- **GitHub Integration** - Display GitHub activity calendar
- **Tech Stack Showcase** - Visual representation of technical skills
- **Project Portfolio** - Showcase your projects with descriptions and links
- **Dark Theme** - Modern dark theme for a professional appearance
- **CI/CD Pipeline** - Automated deployment to GitHub Pages with GitHub Actions

## 🛠️ Tech Stack

### Frontend

- **React** (v18.2.0) - UI library
- **React Router** (v6.2.2) - Client-side routing
- **Vite** (v6.2.2) - Build tool and dev server

### Styling

- **Bootstrap** (v5.1.3) - CSS framework
- **React Bootstrap** (v2.2.1) - Bootstrap components for React
- **Custom CSS** - Custom styling and animations

### Dependencies

- **react-tsparticles** (v1.42.2) - Particle background animations
- **react-parallax-tilt** (v1.7.42) - 3D tilt effect for cards
- **typewriter-effect** (v2.18.2) - Typewriter text animation
- **react-icons** (v4.8.0) - Icon library
- **react-pdf** (v7.5.1) - PDF viewing
- **@react-pdf/renderer** (v3.1.14) - PDF generation
- **axios** (v1.7.9) - HTTP client
- **react-github-calendar** (v3.2.2) - GitHub activity calendar

### Build & Deployment

- **gh-pages** (v6.3.0) - GitHub Pages deployment

## 📁 Project Structure

```
chiragdhunna.github.io/
├── .github/
│   └── workflows/
│       ├── build-resume.yml # Syncs resume from Overleaf
│       └── deploy.yml       # Deploys to GitHub Pages
├── public/
│   ├── CHIRAG_DHUNNA.pdf   # Auto-synced resume PDF
│   ├── _redirects          # Vercel/Netlify redirects
│   ├── manifest.json       # PWA manifest
│   ├── robots.txt          # SEO robots file
│   └── favicon.png         # Website favicon
├── src/
│   ├── components/
│   │   ├── Footer.jsx      # Footer component
│   │   ├── Navbar.jsx      # Navigation bar
│   │   ├── Particle.jsx    # Particle background effect
│   │   ├── Pre.jsx         # Preloader component
│   │   ├── ScrollToTop.jsx # Scroll to top button
│   │   ├── About/          # About section
│   │   │   ├── About.jsx
│   │   │   ├── AboutCard.jsx
│   │   │   ├── Github.jsx
│   │   │   ├── Techstack.jsx
│   │   │   └── Toolstack.jsx
│   │   ├── Home/           # Home section
│   │   │   ├── Home.jsx
│   │   │   ├── Home2.jsx
│   │   │   └── Type.jsx
│   │   ├── Projects/       # Projects section
│   │   │   ├── Projects.jsx
│   │   │   └── ProjectCards.jsx
│   │   └── Resume/         # Resume section
│   │       └── ResumeNew.jsx
│   ├── assets/             # Static assets and images
│   │   └── Projects/
│   ├── App.jsx             # Main App component
│   ├── App.css             # App styles
│   ├── index.jsx           # Entry point
│   ├── index.css           # Global styles
│   ├── style.css           # Additional styles
│   ├── setupTests.js       # Testing setup
│   └── reportWebVitals.js  # Performance metrics
├── index.html              # HTML template
├── vite.config.js          # Vite configuration
├── package.json            # Project dependencies
└── README.md               # This file
```

## 📋 Prerequisites

Before running this project, ensure you have the following installed:

- **Node.js** (v14.0.0 or higher) - [Download](https://nodejs.org/)
- **npm** (v6.0.0 or higher) - Comes with Node.js

### Verify Installation

```bash
node --version
npm --version
```

## 🚀 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/chiragdhunna/chiragdhunna.github.io.git
   cd chiragdhunna.github.io
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

   This will install all required packages listed in `package.json`.

## 🏃 Running the Project

### Development Server

Start the development server for local testing and development:

```bash
npm run dev
```

The application will start at `http://localhost:3000`

**Development Server Features:**

- Hot Module Replacement (HMR) - Instant updates without page refresh
- Fast build times with Vite
- Development-friendly error messages

### Preview Production Build

To preview the production build locally:

```bash
npm run preview
```

This builds the project and serves it for preview purposes.

## 🔧 Building for Production

Create an optimized production build:

```bash
npm run build
```

**Build Output:**

- Creates a `dist/` folder with optimized files
- Minified JavaScript and CSS
- Optimized images
- Ready for deployment

**Build Process:**

1. Vite compiles React components
2. AAutomated Deployment with GitHub Actions (Recommended)

This project uses GitHub Actions for automated deployment and resume synchronization.

#### Workflows

**1. Resume Sync Workflow** (`.github/workflows/build-resume.yml`)

- Automatically syncs your resume from Overleaf to the repository
- Runs daily at midnight UTC
- Can be triggered manually from the Actions tab
- Downloads compiled PDF from Overleaf and commits to `public/CHIRAG_DHUNNA.pdf`

**Setup:**

1. Make your Overleaf project public (Share → Turn on link sharing)
2. Copy the project ID from the share URL
3. Add GitHub Secret: `OVERLEAF_PROJECT_ID` (Settings → Secrets and variables → Actions)
4. The workflow will automatically sync your resume daily

**2. Deploy Workflow** (`.github/workflows/deploy.yml`)

- Automatically builds and deploys to GitHub Pages on every push to `master`
- Builds the React app with Vite
- Deploys to `gh-pages` branch
- Your site is live at `https://chiragdhunna.github.io`

**Prerequisites:**

- Repository named `chiragdhunna.github.io` (username.github.io pattern)
- Repository pushed to GitHub
- GitHub Actions enabled

**Manual Deployment:**

```bash
npm run deploy
```

This command:

- Runs `npm run build` automatically (via predeploy script)
- Builds the production bundle
- Deploys the `dist/` folder to the `gh-pages` branch

2. **Manual Deployment**
   ```bash
   npm run build
   npm run deploy
   ```

### Alternative Deployment Options

#### Vercel (Recommended for best performance)

1. Go to [Vercel](https://vercel.com)
2. Connect your GitHub repository
3. Vercel auto-detects Vite and deploys with optimal settings
4. Your site is live

#### Netlify

1. Go to [Netlify](https://www.netlify.com)
2. Connect your GitHub repository
3. Build command: `npm run build`
4. Publish directory: `dist`
5. Deploy

#### Manual Deployment

1. Build the project: `npm run build`
2. Upload the `dist/` folder to your hosting provider

## 🤖 GitHub Actions Workflows

### Automated Resume Sync

Your resume is automatically synchronized from Overleaf:

1. **Edit your resume** in Overleaf
2. **Automatic sync** runs daily at midnight UTC
3. **Manual trigger** available in GitHub Actions tab
4. **PDF updates** automatically in `public/CHIRAG_DHUNNA.pdf`
5. **Website deploys** automatically with the latest resume

### Continuous Deployment

Every push to the `master` branch automatically:

1. Builds the React application
2. Optimizes assets
3. Deploys to GitHub Pages
4. Makes your site live at `https://chiragdhunna.github.io`
5. Configure your hosting provider to serve `index.html` for all routes

## 📜 Available Scripts

| Script        | Command             | Description                           |
| ------------- | ------------------- | ------------------------------------- |
| **dev**       | `npm run dev`       | Start development server on port 3000 |
| **build**     | `npm run build`     | Create production-ready build         |
| **preview**   | `npm run preview`   | Preview production build locally      |
| **deploy**    | `npm run deploy`    | Deploy to GitHub Pages                |
| **predeploy** | `npm run predeploy` | Automatically runs before deploy      |

## 🧩 Component Documentation

### Page Components

#### Home (`src/components/Home/`)

- **Home.jsx** - Main landing page component
- **Home2.jsx** - Secondary home section
- **Type.jsx** - Typewriter effect for introductory text

#### About (`src/components/About/`)

- **About.jsx** - About section main component
- **AboutCard.jsx** - Reusable card component for about info
- **Techstack.jsx** - Display technical skills and technologies
- **Toolstack.jsx** - Display tools and software expertise
- **Github.jsx** - GitHub activity calendar integration

#### Projects (`src/components/Projects/`)

- **Projects.jsx** - Projects section container
- **ProjectCards.jsx** - Individual project card component

#### Resume (`src/components/Resume/`)

- **ResumeNew.jsx** - Resume/CV viewing and download component

### Layout Components

- **Navbar.jsx** - Navigation bar with routing
- **Footer.jsx** - Footer with links and information
- **Pre.jsx** - Preloader/splash screen on initial load
- **Particle.jsx** - Particle animation background
- **ScrollToTop.jsx** - Scroll-to-top button functionality

## ✏️ Customization

### Update Personal Information

1. **Home Section** - Edit [src/components/Home/Home.jsx](src/components/Home/Home.jsx)
   - Change introduction text

### Update Resume

Your resume is automatically synced from Overleaf:

1. **Edit in Overleaf** - Make changes to your LaTeX resume in Overleaf
2. **Automatic Sync** - GitHub Actions downloads the latest PDF daily
3. **Manual Trigger** - Go to Actions → "Sync Resume from Overleaf" → Run workflow
4. **No Manual Upload** - No need to download or commit PDF files manually
   - Update social links
   - Modify tagline

5. **About Section** - Edit [src/components/About/About.jsx](src/components/About/About.jsx)
   - Update bio
   - Modify skills and tools

6. **Projects** - Edit [src/components/Projects/Projects.jsx](src/components/Projects/Projects.jsx)
   - Add/remove projects
   - Update project descriptions and links

7. **Resume** - Edit [src/components/Resume/ResumeNew.jsx](src/components/Resume/ResumeNew.jsx)
   - Update resume content
   - Add resume file

### Style Customization

- **Global Styles** - [src/style.css](src/style.css)
- **App Styles** - [src/App.css](src/App.css)
- **Component Styles** - Individual `.css` files in each component folder

### Theme Colors

Modify CSS variables in [src/style.css](src/style.css) to change the color scheme throughout the site.

### Add New Sections

1. Create a new component in `src/components/`
2. Import in [src/App.jsx](src/App.jsx)
3. Add route in the `<Routes>` section
4. Update navigation in [src/components/Navbar.jsx](src/components/Navbar.jsx)

## 📦 Dependencies Details

### Core Dependencies

- **react** - UI library foundation
- **react-dom** - React rendering engine
- **react-router-dom** - Client-side routing and navigation

### Visual Effects

- **react-tsparticles** - Animated particle background
- **react-parallax-tilt** - 3D tilt effect on hover
- **typewriter-effect** - Animated text typing effect

### UI Components

- **bootstrap** - CSS framework
- **react-bootstrap** - Bootstrap component library
- **react-icons** - SVG icon library

### Document & Content

- **react-pdf** - PDF viewing
- **@react-pdf/renderer** - PDF generation
- **react-github-calendar** - GitHub activity visualization

### Utilities

- **axios** - HTTP requests
- **pdfjs-dist** - PDF processing

## 🐛 Troubleshooting

### Port 3000 Already in Use

```bash
npm run dev -- --port 3001
```

### Build Fails

```bash
# Clear node_modules and reinstall
## 🔄 Resume Workflow

This project features an automated resume synchronization system:

**How It Works:**
1. Edit your resume in [Overleaf](https://www.overleaf.com)
2. GitHub Actions automatically downloads the latest compiled PDF
3. PDF is committed to `public/CHIRAG_DHUNNA.pdf`
4. Deployment workflow automatically deploys the updated site
5. Your website displays the latest resume

**Setup Instructions:**
1. Share your Overleaf project (Share → Turn on link sharing → Anyone can view)
2. Copy your Overleaf project ID from the share URL
3. Add it as a GitHub Secret named `OVERLEAF_PROJECT_ID`
4. The workflow runs automatically daily or can be triggered manually

**Benefits:**
- ✅ Edit resume in familiar LaTeX environment
- ✅ Automatic PDF compilation and deployment
- ✅ No manual file downloads or uploads
- ✅ Version controlled and always up-to-date

---

**Last Updated:** February 4lock.json
npm install
npm run build
```

### Deployment Issues (GitHub Pages)

1. Verify repository name is `username.github.io`
2. Ensure `gh-pages` is installed: `npm install gh-pages --save-dev`
3. Check GitHub Pages settings in repository settings
4. Verify `homepage` field in `package.json` is correct

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Contributions are welcome! Feel free to fork this repository and submit pull requests.

## 📧 Contact

For questions or feedback, please reach out through:

- GitHub: [chiragdhunna](https://github.com/chiragdhunna)
- Portfolio: [chiragdhunna.github.io](https://chiragdhunna.github.io)

---

**Last Updated:** February 2, 2026
