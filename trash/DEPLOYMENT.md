# Dulceria de Lalo - Deployment Playbook (V1 Production)

**Project:** Dulceria de Lalo / Dulces Regios DR  
**Frontend:** https://candy-cush.vercel.app  
**Backend:** https://dulceria-pocketbase.fly.dev  
**Status:** ✅ PRODUCTION LIVE  
**Date:** 2026-04-22  

---

## Fastest Path Roadmap (TL;DR)

```
1. Build frontend locally → npm run build
2. Deploy PocketBase to Fly.io
3. Deploy frontend to Vercel
4. Set VITE_POCKETBASE_URL env var
5. Migrate database + storage to Fly.io
6. Test everything
```

---

## What Failed (So You Don't Repeat)

### ❌ Fail #1: Fly.io PocketBase couldn't find database
**Problem:** Volume mounted at `/pb/pb_data` but PocketBase image expects `/pb_data`  
**Error:** `Missing collection context` (404)  
**Fix:** Changed `fly.toml` mount destination from `/pb/pb_data` to `/pb_data`  
**Lesson:** Check the Docker image's expected data directory before setting mount paths

### ❌ Fail #2: Database not persistent on Fly.io
**Problem:** Fresh PocketBase deployment had no collections  
**Error:** All API calls returned 404  
**Fix:** Had to copy local `data.db` and `auxiliary.db` to the Fly.io volume  
**Lesson:** Always migrate existing database to production, don't rely on fresh install

### ❌ Fail #3: Admin authentication failing
**Problem:** Created superuser via SSH but couldn't authenticate via API  
**Error:** `Failed to authenticate`  
**Fix:** The database had different admin credentials than expected - had to check local `_superusers` table and use correct password  
**Lesson:** Always verify admin credentials after database migration

### ❌ Fail #4: Images pointing to localhost
**Problem:** Product images had URLs like `http://127.0.0.1:8090/api/files/...`  
**Error:** Images broken in production  
**Fix:** Updated database records to replace `http://127.0.0.1:8090` with `https://dulceria-pocketbase.fly.dev`  
**Lesson:** Use relative URLs or environment-based URLs in database, never hardcode localhost

### ❌ Fail #5: Fly.io volume mount path mismatch
**Problem:** SFTP uploaded files to `/pb/pb_data` but app was reading from `/pb_data`  
**Error:** Storage files not found  
**Fix:** Cleared old mount, redeployed with corrected path, re-uploaded files  
**Lesson:** Verify mount destination matches app's expectations

### ❌ Fail #6: Vercel deployment with wrong name
**Problem:** `--name` flag deprecated, created project with wrong slug  
**Error:** `dulceria-de-lalo` instead of `candy-cush`  
**Fix:** Deleted `.vercel` folder, re-linked with correct project name  
**Lesson:** Remove `.vercel` before renaming/relinking projects

---

## What Worked (Step-by-Step)

### 1. Local Setup
- ✅ Frontend: React + Vite + Tailwind + TypeScript
- ✅ Backend: PocketBase (SQLite) running locally on port 8090
- ✅ Database populated with products, settings, images
- ✅ All features tested locally first

### 2. Security Hardening
- ✅ Removed hardcoded credentials from source code
- ✅ Added `.gitignore` for `pocketbase/pb_data/`, `.env`, `node_modules/`
- ✅ Changed admin password: `ueFMYCEpwf1fBE22Rd1B`
- ✅ Changed PINs: Kitchen=6744, Admin/Data=2222
- ✅ Removed database from git tracking

### 3. Fly.io PocketBase Deployment
```bash
# Install flyctl
brew install flyctl

# Login (opens browser)
flyctl auth login

# Create app
flyctl apps create dulceria-pocketbase --org personal

# Create persistent volume (1GB)
flyctl volumes create pb_data --size 1 --region iad --app dulceria-pocketbase --yes

# Deploy (CRITICAL: check fly.toml mount path)
flyctl deploy --app dulceria-pocketbase

# Upload database files
# - Zip local storage folder
# - Upload via SFTP to /pb_data/
# - Extract on remote

# Create admin user
flyctl ssh console --app dulceria-pocketbase --command \
  "/usr/local/bin/pocketbase superuser upsert EMAIL PASSWORD"
```

**Key `fly.toml` config:**
```toml
[mounts]
  source = "pb_data"
  destination = "/pb_data"  # NOT /pb/pb_data
```

### 4. Vercel Frontend Deployment
```bash
# Install Vercel CLI
npm i -g vercel

# Login (already done)
vercel whoami

# Deploy (creates new project if needed)
cd project-folder
vercel --prod --yes

# Set environment variable
echo "https://dulceria-pocketbase.fly.dev" | vercel env add VITE_POCKETBASE_URL production --yes

# Redeploy to pick up env var
vercel --prod --yes
```

### 5. Database Migration
```bash
# Upload data.db and auxiliary.db to Fly.io
flyctl ssh sftp shell --app dulceria-pocketbase
# put local/data.db /pb_data/data.db
# put local/auxiliary.db /pb_data/auxiliary.db

# Upload storage files (images)
# Zip local storage folder, upload, extract on remote

# Update image URLs in database
sqlite3 data.db "UPDATE menu_items SET image = REPLACE(image, 'http://127.0.0.1:8090', 'https://dulceria-pocketbase.fly.dev') WHERE image LIKE 'http://127.0.0.1:8090%'"
```

### 6. Branding Updates
- ✅ Generated PNG icons from logo: 192x192, 512x512, favicon
- ✅ Updated `index.html` with new app name and icon references
- ✅ Updated `manifest.json` with Candy Crush theme colors
- ✅ Created QR code with embedded logo

---

## Final URLs

| Service | URL |
|---------|-----|
| **Frontend** | https://candy-cush.vercel.app |
| **Backend** | https://dulceria-pocketbase.fly.dev |
| **Admin Panel** | https://dulceria-pocketbase.fly.dev/_/ |
| **QR Code** | /public/qr-code.png |

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐
│   Vercel        │      │   Fly.io         │
│   (Frontend)    │◄────►│   (PocketBase)   │
│   Static SPA    │      │   SQLite + Files │
│   candy-cush    │      │   dulceria-pb    │
└─────────────────┘      └──────────────────┘
        │                         │
        ▼                         ▼
   PWA installable           Persistent volume
   Service worker            1GB storage
```

---

## Environment Variables

| Variable | Value | Where |
|----------|-------|-------|
| `VITE_POCKETBASE_URL` | `https://dulceria-pocketbase.fly.dev` | Vercel |

---

## Costs

| Service | Monthly Cost |
|---------|-------------|
| Vercel (Hobby) | FREE |
| Fly.io (shared-cpu-1x + 1GB volume) | ~$2-5 |
| **Total** | **~$2-5/month** |

---

## Credentials (Production)

| Service | Username | Password/PIN |
|---------|----------|--------------|
| PocketBase Admin | admin@elarrocito.com | ueFMYCEpwf1fBE22Rd1B |
| Kitchen View | - | 6744 |
| Data/Analytics | - | 2222 |

---

## Quick Commands

```bash
# Redeploy frontend
vercel --prod --yes

# Restart backend
flyctl apps restart dulceria-pocketbase

# View backend logs
flyctl logs --app dulceria-pocketbase --no-tail

# SSH into backend
flyctl ssh console --app dulceria-pocketbase

# Backup database
flyctl ssh sftp shell --app dulceria-pocketbase
# get /pb_data/data.db ./backup-$(date +%Y%m%d).db
```

---

## Lessons Learned

1. **Always verify mount paths** - Docker images may expect different data directories
2. **Migrate database before testing** - Fresh installs have no collections
3. **Check image URLs** - Never leave localhost references in production DB
4. **Upload storage files** - Product images must be on production server
5. **Set env vars before testing** - Frontend won't connect without VITE_POCKETBASE_URL
6. **Delete .vercel to rename** - Cached project links prevent name changes

---

## Files Added/Modified for Production

| File | Purpose |
|------|---------|
| `fly.toml` | Fly.io deployment config |
| `Dockerfile` | PocketBase container image |
| `.env.production` | Production environment variables |
| `.gitignore` | Exclude sensitive/local files from git |
| `public/qr-code.png` | QR code for app access |
| `generate-qr.py` | QR code generation script |
| `public/logo-source.png` | App logo (generated icons from this) |
| `public/favicon.png` | 32x32 browser tab icon |
| `public/pwa-192x192.png` | PWA/mobile icon |
| `public/pwa-512x512.png` | High-res PWA icon |

---

## Verification Checklist

- [x] Frontend loads without errors
- [x] Backend API responds (health check)
- [x] Menu items load from database
- [x] Product images display correctly
- [x] Kitchen view accessible with PIN
- [x] Admin view accessible with PIN
- [x] QR code scans and opens app
- [x] App name shows correctly in browser tab
- [x] PWA manifest configured
- [x] All branding updated (no "El Arrocito" references)

---

**This project is DONE and LIVE in production.**
