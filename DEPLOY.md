# ApexMBA — GitHub + Vercel + Clerk Deployment Guide
## Everything free. Live in ~20 minutes.

---

## What you're deploying

| Layer | Service | Cost |
|-------|---------|------|
| Code hosting | GitHub (free) | $0 |
| Web hosting + CI/CD | Vercel Hobby (free) | $0 |
| Authentication | Clerk (free up to 50k users) | $0 |

**Architecture:** Next.js 16 app with Clerk auth middleware. `/dashboard` is protected — only signed-in users can access it. Notes and progress persist in `localStorage` keyed by your Clerk user ID (works across sessions on the same browser).

---

## STEP 1 — Push to GitHub

### 1a. Create a new GitHub repo
1. Go to https://github.com/new
2. Repository name: `apexmba`
3. Set to **Private** (recommended) or Public
4. **Do NOT** check "Add README" or any initialisation options
5. Click **Create repository**

### 1b. Push your local code
GitHub will show you the commands. Run these in your terminal from the project folder:

```bash
git remote add origin https://github.com/YOUR_USERNAME/apexmba.git
git branch -M main
git push -u origin main
```

✅ Your code is now on GitHub.

---

## STEP 2 — Set up Clerk (authentication)

### 2a. Create a Clerk account
1. Go to https://clerk.com and click **Get started free**
2. Create an account (Google sign-in works)

### 2b. Create a new application
1. Click **Create application**
2. Name it: `ApexMBA`
3. Choose sign-in options:
   - ✅ **Email address** (required)
   - ✅ **Google** (recommended — adds one-click Google login)
   - Others are optional
4. Click **Create application**

### 2c. Get your API keys
After creating the app, you'll land on the API Keys page.
You need two keys:

| Key | Looks like |
|-----|-----------|
| Publishable Key | `pk_test_...` |
| Secret Key | `sk_test_...` |

**Copy both** — you'll need them in Step 3.

---

## STEP 3 — Deploy to Vercel

### 3a. Create a Vercel account
1. Go to https://vercel.com and click **Sign Up**
2. Choose **Continue with GitHub** — this links your repos automatically

### 3b. Import your project
1. On the Vercel dashboard, click **Add New → Project**
2. Find `apexmba` in the GitHub repo list and click **Import**
3. Framework preset will auto-detect as **Next.js** ✅

### 3c. Add environment variables
Before clicking Deploy, expand **Environment Variables** and add:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | `pk_test_...` (from Clerk) |
| `CLERK_SECRET_KEY` | `sk_test_...` (from Clerk) |
| `NEXT_PUBLIC_CLERK_SIGN_IN_URL` | `/sign-in` |
| `NEXT_PUBLIC_CLERK_SIGN_UP_URL` | `/sign-up` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_IN_URL` | `/dashboard` |
| `NEXT_PUBLIC_CLERK_AFTER_SIGN_UP_URL` | `/dashboard` |

### 3d. Deploy
Click **Deploy**. Vercel will:
- Build your Next.js app (~1–2 minutes)
- Assign you a URL like `apexmba-xyz.vercel.app`

✅ Your site is live.

---

## STEP 4 — Configure Clerk with your Vercel URL

### 4a. Add your production URL to Clerk
1. Go back to your Clerk dashboard
2. Click **Domains** in the left sidebar
3. Click **Add domain**
4. Enter your Vercel URL: `apexmba-xyz.vercel.app`
5. Save

### 4b. Switch Clerk to Production (optional but recommended)
By default Clerk runs in development mode. To go production:
1. In Clerk dashboard → **Settings** → **Danger**
2. Click **Switch to Production**
3. You'll get new production API keys — update them in Vercel:
   - Vercel dashboard → your project → **Settings** → **Environment Variables**
   - Update both keys with the new `pk_live_...` and `sk_live_...` values
   - Redeploy (Vercel → **Deployments** → click the three dots → **Redeploy**)

---

## STEP 5 — Test your live site

1. Visit your Vercel URL
2. Click **Get Started Free** → you should see Clerk's sign-up page
3. Create an account
4. You should land on `/dashboard` with your full ApexMBA app
5. Try marking a session complete and writing notes
6. Sign out → sign back in → notes and progress should persist ✅

---

## Custom domain (optional, free with Vercel)

If you already own a domain:
1. Vercel → your project → **Settings** → **Domains**
2. Enter your domain and follow DNS instructions
3. Add the same domain to Clerk's **Domains** list

If you want a free domain: `vercel.app` subdomains are permanent and free.

---

## How auto-deploy works going forward

Every time you push to `main` on GitHub, Vercel automatically:
1. Detects the push
2. Rebuilds your app (~1 min)
3. Deploys the new version

**Your workflow from now on:**
```bash
# make changes to files
git add -A
git commit -m "describe what you changed"
git push
# Vercel deploys automatically
```

---

## Project file structure

```
apexmba/
├── src/
│   ├── app/
│   │   ├── layout.tsx          ← ClerkProvider wraps everything
│   │   ├── page.tsx            ← Public landing page
│   │   ├── dashboard/
│   │   │   └── page.tsx        ← Protected app (requires login)
│   │   ├── sign-in/[[...sign-in]]/
│   │   │   └── page.tsx        ← Clerk sign-in UI
│   │   └── sign-up/[[...sign-up]]/
│   │       └── page.tsx        ← Clerk sign-up UI
│   ├── lib/
│   │   └── data.ts             ← All curriculum data (weeks, hints, prompts)
│   └── middleware.ts           ← Route protection logic
├── .env.local.example          ← Copy this to .env.local for local dev
└── .gitignore                  ← .env.local is excluded from git ✅
```

---

## Local development

```bash
# 1. Copy the env example
cp .env.local.example .env.local

# 2. Fill in your Clerk keys (use the TEST/dev keys from Clerk dashboard)
# Edit .env.local and paste your pk_test_... and sk_test_... keys

# 3. Run locally
npm run dev

# Visit http://localhost:3000
```

---

## Frequently asked questions

**Will my notes survive if I clear localStorage?**
Currently notes are in `localStorage` — clearing browser data will remove them. To add cloud persistence (free), the next step would be adding a Vercel Postgres or Supabase database. Ask when you're ready for that.

**What if I want to share it with friends/colleagues?**
Anyone can create an account on your site — Clerk handles all sign-up flows. You can restrict sign-ups to specific email domains in the Clerk dashboard if you want.

**What's the Clerk free tier limit?**
50,000 monthly retained users as of 2026. More than enough for personal use.

**Can I add a Google login button?**
Yes — it's already configured if you enabled Google in Step 2b. Clerk shows it automatically on the sign-in/sign-up pages.
