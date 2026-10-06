# Star-App — Data Layer & PocketBase Schema Audit

**Reviewer:** database-reviewer (Postgres/Supabase best-practices rubric, adapted for PocketBase 0.40 / SQLite)
**Date:** 2026-10-05
**Scope:** read-only audit of `src/data/**`, `src/features/manager-hub/**/data/**`, `lib/**`, and the generated PocketBase schema at `db/pocketbase/schema.py` + `db/pocketbase/pb_migrations/1770000001_star_app_schema.js`.
**Constraint:** no database reachable — every finding below is read from source and from PocketBase's own generated `pocketbase/pb_data/types.d.ts`, not from a live server.

---

## 0. TL;DR — severity-ranked findings

| # | Sev | Finding | Evidence |
|---|-----|---------|----------|
| 1 | **BLOCKER** | There is **no PocketBase client in the app**. Every "PocketBase" file imports `@insforge/sdk`; `package.json` has no `pocketbase` dependency. The whole data layer talks to the dead InsForge Postgres, so the new PocketBase backend is unreachable regardless of schema quality. | `src/data/pocketbase/client.ts:1`, `src/data/insforge/client.ts:1`, `package.json:15` |
| 2 | **BLOCKER** | API rules make the schema **unusable by this app**. `orders`, `dining_sessions`, `bill_requests`, `visitors` have `listRule/viewRule: null` (superuser-only) but the app is anonymous. It can create an order and then can never read, list, or advance it. | migration `listRule/viewRule: null`; `adminApi.ts:69`, `orders-repo.ts:79` |
| 3 | **BLOCKER** | `restaurant_id` is optional/absent in every read path, so unscoped queries return **all tenants' rows**. Public list rules (`""`) mean any anon user can enumerate every restaurant. | `orders-repo.ts:82`, `menu-repo.ts:9`, `adminApi.ts:26`, schema rules `""` |
| 4 | **HIGH** | `noDecimal: true` is not a PocketBase option — the real key is `onlyInt` (per `types.d.ts:11018`). Every integer-intent field silently accepts decimals. | `schema.py:329`, migration `"noDecimal": true` |
| 5 | **HIGH** | Table-name drift: `restaurant_configs` (settings), `tables` (tables) do not exist in the schema (`restaurant_settings`, `restaurant_tables`). Those queries 404/error. | `pocketbase/settings-repo.ts:8`, `pocketbase/tables-repo.ts:8`, `adminApi.ts:149` |
| 6 | **HIGH** | Schema is missing columns the app writes: `menu_items.slug/active/currency/effective_from`, `promos.starts_at/ends_at`, `floor_props.label`, `staff_shifts.notes`, `import_jobs.file_url` → inserts/updates reject unknown fields. | manager-hub repos, `insforge/promos-repo.ts` |
| 7 | **HIGH** | Missing collections: `menu_item_translations`, `category_translations`, `ui_translations`, and any auth collection (`users`). Translation resolver and admin auth both degrade/fail. | `translation-resolver.ts:38/57/76`, `adminApi.ts:11` |
| 8 | **HIGH** | Realtime is broken: `insforge.realtime.connect()` returns a Promise; the code calls `.subscribe()` on the Promise. Both orders repos. | `insforge/orders-repo.ts:107`, `pocketbase/orders-repo.ts:126` |
| 9 | **MED** | `orders.items` is declared `required: True` in the spec but the emitter **pops `required` for every json field** — orders can be created with no items. | `schema.py:332-334`; migration orders `items` has no `required` |
| 10 | **MED** | N+1 + race in stock deduction: read-then-write per item, no transaction, concurrent orders oversell/undersell. | `orders-repo.ts:42-67` |
| 11 | **MED** | Mapper drift in the renamed copy: reads `record.image`/`record.sold_out` (columns don't exist) instead of `image_url`/`is_available`. | `pocketbase/mappers.ts:43,48` |
| 12 | **MED** | Two competing PocketBase schemas in the repo: the live `pocketbase/pb_migrations/` (camelCase `orders`, top-level `restaurant_settings`) vs the new `db/pocketbase/` (snake_case, 16 collections). The deploy script ships the latter; the app data was written for the former. | `pocketbase/pb_migrations/1776459528_updated_orders.js` vs `db/pocketbase/schema.py` |

---

## 1. Architecture reality: three "data layers", none of them PocketBase

The repo contains three overlapping data layers and **zero** actual PocketBase SDK usage:

1. **`lib/pocketbase.ts`** (the file `App.tsx:3` actually imports) — despite the name it re-exports `src/data/insforge/` and calls `insforge.database.from(...)`. Its own header says "bridges App.tsx to the InsForge repository layer … queries the 2y542jyv schema via @insforge/sdk."
2. **`src/data/insforge/*`** — InsForge repos + mappers + translation resolver. This is the canonical layer for `lib/pocketbase.ts` and the manager-hub feature repos.
3. **`src/data/pocketbase/*`** — a partial copy of (2) with the classes/strings renamed. Only **4** of 11 repos were copied (menu, orders, settings, tables); dine-in, floor-plan, floor-props, promos, staff, imports, app-modules were never ported. It is only imported in two places: `features/admin/adminApi.ts:1` and `hooks` → `translation-resolver.ts`. The `pocketbase/index.ts` barrel exports repositories that nothing imports.

`package.json` dependencies: `@insforge/sdk ^1.2.7` only. No `pocketbase` package. `src/data/pocketbase/client.ts` is a byte-for-byte InsForge `createClient` with only the default `baseUrl` changed (`http://localhost:8090`). PocketBase's own default port is also 8090, which masks the error at runtime: requests "go somewhere," but the InsForge REST dialect is not PocketBase's.

**Consequence:** finding #1 has to be fixed before any schema work matters. The migration in `db/pocketbase/deploy.sh` builds a correct *backend*; nothing in the frontend can speak to it.

---

## 2. Data-layer correctness audit

### 2.1 Queries that cannot work against PocketBase

Every repo is written against the **PostgREST/InsForge query builder**. PocketBase's JS SDK uses `pb.collection('x').getFullList({ filter, sort })`. None of the following constructs exist in PocketBase, so they are broken the moment the client is swapped (and are currently only "working" against InsForge):

| Construct | Example | PocketBase equivalent |
|-----------|---------|----------------------|
| `.eq('col', v)` chaining | `adminApi.ts:27`, everywhere | filter string `col='v'` |
| `.order('col', { ascending })` | `orders-repo.ts:80`, `adminApi.ts:70` | `sort: '-col'` |
| `.single()` / `.maybeSingle()` | `orders-repo.ts:34/74`, `floor-plan-repo.ts:20` | `getOne(id)` / `getFirstListItem` |
| `.limit(1)` | `pocketbase/settings-repo.ts:10` | `getList(1, 1)` |
| `.not('status','in','(...)')` | `orders-repo.ts:92` | `status != 'entregado' && status != 'paid' && …` |
| `.in('status', '("a","b")')` — a **string** where an array is required | `insforge/dinein-repo.ts:15` | array or filter string |
| `.upsert([...])` | `manager-hub/imports/data/importsRepo.ts:59` | no such method chained |
| `.insert([x]).select().single()` | all inserts | `create(x)` |
| `insforge.realtime.connect().subscribe(...)` | `orders-repo.ts:107/126` | `pb.collection('orders').subscribe('*', cb)` |

There is **no** partial migration: `src/data/insforge` and `src/data/pocketbase` both use the InsForge dialect. A PocketBase port is a rewrite of the query method, not a find/replace.

### 2.2 Table-name drift (query target vs schema)

| Query target | Where | Schema collection | Result |
|---|---|---|---|
| `restaurant_configs` | `pocketbase/settings-repo.ts:8,23,31,43` | `restaurant_settings` | **404 — settings never load/save** |
| `tables` | `pocketbase/tables-repo.ts:8,18,29,39,49,59`, `adminApi.ts:149,159,169,179` | `restaurant_tables` | **404 — table CRUD dead** |
| `restaurant_settings` (top-level columns) | `adminApi.ts:91`, `hooks/useUnlockState.ts:31,36` | `restaurant_settings` has only `restaurant_id`+`data` | unknown-field errors (see §4.3) |
| `menu_item_translations`, `category_translations`, `ui_translations` | `translation-resolver.ts:38,57,76` | **not in schema** | swallowed by `catch{}` → all non-ES text silently missing |
| `restaurants` | `lib/pocketbase.ts:113`, `insforge/settings-repo.ts:13` | `restaurants` | ✅ present |

Note the split-brain: `src/data/insforge/tables-repo.ts:9` correctly queries `restaurant_tables`, but its renamed twin `src/data/pocketbase/tables-repo.ts:8` queries `tables`, and `adminApi.ts` (the live admin path) queries `tables`. The correct spelling exists in the repo and was not used.

### 2.3 Mapper drift

- `insforge/mappers.ts` is the **good** mapper: `image ← image_url` (`:65`), `soldOut ← !is_available` (`:72`), `weightInGrams` (`:68`). It lines up with the generated schema.
- `pocketbase/mappers.ts` is the **stale copy**: `image: asString(record.image)` (`:43`) reads a column that does not exist (schema is `image_url`), and `soldOut: asBoolean(record.sold_out)` (`:48`) reads a non-existent column (there is no `sold_out`; it's `is_available`). Result: no images, everything shows in-stock.
- Neither mapper reads `record.created`/`record.updated` (PocketBase conventions) — the insforge mapper uses `record.timestamp` (epoch number) which matches the generated schema, not the live local PocketBase schema (`orders.timestamp` exists in both, so OK).

### 2.4 Dead / unused code that hides drift

- `adminApi.ts:25` `restaurantEq` is defined and never used (the real helper is `withRestaurant`, `:26`).
- `pocketbase/index.ts` constructs 4 repositories nothing imports — so its wrong table names never fire, which is why the drift went unnoticed.
- `mappers.ts` `toAppSkinSettings` is used only by `insforge/settings-repo.ts`.

---

## 3. Multi-tenant `restaurant_id` leaks

### 3.1 In the data layer (tenant filter is optional)

The tenant id comes from the URL query param `restaurant_id` (`App.tsx:42`, `useUrlMode.ts:31`) and is passed as `restaurantId || undefined` (`App.tsx:102,120,150,182,198`). Every read helper guards with `if (restaurantId)`, so when the param is missing the query is **unscoped**:

- `orders-repo.ts:82` (`getAll`), `:94` (`getActive`) — no tenant filter → all tenants' orders.
- `menu-repo.ts:9` (`getAll`), `:17` (`getByCategory`) — all tenants' menu.
- `pocketbase/settings-repo.ts:9-10` — `.limit(1)` with no tenant filter returns the **first row of any tenant**.
- `adminApi.ts:26-29` `withRestaurant` — when `currentRestaurantId` is null the admin API lists every tenant's menu/orders/promos/tables.
- `orders-repo.ts:12` `create` writes `restaurant_id: orderData.restaurant_id || null` → an order can be created with **no tenant** (schema does not require it, §4.1).

### 3.2 In the schema (rules don't scope by tenant)

PocketBase rules can express tenant scoping (`restaurant_id = @request.query.r`) but this schema never does. `listRule:""`/`viewRule:""` on `restaurants`, `menu_items`, `promos`, `restaurant_tables`, `floor_plans`, `floor_props`, `app_modules`, `restaurant_settings`, `images` = **anyone (unauthenticated) can read every row of every tenant**. Combined with §3.1 this is a full cross-tenant read.

### 3.3 In the schema (open create)

`createRule:""` on `orders`, `dining_sessions`, `bill_requests`, `visitors`, `images` lets any anon client POST a row with an arbitrary `restaurant_id` (and arbitrary totals/status). `dining_sessions`/`bill_requests`/`visitors` also have `updateRule:""` → anyone can flip a bill to `paid` or mutate a lead.

---

## 4. Generated PocketBase schema critique

`schema.py` emits 16 collections; the migration is byte-consistent with it (`1770000001_star_app_schema.js`, 2807 lines, 16 `app.save` blocks, reverse-order `app.delete` down-migration). Structural quality is otherwise good: primary ids use the PocketBase `[a-z0-9]{15}` pattern, `autodate` create/update pairs are correct, and the field JSON mostly matches the live PocketBase format (verified against `pocketbase/pb_data/types.d.ts`).

### 4.1 API rules — the schema's central defect

PocketBase semantics (confirmed against the docs + `types.d.ts`): `null` = **superusers only**; `""` = **anyone, including guests**.

| Collection | listRule | viewRule | createRule | updateRule | Verdict |
|---|---|---|---|---|---|
| restaurants | `""` | `""` | null | null | public read, no tenant scope |
| restaurant_settings | `""` | `""` | null | null | public read; but app can never write |
| menu_items | `""` | `""` | null | null | public read; admin write locked |
| promos | `""` | `""` | null | null | public read; admin write locked |
| **orders** | **null** | **null** | `""` | **null** | **create-only: app can order but never read/update** |
| restaurant_tables | `""` | `""` | null | null | public read; admin write locked |
| **dining_sessions** | **null** | **null** | `""` | `""` | app can write but **cannot list/view** |
| **bill_requests** | **null** | **null** | `""` | `""` | app can write but **cannot list/view** |
| **visitors** | **null** | **null** | `""` | `""` | app upsert reads first → **fails every time** |
| floor_plans / floor_props | `""` | `""` | null | null | public read; admin write locked |
| import_jobs | null | null | null | null | **only superusers — manager-hub imports dead** |
| staff / staff_shifts | null | null | null | null | **only superusers — staff dead** |
| app_modules | `""` | `""` | null | null | public read |
| images | `""` | `""` | `""` | null | anyone can upload |

Two independent failures:
- **Read-locked collections the app reads anonymously:** `orders` (kitchen/admin list, `App.tsx:150/182`), `dining_sessions` (`dinein-repo.ts:10`), `bill_requests` (`dinein-repo.ts:80`), `visitors` (`visitorService.ts:6`), `import_jobs`, `staff`, `staff_shifts`. Every one returns 403 or an empty set.
- **Write-locked collections the app writes anonymously:** `menu_items`, `promos`, `restaurant_tables`, `restaurant_settings`, `floor_plans`, `floor_props`, `restaurants` (update/delete `null`) → the whole manager-hub and admin-API write path fails.

The schema comment on `orders` says read is deliberately locked "the old instance exposed every order to the anon key, which we deliberately do not repeat." That is a defensible instinct, but it was implemented against a **superuser** notion of "locked," while the app has **no auth against PocketBase at all** (§1). The correct fix is an auth collection + tenant-scoped rules, not `null`.

### 4.2 Wrong field types / invalid field options

- **`noDecimal` is not a PocketBase option.** The installed binary's `types.d.ts:11018` exposes `onlyInt: boolean`; there is no `noDecimal`. The emitter writes `{"max":null,"min":null,"noDecimal":true}` (`schema.py:329`, e.g. migration `weight_in_grams`). Effect: `onlyInt` defaults to `false`, so `weight_in_grams`, `stock`, `table_number`, `seats`, `x/y/width/height/rotation`, `timestamp`, `session_start/end`, `visit_count`, `target_weekday`, `requested_at`, `tables_served` all accept decimals. The `true` key is inert.
- **`orders.items` `required` intent dropped.** `schema.py:119` declares `items` required, but `make_field` pops `required` for every `json` field (`schema.py:332-334`). The generated `orders.items` field has no `required`, so an order with no items is accepted. (JSON in PocketBase is nullable by default; the spec clearly intended otherwise.)
- **`select` value drift.** `promos.discount_type` values are `["fixed","percent","bundle"]`, but `insforge/promos-repo.ts` types it as `'percentage' | 'fixed' | 'bundle'`. Writing `'percentage'` is rejected by a PocketBase select. `promos.type` (`promotion|event`), `orders.order_type` (`pickup|delivery|dine-in`), `dining_sessions.status`, `staff.role`, `import_jobs.kind/status`, `restaurants.mode` all match their TS unions — good.
- **Timestamps use two incompatible systems.** `orders.timestamp` is an epoch-ms `number` (JS `Date.now()`, `orders-repo.ts:26`), while `orders.created_at` is a PocketBase `autodate` string. Sorting by the number works; any PocketBase-UI date filtering will key off `created_at`. Not wrong, just a foot-gun; worth a comment on the field.
- **`visitors.first_visit`/`last_visit` are `text`** holding ISO strings (`visitorService.ts:18,30`). Queryable as text, but a `date` field would sort/range correctly and match PocketBase semantics. Low priority.
- **`restaurant_id` is `text` everywhere, never a PocketBase `relation`.** No referential integrity, no cascade delete, no `@request.auth`-joinable relation. Cross-tenant rows with a dangling `restaurant_id` are trivially creatable.

### 4.3 Schema missing columns the app actually writes

| Collection | Missing field | Written by |
|---|---|---|
| `menu_items` | `slug`, `active`, `currency`, `effective_from` | `manager-hub/menu/data/menuRepo.ts:87,92,106,117`; `manager-hub/pricing/data/pricingRepo.ts:44,58,74` |
| `promos` | `starts_at`, `ends_at` | `insforge/promos-repo.ts:14-15,23-24` (insert spreads `input`) |
| `floor_props` | `label` | `insforge/floor-props-repo.ts:8,44` |
| `staff_shifts` | `notes` | `insforge/staff-repo.ts:23` (patch spreads `patch`) |
| `import_jobs` | `file_url` | `insforge/imports-repo.ts:14,26` |
| `restaurant_settings` | `disclaimer_accepted`, `disclaimer_accepted_by`, `disclaimer_accepted_at` | `hooks/useUnlockState.ts:38-40` (top-level, not inside `data`) |

PocketBase rejects unknown fields on create/update (400), so these are hard failures, not silent no-ops. The manager-hub menu/pricing modules are the worst hit: they key items by `slug` and filter `.eq('slug', itemId)`, a column that exists only in the **deprecated** PocketBase snapshot (`menu_items` there used `name/…/active`, still no `slug`) — i.e. never in the generated schema.

### 4.4 Missing collections

- `menu_item_translations`, `category_translations`, `ui_translations` — referenced by `translation-resolver.ts` and seeded by `scripts/menu_item_translations_seed.json`. Not in the schema. The resolver catches and warns, so the app runs with **no translations** (ES-only despite the EN/KO pipeline).
- Auth: the app calls `insforge.auth.signInWithPassword` (`adminApi.ts:11`) with no PocketBase equivalent. The generated schema creates **no auth collection** (no `users`), so there is no identity to hang admin rules on. (`PROJECT_SNAPSHOT.md` lists `users (auth)` as a main collection — the generated schema dropped it.)

### 4.5 Missing / wrong indexes

Present and correct: `restaurants.slug` (unique), `restaurant_settings.restaurant_id` (unique), `menu_items (restaurant_id,category)`, `orders (restaurant_id,timestamp)` + `status` + `session_id`, `restaurant_tables (restaurant_id,table_number)` unique, `dining_sessions (restaurant_id,table_id)`, `bill_requests (restaurant_id,table_id)`, `floor_plans.restaurant_id` unique, `floor_props (restaurant_id,floor_plan_id)`, `app_modules (restaurant_id,slug)` unique, `import_jobs (restaurant_id,created_at)`, `promos (restaurant_id,active)` + `target_date`.

Gaps:
- **`staff_shifts`**: only `staff_id`. Every restaurant-scoped shift report scans. Add `(restaurant_id, clock_in)` (and/or `(staff_id, clock_in)`; the repo orders by `clock_in`, `staff-repo.ts:91`).
- **`visitors`**: only `sessionId`, non-unique. The upsert logic (`visitorService.ts:6-12`) assumes exactly one row per `sessionId`; without a **UNIQUE** constraint, concurrent visits create duplicates and the `visit_count` increment races. Add `UNIQUE(restaurant_id, sessionId)` and index `restaurant_id`.
- **`menu_items.station`**: single-column; the app filters `restaurant_id` + station → use `(restaurant_id, station)`.
- **`visitors.restaurant_id`**: unindexed; any tenant-scoped visitor query scans.
- `images`: no index — fine (tiny).
- `orders.status` single-column index is low-value (low cardinality, 9 values); the composite `(restaurant_id, timestamp)` already covers the dominant list query. Consider `(restaurant_id, status, timestamp)` only if filtered lists get slow.

### 4.6 JSON columns — where they are and whether `json` is right

**All 13 JSON columns and why `json` is an acceptable (mostly correct) choice:**

| Collection.field | Shape | Written by | `json` right? |
|---|---|---|---|
| `restaurant_settings.data` | settings blob object | `insforge/settings-repo.ts:92,97` | ✅ (but see note) |
| `menu_items.options` | `ItemOption[]` | mappers | ✅ |
| `promos.bundle_items` | `BundleItem[]` | promos | ✅ |
| `promos.conditions` | `Promotion.conditions` object | promotions | ✅ |
| `promos.action` | `Promotion.action` object | promotions | ✅ |
| `orders.items` | `OrderItem[]` (denormalized snapshot) | `orders-repo.ts:15` | ✅ — snapshotting line items is correct; do **not** normalize |
| `orders.status_timestamps` | `Partial<Record<OrderStatus,number>>` | `orders-repo.ts:27,107` | ✅ |
| `dining_sessions.order_ids` | `string[]` | `dinein-repo.ts:31,43` | ⚠️ valid but not queryable/joinable |
| `bill_requests.order_ids` | `string[]` | `dinein-repo.ts:63` | ⚠️ same |
| `bill_requests.payments` | `BillPayment[]` | `dinein-repo.ts:70,93` | ✅ |
| `visitors.associated_orders` | `string[]` | `visitorService.ts:50-54` | ⚠️ same |
| `import_jobs.summary` | `{success,failed}` | manager-hub imports | ✅ |
| `import_jobs.errors` | `string[]` | manager-hub imports | ✅ |

Verdict: **`json` is the right type for all 13.** The app maps these in memory (`asJson` helper) and never filters inside them. Two notes, not defects:
1. `orders.items` carries a `required` intent that the emitter drops (§4.2) — fix the emitter, keep `json`.
2. `*_order_ids` / `associated_orders` are arrays of foreign ids. If you ever need "orders for this session" via a DB filter, promote them to a PocketBase `relation` (multi) or a join collection; today it's fine because the code fetches and maps in JS.
3. `restaurant_settings.data` being a blob is fine — but only the `insforge/settings-repo.ts` path reads/writes `data`. `adminApi.ts:91` and `useUnlockState.ts:31-42` expect **top-level columns**. Pick one contract.

---

## 5. Two competing PocketBase schemas (drift)

- **Live local schema** — `pocketbase/pb_migrations/`: `1776459013_created_promos`, `1776459213_deleted_test_collection`, `1776459528_updated_orders`, `1776459563_updated_orders`, `1776829655_created_images`. This is the schema the prior app actually wrote to: `orders` uses **camelCase** (`customerName`, `customerAddress`, `items`, `total`, `status`, `paymentMethod`, `timestamp`, `statusTimestamps`, `deliveryFee`, `deliveryDistanceKm`, `sessionId`); `restaurant_settings` is a flat **camelCase** theme object (`primaryColor`, `logoUrl`, `heroTitle`, `deliveryRules`, `categories`).
- **Deprecated snapshot** — `pocketbase/pb_migrations_deprecated/1771380497_collections_snapshot.js`: confirms the same camelCase shape + a `users` auth collection.
- **New generated schema** — `db/pocketbase/`: **snake_case**, 16 collections, no auth, branding moved to a `restaurants` table + `restaurant_settings.data` blob.

`db/pocketbase/deploy.sh` ships **only** the new schema to the VPS and reports "16 collections." The insforge mappers were written for the snake_case shape, so they *match the new schema* — but the live local data and the `PROJECT_SNAPSHOT.md` field names are camelCase. If the new instance is ever seeded from the local `pb_data/data.db`, every camelCase column is dropped. Decide the canonical naming (snake_case is the better long-term choice, consistent with Supabase best practice) and delete the other tree.

---

## 6. Prioritized remediation

**P0 — make the app able to talk to PocketBase at all**
1. Add the PocketBase JS SDK; rewrite the query layer (`pb.collection(x).getFullList/getOne/create/update/delete` + filter strings). Delete or fully port `src/data/pocketbase/*` and fix the `restaurant_configs`/`tables` names.
2. Decide the rule model. Add a `users` (or `staff`) auth collection, authenticate the admin/manager clients, then write rules:
   - public customer reads: `listRule/viewRule` scoped, e.g. `restaurant_id = @request.query.r` (or a per-tenant token), never blanket `""`.
   - customer creates (`orders`, `dining_sessions`, `bill_requests`, `visitors`): `createRule` with a `restaurant_id` check.
   - admin reads/writes: `@request.auth.id != "" && @request.auth.restaurant_id = restaurant_id`.
3. Never `null` the rules the app needs; `null` = superuser-only.

**P1 — schema correctness**
4. Replace `noDecimal` with `onlyInt` in `schema.py:329`; regenerate.
5. Stop popping `required` for json (or special-case `orders.items`).
6. Add the missing columns (§4.3) and the three translation collections + auth.
7. Align `promos.discount_type` (`percentage` vs `percent`) and re-check `select` unions in one pass.

**P2 — multi-tenant + performance**
8. Make `restaurant_id` a PocketBase `relation` on every tenant table (or at minimum `required: true` and indexed); add `UNIQUE(restaurant_id, sessionId)` on `visitors`.
9. Add the missing indexes (§4.5).
10. Move stock deduction into a single transaction / PocketBase hook with conditional update (`stock >= qty`) instead of read-then-write per item.
11. Fix realtime (`await insforge.realtime.connect()` then subscribe, or `pb.collection('orders').subscribe('*', …)`).
12. Unify the settings contract (top-level columns vs `data` blob) across `adminApi`, `useUnlockState`, and the settings repo.

---

## 7. Verdict

The **data layer is not a PocketBase layer** — it is InsForge code, partially duplicated under a misleading `pocketbase/` name, with a dead backend and no PocketBase client. The **generated schema is structurally sound** (valid field JSON for PB 0.40, sensible indexes, correct primary-id/autodate patterns) but ships three classes of defect: (a) API rules that lock the app out of the collections it reads and writes, (b) an invalid `noDecimal` option plus a dropped `required`, and (c) missing columns/collections that the app's own code writes. JSON usage is appropriate throughout. Fix order is: client → auth/rules → emit-correct schema → tenant scoping/indexes.
