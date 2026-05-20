# Cloudflare Worker Setup for CMS

This guide sets up a secure Cloudflare Worker to handle GitHub API calls for the portfolio CMS.

## Why Cloudflare Worker?

- ✅ **Secure**: GitHub PAT stays on the server, never exposed in the browser
- ✅ **Free**: Free tier includes enough for CMS operations
- ✅ **Fast**: Global edge network
- ✅ **Simple**: No complex backend infrastructure

## Setup Instructions

### 1. Create a Cloudflare Account

Go to [https://dash.cloudflare.com](https://dash.cloudflare.com) and sign up if you don't have an account.

### 2. Install Wrangler (Cloudflare CLI)

```bash
npm install -g @cloudflare/wrangler
```

Or use it with npx:

```bash
npx wrangler --version
```

### 3. Authenticate Wrangler

```bash
npx wrangler login
```

This will open a browser to authenticate and grant permission to deploy workers.

### 4. Set Environment Variables

Create a `.env.local` file in the project root (if it doesn't exist) with:

```env
VITE_ADMIN_PASSWORD=TestPassword123!
VITE_GITHUB_PAT=your_github_pat_here
```

### 5. Deploy the Worker

```bash
npx wrangler deploy workers/index.ts
```

This will:
- Create a new worker in Cloudflare
- Deploy to a URL like `portfolio-cms-worker.{your-username}.workers.dev`
- Output the worker URL

### 6. Get Your Worker URL

After deployment, you'll see a message like:
```
Deployed to https://portfolio-cms-worker.{your-username}.workers.dev
```

### 7. Update Worker Configuration

Edit `wrangler.toml` if you want to customize:
- Worker name
- Environment variables
- Routes

### 8. Add Secrets to Cloudflare

Add the admin secret and GitHub PAT to the Cloudflare Worker:

```bash
npx wrangler secret put ADMIN_SECRET
# Enter: TestPassword123!

npx wrangler secret put GITHUB_PAT
# Enter: your_github_pat_here
```

### 9. Update the Worker URL in Code (if needed)

In `src/components/Admin/githubApi.js`, if you deployed to a different URL:

```javascript
const WORKER_URL = "https://your-worker-url.workers.dev";
```

### 10. Test Locally

```bash
npm run dev
```

Visit `/admin` and test:
- Upload a certification image
- Upload a resume
- Check the Network tab to see requests going to the Worker

### 11. Deploy to Production

Merge the changes to master and push:

```bash
git add .
git commit -m "feat: add Cloudflare Worker for secure CMS API calls"
git push origin master
```

## Verification

After deployment:

1. ✅ Check Worker is running: `npx wrangler tail` (shows logs)
2. ✅ Test from live site: https://chiragdhunna.github.io/admin
3. ✅ Try uploading a resume or certification

## Troubleshooting

**Issue**: `401 Unauthorized` when uploading
- **Solution**: Check that `ADMIN_SECRET` and `GITHUB_PAT` are set in Cloudflare secrets

**Issue**: Worker URL returns 404
- **Solution**: Make sure `wrangler.toml` has the correct worker name

**Issue**: CORS errors
- **Solution**: The worker includes CORS headers for `https://chiragdhunna.github.io`

## Monitor Worker

View logs and metrics:

```bash
npx wrangler tail
```

## Update Worker

If you make changes to `workers/index.ts`:

```bash
npx wrangler deploy workers/index.ts
```

## Cost

Cloudflare Workers free tier includes:
- **1 million requests per day** ✅ (More than enough for a portfolio)
- **CPU time**: Included
- **Pricing**: $0.50 per million requests after free tier

Your CMS will likely never exceed the free tier.

## Security

- GitHub PAT is stored as a **secret** in Cloudflare (encrypted at rest)
- JWT is validated on every request
- Worker CORS only allows requests from your portfolio domain
- No credentials are logged or exposed
