# Deployment Guide

## Turso Database Setup (Recommended for Netlify/Vercel)

### 1. Install Turso CLI
```bash
# Windows (PowerShell)
irm get.tur.so/install.ps1 | iex

# Or visit: https://docs.turso.tech/cli/installation
```

### 2. Sign up and create database
```bash
turso auth signup
turso db create prijava-zivina
```

### 3. Get database URL and auth token
```bash
turso db show prijava-zivina --url
turso db tokens create prijava-zivina
```

### 4. Push schema to Turso
```bash
# Update .env with Turso credentials
echo "TURSO_DATABASE_URL=your-database-url" >> .env
echo "TURSO_AUTH_TOKEN=your-auth-token" >> .env

# Push schema
npx prisma db push
```

### 5. Deploy to Netlify

1. Go to [Netlify](https://app.netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your GitHub repository: `doczok/prijava-zivina`
4. Configure build settings:
   - **Build command**: `npm run build`
   - **Publish directory**: `.next`
   - **Functions directory**: Leave empty (Next.js handles this)

5. Add environment variables in Netlify:
   - `TURSO_DATABASE_URL`: Your Turso database URL
   - `TURSO_AUTH_TOKEN`: Your Turso auth token
   - `DATABASE_URL`: Your Turso database URL (same as above)

6. Click "Deploy site"

### 6. Alternative: Deploy to Vercel (Easier)

1. Go to [Vercel](https://vercel.com)
2. Click "Import Project"
3. Import `doczok/prijava-zivina` from GitHub
4. Add environment variables:
   - `TURSO_DATABASE_URL`
   - `TURSO_AUTH_TOKEN`
   - `DATABASE_URL`
5. Click "Deploy"

## Local Development

Your app works with local SQLite by default. Just run:
```bash
npm run dev
```

The database file is stored in `db/custom.db`

## Production Database Management

Access your Turso database shell:
```bash
turso db shell prijava-zivina
```

View all claims:
```sql
SELECT * FROM Claim;
```

## Troubleshooting

- **Build fails**: Make sure all environment variables are set
- **Database errors**: Verify Turso credentials are correct
- **No data appearing**: Check that `npx prisma db push` was run with Turso credentials
