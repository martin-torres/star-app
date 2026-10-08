# star-app — Dead-Code Cleanup Proposal & PocketBase Migration Plan

Generated from a real module-graph audit (import resolution from `index.tsx` through every
reachable file) plus direct reads of the data layer. Nothing has been deleted or changed.
`src/` + `lib/` + `App.tsx` = **12,832 lines**; the dead weight below is a large share of it.

---

## 1. Module graph audit

| Metric | Value |
|---|---|
| Source files scanned | 171 |
| Reachable from `index.tsx` | 101 |
| **Unreachable** | **70** |
| Unresolvable relative imports (live bugs) | 3 |

---

## 2. Delete — proven unused (no import path from any entry point)

### 2.1 `src/features/admin/**` — 12 files, 2,434 lines
Every file is reachable in the graph *only* through `src/features/appViews.tsx:7`
(`export { AdminModule } from './admin'`), and **`AdminModule` is never rendered**. `App.tsx:22`
imports it; the render tree never uses it — `admin` mode renders `KitchenView`, `dashboard`
renders `ManagerHubPage`, `data` renders `DataView`.

Contains `adminApi.ts`, `components/AdminLayout.tsx`, `components/ErrorBoundary.tsx` (itself
broken: 8 × `this.state`/`this.setState`/`this.props` do not exist on the class), and
`pages/{Dashboard,Inventory,Menu,Orders,Promotions,Settings,Tables}Page.tsx` — all superseded by
the manager-hub modules. Risk if deleted: **none**; nothing mounts it.

### 2.2 `src/data/pocketbase/**` — 8 files, 530 lines
Not PocketBase code. `client.ts` does `import { createClient } from '@insforge/sdk'` and every
repo calls `insforge.database.from(...)`. It is the InsForge layer with "PocketBase" names —
the most dangerous kind of dead code, because it *looks* like the fallback you'd reach for.
Risk: none (superseded by the new layer).

### 2.3 Three competing migration systems — 69 files
| Path | Files | Verdict |
|---|---|---|
| `pb_migrations/` (repo root) | 34 | delete — abandoned, includes created/deleted pairs and `test_collection`/`test_select_*` |
| `pocketbase/pb_migrations/` | 23 | delete — older set, camelCase schema that no longer matches code |
| `pocketbase/pb_migrations_deprecated/` | 5 | delete — the name says it |
| `migrations/` (SQL) | 7 | delete — InsForge/Postgres-era SQL, dead backend |

### 2.4 Four competing schema sources of truth
`pocketbase-schema.json`, `schema.sql`, `_tmp_base_schema.sql`,
`specs/004-manager-control-hub-integration/star-app-migration.sql`.
The last one only creates 4 tables (`app_modules`, `bill_requests`, `dining_sessions`,
`menu_categories`) — it was written to *extend* the dead InsForge schema, and contains no
`station`/`kitchen_status`/`bar_status`/`foh_request_status`, so it cannot express spec 005.
Verdict: **delete all four**, replace with the generated schema in §6.

### 2.5 Unreachable source modules (47 files, ~1,200 lines)
- `src/features/payments/**` — 6 files, 393 lines. `codi.ts`, `conekta.ts`, `mercadopago.ts`,
  `transfer.ts`, `types.ts`, `index.ts`. Never imported. Note `mercadopago.ts:19` is the syntax
  error masquerading as the whole program's type check — deleting it also unmasks ~1,350 real
  type errors, which is a feature. The UI still offers conekta/MercadoPago/CoDi payment options
  that therefore **cannot work**.
- `src/features/promotions/**` — 3 files, 159 lines (`engine.ts`, `types.ts`, `index.ts`).
- `src/features/manager-hub/floor-editor/ui/{LeftToolPanel,ChairEditorOverlay}.tsx` — the toolbar
  is inlined in `ModuleHost.tsx`; chairs are handled inside `FloorCanvas.tsx`.
- 5 barrel `index.ts` files under `floor-editor/` + `imports/` that nothing imports.
- `src/features/manager-hub/floor-editor/state/unsavedChanges.ts`.
- `src/features/manager-hub/floorplan/services/tableStatusSync.ts` — 19 lines, the pub/sub
  scaffold for the colour coding, never subscribed by anything. **Keep the file, but it is
  currently inert** — this is the seam spec 005 has to fill.
- `src/core/orders.ts` + `src/core/index.ts` — 20 lines, unused.
- `src/hooks/useTheme.ts` — 115 lines, unused (App.tsx sets CSS vars inline).

### 2.6 Assets
| Path | Files | Verdict | Why |
|---|---|---|---|
| `Images/` (repo root) | 30 | **delete** | Old cannabis-branding set (gomitas, rosin, THC gummies, strain, preroll). Matches **no** live restaurant — the live assets are `public/restaurants/azucar-y-nuez/`. Unmatched, unauthorised for the current brand, and 143 MB of repo |
| `dev-dist/` | 3 | delete | vite-plugin-pwa dev output; already gitignored |
| `dist/manifest.webmanifest`, `dist/registerSW.js`, `dist/workbox-78ef5c9b.js` | 3 | delete (tracked) | Build output committed before `dist/` was added to `.gitignore`. The file contradicts the project's own ignore rule, so it silently drifts |
| `public/sw.js` | 1 | delete | Hand-written service worker; `vite-plugin-pwa` generates its own (`sw.js` in build output). `index.html:46` registers the hand-written one, so the PWA may serve a worker that never matches the build |

### 2.7 Scripts and docs
- `scripts/*.js` — 11 files (`setup-collections.js`, `seed-*.js`, `verify-*.js`,
  `fix-collections.js`, `migrate-weight-fields.js`). All InsForge-era; all point at the dead
  backend. Also referenced by `package.json` scripts, so those need updating too.
- Stale docs: `PROJECT_SNAPSHOT.md` (describes PocketBase v2.0 with 3 migrations that don't
  exist), `README.md` (PocketBase run instructions), `specs/004-.../plan.md` (unfilled speckit
  template), `specs/004-.../tasks.md` (every box unchecked although the git log says the work
  landed), `ProjectV3Cont`, `RESTAURANT_SETUP.md`, `DEPLOYMENT.md`.

---

## 3. Fix — do not delete (3 live bugs)

| File | Broken import | Correct |
|---|---|---|
| `lib/telegram.ts:2` | `'../../types'` | `'../types'` |
| `src/hooks/useVisitorTracking.ts:2` | `'../../core/types'` | `'../core/types'` |
| `src/features/customer/components/OptionSelector.tsx:1` | `'../../core/types'` | `'../../../core/types'` |

These resolve *above* the repo root, so they can never work. They are the remainder of the
"import path fixes" work in the git log.

---

## 4. Keep

`src/features/{customer,dinein,kitchen,analytics,locks,shared}`, `src/features/manager-hub/{shell,floor-editor/domain,floor-editor/state,floor-editor/ui/FloorCanvas,floorplan,menu,pricing,promotions,imports}`,
`src/core/{types,pricing,uiSettings}`, `src/data/contracts/`, `src/hooks/*` (minus `useTheme`),
`lib/{visitorService,pocketbase}` (path bug fixed), `public/restaurants/`, `specs/005-*`.

---

## 5. PocketBase instance (server side — awaiting approval)

The VPS `179.198.215.199` already runs **three** PocketBase instances — `:8090` "restaurant
ordering backend" (13 collections, 89 menu items, the old patched DB),`:8092` clients,
`:8094` tus-colitas. **None are touched.** The new instance is isolated:

| Item | Value |
|---|---|
| Directory | `/opt/star-pocketbase` (own `pb_data`, own `pb_migrations`) |
| Port | `127.0.0.1:8096` (verified free) |
| Service | `star-pocketbase.service` (systemd, `Restart=always`) |
| Binary | copy of PocketBase 0.40.4 from `/opt/pocketbase/pocketbase` |
| DNS | `star-api.uorder.tech` → `179.198.215.199` (to add; existing cert covers `app/crm/demo/global/jarvis/uorder.tech` only, so a new certbot cert is required) |
| Credentials | generated on the server, stored `/root/star-pb-credentials.txt` (600) and copied to `~/.hermes/secrets/star-pocketbase.key` — never printed |

---

## 6. Schema — derived from code, not from any old DB

Field names mirror what the **current code already reads and writes** (snake_case, matching
`src/data/insforge/mappers.ts`), so the existing mappers can be reused unchanged when the
PocketBase layer is written. 16 live collections; `tables`, `restaurant_configs` and the
`*_translations` trio appear **only** in dead files (§2.2) and are deliberately excluded.

| Collection | Columns (from code) |
|---|---|
| `restaurants` | name, slug, address, phone, primary_color, secondary_color, accent_color, background_color, logo_url, hero_image_url, hero_text, tagline, description, currency, mode, google_font_url, google_font_name |
| `restaurant_settings` | restaurant_id (rel), data (json) — the extra-settings blob the settings-repo reads |
| `menu_items` | restaurant_id, name, description, price, image_url, category, is_weight_based, weight_price_per_kg, weight_in_grams, options(json), strain, is_available, stock, track_inventory, **station** (spec 005) |
| `promos` | restaurant_id, name, description, price, image_url, category, active, bundle_items(json), discount_type, discount_value, original_price, type, offer_type, offer_value, item_id, target_date, target_weekday, conditions(json), action(json), code |
| `orders` | restaurant_id, table_id, customer_name, customer_address, items(json), total, subtotal, tax, delivery_fee, status, payment_method, pay_with_amount, transfer_screenshot, delivery_distance_km, order_type, notes, session_id, timestamp, status_timestamps(json), **kitchen_status**, **bar_status**, **foh_request_status** (spec 005) |
| `restaurant_tables` | restaurant_id, table_number, display_name, seats, location, qr_code_url, x, y, is_available (+ width, height, rotation, shape for the floor editor) |
| `dining_sessions` | restaurant_id, table_id, customer_name, customer_phone, status, order_ids(json), session_start, session_end |
| `bill_requests` | restaurant_id, table_id, order_ids(json), subtotal, tax, tip, total, status, payments(json), requested_at |
| `visitors` | restaurant_id, sessionId, ip, userAgent, deviceType, isPwaInstalled, first_visit, last_visit, visit_count, associated_orders(json) — note the code uses **camelCase** for sessionId/userAgent/deviceType/isPwaInstalled and snake_case for the rest |
| `floor_plans` | restaurant_id, canvas_w, canvas_h, grid_size |
| `floor_props` | restaurant_id, floor_plan_id(rel), prop_type, x, y, width, height, rotation |
| `import_jobs` | restaurant_id, kind, status, summary(json), errors(json), file_name |
| `staff` | restaurant_id, name, role, pin, is_active |
| `staff_shifts` | staff_id(rel), restaurant_id, clock_in, clock_out, tables_served, total_tips, total_sales |
| `app_modules` | restaurant_id, slug, enabled, settings(json) |
| `images` | file (file field) — replaces InsForge storage for `uploadFile()` |

Indexes justified by real query patterns: `menu_items(restaurant_id, category)`;
`orders(restaurant_id, timestamp DESC)`, `orders(status)`; `promos(restaurant_id, active)`;
`restaurant_tables(restaurant_id, table_number)`; `visitors(sessionId)`; `floor_props(restaurant_id, floor_plan_id)`;
`import_jobs(restaurant_id, created_at DESC)`; `staff(restaurant_id)`; `app_modules(restaurant_id, slug)` unique.

API rules: list/view open to anon for `menu_items`, `promos`, `restaurants`,
`restaurant_settings`, `restaurant_tables`, `floor_plans`, `floor_props` (customer menu, dine-in
table selection, floor plan rendering); create open for `orders`, `visitors`, `bill_requests`,
`dining_sessions` (customer flow); everything else `null` (manager-only via superuser). Note the
old instance had `listRule: ""` on `orders` and `visitors` — anon could read **all** orders; do
not copy that.

---

## 7. Also carried into the new build

- `menu_items.station` + `orders.{kitchen_status,bar_status,foh_request_status}` — required by
  spec 005, present in **no** existing schema file.
- `orders.status` must accept `paid` and `cancelled`; the app's own status maps
  (`src/core/orders.ts`, `admin/pages/OrdersPage.tsx`) omit both.
