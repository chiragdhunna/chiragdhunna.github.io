# Data Schemas & Filtering System

This document outlines the JSON database schemas, normalization rules, and dynamic filtering mechanisms used across Chirag Dhunna's portfolio and CMS.

---

## 1. Projects Schema (`public/data/projects.json`)

Stored as a top-level JSON array of project objects located at [`public/data/projects.json`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/public/data/projects.json).

### Field Definitions

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `slug` | `string` | Yes | Kebab-case unique identifier for the project | `"chat-go"` |
| `name` | `string` | Yes | Human-readable project display name | `"Chat Go"` |
| `description`| `string` | Yes | Summary of the project, architecture, and tech | `"Real-time chat application built with React..."` |
| `categories` | `string[]` | Yes | Array of categorization tags | `["Web", "Full Stack"]` |
| `imageUrl` | `string` | Yes | Path to optimized preview thumbnail | `"/assets/projects/chat-go-logo.jpeg"` |
| `ghLink` | `string` | Yes | Public GitHub repository URL | `"https://github.com/chiragdhunna/chat_go"` |
| `demoLink` | `string` | No | Optional live demo URL or release link | `"https://chat-go-taupe.vercel.app/"` |

### JSON Example

```json
[
  {
    "slug": "chat-go",
    "name": "Chat Go",
    "categories": [
      "Web",
      "Full Stack"
    ],
    "imageUrl": "/assets/projects/chat-go-logo.jpeg",
    "description": "Chat GO is a modern and feature-rich real-time chat application built with React Vite and Node.js.",
    "ghLink": "https://github.com/chiragdhunna/chat_go",
    "demoLink": "https://chat-go-taupe.vercel.app/"
  }
]
```

---

## 2. Certifications Schema (`public/data/certs.json`)

Stored as a top-level JSON array of certification objects located at [`public/data/certs.json`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/public/data/certs.json).

### Field Definitions

| Field | Type | Required | Description | Example |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `string` | Yes | Unique record identifier (matches or derives from slug) | `"azure-ai-engineer-associate"` |
| `slug` | `string` | Yes | Kebab-case URL identifier | `"azure-ai-engineer-associate"` |
| `name` | `string` | Yes | Official credential title | `"Azure AI Engineer Associate"` |
| `issuer` | `string` | Yes | Certification organization / issuing body | `"Microsoft"` |
| `categories` | `string[]` | Yes | Array of category tags for filtering | `["Cloud", "AI"]` |
| `issueDate` | `string \| null`| No | Date issued in `YYYY-MM-DD` format, or null | `"2026-05-21"` |
| `imageUrl` | `string` | Yes | Path to certificate badge or certificate thumbnail | `"/assets/certs/azure-ai-engineer-associate.jpg"` |
| `pdfUrl` | `string \| null`| No | Path to certificate PDF document, or null | `"/assets/certs/azure-ai-engineer-associate.pdf"` |
| `credentialUrl`| `string \| null`| No | External verification URL (e.g. Credly badge), or null | `null` |
| `createdAt` | `string` | Yes | ISO 8601 creation timestamp | `"2026-05-21T08:28:27.528Z"` |

### JSON Example

```json
[
  {
    "id": "azure-ai-engineer-associate",
    "slug": "azure-ai-engineer-associate",
    "name": "Azure AI Engineer Associate",
    "issuer": "Microsoft",
    "issueDate": null,
    "imageUrl": "/assets/certs/azure-ai-engineer-associate.jpg",
    "pdfUrl": "/assets/certs/azure-ai-engineer-associate.pdf",
    "credentialUrl": null,
    "createdAt": "2026-05-21T08:28:27.528Z",
    "categories": [
      "Cloud",
      "AI"
    ]
  }
]
```

---

## 3. Dynamic Public Filtering Engine

The public portfolio leverages two utility modules: [`src/utils/categories.js`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/utils/categories.js) and [`src/utils/issuers.js`](file:///home/chiragdhunna/Desktop/docs/github_projects/chiragdhunna.github.io/src/utils/issuers.js).

### Category Filtering (`categories.js`)

- **Default Project Categories**: `["All", "Web", "Mobile", "Full Stack", "Backend"]`
- **Dynamic Category Discovery**:
  `getAvailableCategories(items, defaults)` collects all category tags across all items, de-duplicates case-insensitively, preserves default ordering, and sorts all newly discovered categories alphabetically.
- **Matching & Counting**:
  - `categoryMatches(categoryA, categoryB)`: Performs case-insensitive, whitespace-trimmed comparison.
  - `getItemCount(items, category)`: Calculates real-time faceted item counts for each category.

### Issuer Management & Aliasing (`issuers.js`)

- **18 Default Industry Issuers**:
  `AWS`, `Microsoft`, `Google Cloud`, `Oracle`, `IBM`, `Cisco`, `CompTIA`, `Red Hat`, `Linux Foundation`, `HashiCorp`, `Databricks`, `Snowflake`, `NVIDIA`, `Salesforce`, `Meta`, `Coursera`, `Udemy`, `freeCodeCamp`.

- **Alias Normalization Table**:
  Aliases automatically collapse into canonical issuer names:
  ```javascript
  export const ISSUER_ALIASES = {
    "amazon web services": "AWS",
    amazon: "AWS",
    aws: "AWS",
    "microsoft corporation": "Microsoft",
    "microsoft azure": "Microsoft",
    azure: "Microsoft",
    google: "Google Cloud",
    "google cloud platform": "Google Cloud",
    gcp: "Google Cloud",
    "ibm corporation": "IBM",
    "the linux foundation": "Linux Foundation",
  };
  ```

- **Multi-Faceted AND Filtering**:
  `filterCerts(certs, { category, issuer })` evaluates both constraints simultaneously:
  $$\text{Visible Certs} = \{ c \in \text{Certs} \mid \text{categoryMatches}(c, \text{category}) \land \text{issuerMatches}(c, \text{issuer}) \}$$
  This ensures selecting a category (e.g. `Cloud`) updates issuer counts accordingly, and selecting an issuer (e.g. `Microsoft`) updates category availability without dead ends.
