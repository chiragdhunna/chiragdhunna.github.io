# Resume Setup - Overleaf Integration

This setup automatically syncs your resume from Overleaf to your portfolio website. No manual PDF downloads needed!

## Quick Setup (5 minutes)

### Step 1: Make Your Overleaf Project Public

1. Open your resume project in **Overleaf**
2. Click **Share** (top right)
3. Toggle **Turn on link sharing**
4. Set to **Anyone with this link can view this project**
5. Copy the share link - it looks like: `https://www.overleaf.com/read/abcdefghijkl`
6. Extract the project ID (the part after `/read/`), e.g., `abcdefghijkl`

### Step 2: Add Secret to GitHub

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **New repository secret**
4. Name: `OVERLEAF_PROJECT_ID`
5. Value: Paste your project ID (from Step 1)
6. Click **Add secret**

### Step 3: Done! 🎉

Your resume will automatically sync:

- **Daily at midnight** (automatic)
- **Manually** (go to Actions tab → Sync Resume from Overleaf → Run workflow)

Every time it syncs, the latest PDF from Overleaf is downloaded and committed to `public/CHIRAG_DHUNNA.pdf`.

## Alternative: Direct Overleaf Link (Even Simpler!)

If you want to skip GitHub Actions and load directly from Overleaf:

1. Open `src/components/Resume/ResumeNew.jsx`
2. Find the commented lines:
   ```javascript
   // const OVERLEAF_PROJECT_ID = "YOUR_PROJECT_ID_HERE";
   // const OVERLEAF_PDF = `https://www.overleaf.com/download/project/${OVERLEAF_PROJECT_ID}/build/output.pdf?compileGroup=standard`;
   ```
3. Uncomment and add your project ID
4. Change `const pdf = "/CHIRAG_DHUNNA.pdf";` to `const pdf = OVERLEAF_PDF;`

**Pros:** Always shows latest version, no GitHub Actions needed  
**Cons:** Requires Overleaf to be online, slight delay on first load

## How It Works

```
You edit in Overleaf → GitHub Actions downloads PDF daily →
Your website displays the latest PDF
```

## Troubleshooting

**PDF not updating?**

- Check the **Actions** tab for error logs
- Verify your `OVERLEAF_PROJECT_ID` secret is correct
- Ensure your Overleaf project is set to "Anyone can view"

**Want to trigger sync manually?**

- Go to **Actions** → **Sync Resume from Overleaf** → **Run workflow**

**PDF not found?**

- Make sure you've compiled your resume in Overleaf at least once
- The workflow downloads the most recent compiled PDF
