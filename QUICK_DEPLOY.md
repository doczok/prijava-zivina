# Quick Deployment Guide

## Option 1: Deploy to Vercel (Easiest - Recommended)

### Step 1: Push to GitHub (Already Done ✅)
Your code is at: https://github.com/doczok/prijava-zivina

### Step 2: Deploy to Vercel
1. Go to https://vercel.com/signup
2. Sign up with GitHub
3. Click "Add New..." → "Project"
4. Import `doczok/prijava-zivina`
5. Click "Deploy" (no configuration needed for now)

### Step 3: Add Database (After first deploy)
1. In your Vercel project dashboard, go to "Storage"
2. Click "Create Database" → "Postgres"
3. Name it `prijava-zivina-db`
4. Click "Create"
5. Vercel will automatically add environment variables

### Step 4: Update Prisma for Postgres
Run these commands locally:
\`\`\`bash
# Update dependencies
npm install @prisma/client@latest

# Update .env (Vercel will provide these)
# POSTGRES_PRISMA_URL=...
# POSTGRES_URL_NON_POOLING=...
\`\`\`

Then update `prisma/schema.prisma`:
\`\`\`prisma
datasource db {
  provider = "postgresql"
  url = env("POSTGRES_PRISMA_URL")
  directUrl = env("POSTGRES_URL_NON_POOLING")
}
\`\`\`

Push changes:
\`\`\`bash
git add .
git commit -m "Switch to PostgreSQL for Vercel"
git push
\`\`\`

Vercel will auto-deploy and create tables!

---

## Option 2: Use Turso (Manual Setup)

### Step 1: Create Turso Account
1. Go to https://turso.tech/
2. Sign up with GitHub
3. Click "Create Database"
4. Name: `prijava-zivina`
5. Region: Choose closest to you

### Step 2: Get Credentials
In Turso dashboard:
1. Click on your database
2. Copy "Database URL"
3. Click "Create Token" → Copy the token

### Step 3: Add to Netlify/Vercel
Add these environment variables:
- `TURSO_DATABASE_URL`: (your database URL)
- `TURSO_AUTH_TOKEN`: (your token)
- `DATABASE_URL`: (same as TURSO_DATABASE_URL)

### Step 4: Deploy
Your app will automatically use Turso in production!

---

## Current Status

✅ Local development works (SQLite)
✅ Code pushed to GitHub
✅ Turso support added (optional)
⏳ Choose deployment platform

## Recommendation

**Use Vercel** - it's the easiest:
- One-click deploy from GitHub
- Built-in PostgreSQL database
- Automatic deployments on git push
- Free tier is generous

Visit: https://vercel.com/new
