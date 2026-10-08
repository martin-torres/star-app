# Project Snapshot (Version 2.0)

This file is the current single reference for project status after cleanup + Stage 4 work.

## 1) App State Right Now

- The app is modularized into:
  - Core domain/helpers: `src/core/*`
  - Data contracts: `src/data/contracts/*`
  - PocketBase adapters: `src/data/pocketbase/*`
  - UI feature modules: `src/features/*`
- Build is passing:
  - `npm run build` succeeds.
- Branch baseline:
  - `Version-2.0`

## 2) Database State Right Now

- Local-only DB path:
  - `pocketbase/pb_data/data.db`
- Migration history has been flattened/cleaned.
- Only 3 active migrations remain:
  1. `1771380497_collections_snapshot.js` (clean schema baseline)
  2. `1771381121_stage4_schema_alignment.js` (runtime-schema alignment)
  3. `1771381479_stage4_ui_text.js` (`restaurant_settings.uiText`)

### Main collections in use

- `menu_items`
- `orders`
- `restaurant_settings`
- `users` (auth)

### Important runtime fields

- `orders`:
  - `items`, `status`, `paymentMethod`, `deliveryDistanceKm`, `deliveryFee`
  - `payWithAmount`, `transferScreenshot`
- `restaurant_settings`:
  - visual theme: `primaryColor`, `secondaryColor`, `accentColor`, `backgroundColor`
  - branding/content: `name`, `shortName`, `logoUrl`, `hero*`, `locationText`, `tagline`, `description`
  - behavior: `deliveryRules`, `categories`, `currency`, pins
  - UI text overrides: `uiText` (JSON)

## 3) What Was Upgraded

- Checkout delivery fee now uses `restaurant_settings.deliveryRules` (no fixed in-view fee value).
- Currency formatting in checkout/tracking/analytics uses `restaurant_settings.currency`.
- UI copy can now be DB-configured through `restaurant_settings.uiText` with safe defaults.
- Schema and runtime fields are aligned for orders + settings.
- Local settings seeding script added:
  - `scripts/seed-restaurant-settings.js`
  - script command: `npm run seed:settings`

## 4) What Was Removed In Cleanup

Removed to keep repo lean and avoid stale/conflicting sources:

- Deprecated/backup app trees:
  - `_deprecated/*`
- Old dev artifact folder:
  - `dev-dist/*`
- Old planning/debug docs:
  - `plans/debug-transfer-image-logs.md`
  - `DATABASE_SCHEMA.md`
  - `FRONTEND_BACKEND_INTEGRATION.md`
  - `PHASE_2_BACKEND_INTEGRATION_PLAN.md`
  - `PROJECT_RESUME.md`
- Unused helper/debug scripts:
  - `check-hosted-db.js`
  - `check-images.js`
  - `debug-images.js`
  - `delete-images.js`
  - `migrate-images.js`
  - `populate_menu_items.js`
  - `update-menu-images.js`
  - `update-menu-images-apikey.js`
  - `pocketbase/populate_menu.js`
- Unused/legacy assets/files:
  - `components/DeliveryMap.tsx`
  - `menu_items_import.json`
  - `metadata.json`

## 5) Known Important Operational Notes

- This branch is prepared for local PocketBase-first development.
- Ensure frontend env points local:
  - `.env` / `.env.local` with `VITE_POCKETBASE_URL=http://localhost:8090`
- For a clean local bootstrap:
  1. run PocketBase with the migration directory in this repo
  2. create or upsert a PocketBase superuser
  3. run `npm run seed:settings`

## 6) Minimal Files Needed To Run

Core required sets:

- App source:
  - `App.tsx`, `index.tsx`, `index.html`, `index.css`, `types.ts`
  - `src/**`
  - `lib/pocketbase.ts`
- Tooling/config:
  - `package.json`, `package-lock.json`
  - `vite.config.ts`, `tsconfig*.json`
  - `postcss.config.js`, `tailwind.config.js`
  - `eslint.config.js`
- Public assets:
  - `public/**`
- PocketBase runtime + migrations:
  - `pocketbase/pocketbase`
  - `pocketbase/pb_migrations/**`
  - `pocketbase/pb_data/**` (local runtime DB files)
- Optional but recommended for clean setup:
  - `scripts/seed-restaurant-settings.js`

