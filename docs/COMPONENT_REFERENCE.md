# Component & Directory Reference

This reference documents the code organization and key modules across the repository.

---

## Directory Hierarchy

```
chiragdhunna.github.io/
├── .github/
│   └── workflows/
│       └── deploy.yml            # CI/CD: node:test, build, and deploy to gh-pages
├── docs/                         # Extended architectural documentation and images
│   ├── images/
│   │   └── banner.svg            # Hero banner SVG
│   ├── ADMIN_GUIDE.md            # Detailed operations guide for /admin
│   ├── ARCHITECTURE.md           # System design & data flow specification
│   ├── COMPONENT_REFERENCE.md    # Source tree & module reference
│   ├── DATA_SCHEMAS.md           # JSON database definitions & filtering logic
│   └── TROUBLESHOOTING.md        # Debugging & troubleshooting catalog
├── public/                       # Static files served directly by Vite
│   ├── assets/                   # Site-wide images, cert thumbnails & project logos
│   ├── data/
│   │   ├── certs.json            # Certifications database
│   │   └── projects.json         # Projects database
│   └── resume/
│       └── Chirag_Dhunna.pdf     # Primary resume PDF document
├── src/                          # React application source code
│   ├── components/
│   │   ├── About/                # About section & GitHub contribution graph
│   │   ├── Admin/                # Full headless CMS dashboard & authentication
│   │   │   ├── AdminApp.jsx      # Lazy-loaded router entrypoint for /admin
│   │   │   ├── AdminDashboard.jsx# Tabbed management interface (Projects, Certs, Resume)
│   │   │   ├── AdminLogin.jsx    # Password challenge & session initiation
│   │   │   ├── CertForm.jsx      # Certification create/edit modal with issuer combobox
│   │   │   ├── ProjectForm.jsx   # Project create/edit modal with category pills
│   │   │   ├── DropZone.jsx      # Drag-and-drop file upload target with validation
│   │   │   ├── auth.js           # Web Crypto HMAC-SHA256 JWT implementation
│   │   │   └── githubApi.js      # Worker proxy & direct GitHub API client
│   │   ├── Certifications/       # Standalone/legacy certifications view
│   │   ├── Footer.jsx            # Legacy layout footer
│   │   ├── Home/                 # Legacy multi-page home view
│   │   ├── Navbar.jsx            # Navigation bar for legacy routes
│   │   ├── Particle.jsx          # Particle starfield background canvas
│   │   ├── Portfolio/            # Modern single-page portfolio homepage
│   │   │   ├── Portfolio.jsx     # Comprehensive single-page portfolio (Sections 01-06)
│   │   │   └── Portfolio.css     # Portfolio styles, responsive grid, animations
│   │   ├── Projects/             # Standalone/legacy projects view
│   │   ├── Resume/               # Interactive PDF viewer & download page
│   │   └── common/
│   │       └── CategoryFilterDropdown.jsx # Reusable category & issuer filter dropdown
│   ├── tests/                    # Node test runner suites
│   ├── utils/
│   │   ├── categories.js         # Category matching, sorting, and counting helpers
│   │   └── issuers.js            # Issuer normalization, aliasing, and AND-filter engine
│   ├── App.jsx                   # Application router and layout switcher
│   └── index.jsx                 # React root DOM mount
└── workers/
    └── index.ts                  # Cloudflare Edge Worker TypeScript source
```

---

## Core Modules

### 1. Application Layout (`src/App.jsx`)
- Configures client-side routing via `react-router-dom` (v6).
- Renders [`Portfolio.jsx`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/components/Portfolio/Portfolio.jsx) for the `/` route with its own integrated navigation, suppressing legacy navbar/footer.
- Lazy-loads [`AdminApp.jsx`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/components/Admin/AdminApp.jsx) for `/admin/*`.
- Preserves legacy standalone routes (`/project`, `/certifications`, `/about`, `/resume`).
- Controls initial page preloader timing (1200ms).

### 2. Single-Page Portfolio (`src/components/Portfolio/Portfolio.jsx`)
- **01. Introduction (Hero)**: Greeting, typewriter roles, interactive buttons, status indicator.
- **02. About**: Personal bio, quick stats, and live GitHub contribution activity via `react-github-calendar`.
- **03. Stack**: Categorized tech chips (Languages & Frameworks, Cloud & DevOps, Database & Tools).
- **04. Selected Work (Projects)**: Filterable project showcase with category filter pills and dynamic dropdown.
- **05. Credentials (Certifications)**: Multi-faceted filtering combining Category and Issuer with real-time AND matching and faceted counts.
- **06. Contact**: Direct communication links and contact card.

### 3. CMS Administration (`src/components/Admin/`)
- **AdminLogin**: Password submission form generating a 4-hour JWT token.
- **AdminDashboard**: Tabbed layout for Projects, Certifications, and Resume.
- **DropZone**: Reusable drag-and-drop zone with page-level protection to avoid browser navigation on dropped files.
- **githubApi.js**: Unified API client that automatically targets Cloudflare Worker in production (`import.meta.env.PROD`) or direct GitHub REST API in development.

### 4. Utility Engines (`src/utils/`)
- **categories.js**: Dynamic category aggregation (`getAvailableCategories`), case-insensitive equality checks (`categoryMatches`), and count derivation (`getItemCount`).
- **issuers.js**: Built-in 18 default industry issuers, alias normalization map (`ISSUER_ALIASES`), and multi-faceted AND filter engine (`filterCerts`, `countCerts`).
