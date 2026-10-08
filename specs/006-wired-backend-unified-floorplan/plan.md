# 006 — Wired Backend + One Floor-Plan Formation

**Status**: Active work contract (multi-agent)
**Created**: 2026-10-06
**Supersedes intent of**: 004 (dead InsForge path), 005 (station routing — keep the spec, wire it)

---

## Why this exists

The app has no working backend path and three different floor-plan renderings.

- **Backend**: `lib/pocketbase.ts` and every `src/data/insforge/**` file import `@insforge/sdk`
  and query a **dead** InsForge Postgres. `package.json` has no `pocketbase` dependency. So the
  new PocketBase schema in `db/pocketbase/` is **unreachable from the app**, no matter how good it is.
- **Floor plan**: rendered three incompatible ways —
  1. `src/features/manager-hub/floor-editor/ui/FloorCanvas.tsx` — absolute px in a 680x400 canvas,
     table shapes (square/rectangle/circular/booth/l_shaped), rotation, chairs, status colours. **Canonical.**
  2. `src/features/dinein/TableSelector.tsx` — percentage positions **with `Math.random()` fallback**,
     fixed 64x64 rounded squares, no props/shapes/rotation/chairs. Different model entirely.
  3. `src/features/admin/pages/TablesPage.tsx` (dead code) — a third, list-based form.

The user's requirement: **one layout formation across every screen that shows a floor plan / map / layout.**

---

## Deliverable A — the wired backend

Target: the app talks to PocketBase `star-api.uorder.tech` (dev: `http://127.0.0.1:8096`) end to end.

### A1. Client + repos (app side)

- Add `pocketbase` (JS SDK) to `package.json`.
- Implement `src/data/pocketbase/**` against the **new** snake_case schema (`db/pocketbase/schema.py`):
  `restaurants`, `restaurant_settings`, `menu_items`, `promos`, `orders`, `restaurant_tables`,
  `dining_sessions`, `bill_requests`, `visitors`, `floor_plans`, `floor_props`, `import_jobs`,
  `staff`, `staff_shifts`, `app_modules`, `images`, `users`.
- Query translation (InsForge → PocketBase): `.eq()` → `filter`, `.order()` → `sort: '-col'`,
  `.single()`/`.maybeSingle()` → `getOne`/`getFirstListItem`, `.insert()` → `create`,
  `.upsert()` → get-then-create-or-update, realtime → `pb.collection(x).subscribe('*', cb)`.
- `lib/pocketbase.ts` keeps its **exact** export surface (`menuItemsApi`, `promosApi`, `ordersApi`,
  `settingsApi`, `subscribeToOrders`, `tablesApi`, `restaurantsApi`, `uploadFile`, `authApi`) so
  `App.tsx` needs no call-site changes. Behaviour changes only.
- Add a `floorPlanApi`: `getPlan(restaurantId)`, `savePlan(...)`, `listProps`, `saveProps` backed by
  `floor_plans` + `floor_props` + `restaurant_tables` (replaces localStorage-only persistence).

### A2. Server side (PocketBase)

Hermes's audit found the tightened rules **break reads**, so the app cannot function:
`orders`, `visitors`, `import_jobs`, `staff` are superuser-only. Required:

1. A `users` auth collection for managers/staff.
2. `@request.auth.id != ""` rules for manager reads (`orders` list, `visitors`, `import_jobs`, `staff`).
3. **Narrow anon server routes** for the customer-facing bits that must work without login:
   - `GET /api/star/order-status?id=&session_id=` — poll one order by id (no list access).
   - `POST /api/star/visitor-touch` — upsert a visitor row.
   - `POST /api/star/verify-pin` — already exists in `star_security.pb.js`.
4. Move the **Telegram bot token** off the client-readable settings blob (server-side send only).
5. Lock `images` upload to authenticated users.

> PB hook gotchas (verified on the sibling app): route handlers cannot see module scope — inline
> everything; a duplicate METHOD+path **panics PocketBase at startup**; cross-request state must use
> `$app.store()`; header names normalise to underscores (`x_kitchen_pin`).

### A3. Security debt (tracked, not silently skipped)

- `dulceria-pocketbase.fly.dev` exposes `orders` + `restaurant_settings` **anonymously, live right now**.
  No Fly creds locally (`fly auth whoami` → no token). **Needs the user**: `fly apps destroy dulceria-pocketbase`.
- `.env`, `.env.production`, `pb_data/*.db` are still in git **HEAD** on `github.com/martin-torres/star-app`.
  `git rm --cached` does not purge history. Needs `git filter-repo` + force-push + rotation.
- Service worker caches `/api/` GETs onto shared phones (CacheStorage leak).

---

## Deliverable B — ONE floor-plan formation

### B1. Canonical model (single source of truth)

`src/features/floorplan/model/floorPlan.ts`:

```ts
export type TableShape = 'square' | 'rectangle' | 'circular' | 'booth' | 'l_shaped';
export type FloorPropKind = 'stage'|'bathroom'|'staircase'|'window'|'main_door'|'door'|'kitchen_area';

export interface FloorPlanChair { chairId: string; offsetX: number; offsetY: number; active: boolean; }
export interface FloorPlanTable {
  id: string;               // stable id (DB id or T-1)
  restaurantId?: string;
  label: string;            // "Mesa 5"
  tableNumber: number;
  seats: number;
  shape: TableShape;
  x: number; y: number;     // canvas px, origin top-left
  width: number; height: number;
  rotation: number;         // degrees
  chairs: FloorPlanChair[];
  isAvailable: boolean;
  status?: TableStatus;     // drives fill colour, same tokens everywhere
}
export interface FloorPlanProp { id: string; kind: FloorPropKind; x:number;y:number;width:number;height:number;rotation:number; }
export interface FloorPlan {
  restaurantId: string;
  canvas: { width: number; height: number; gridSize: number };
  tables: FloorPlanTable[];
  props: FloorPlanProp[];
}
```

**Locked geometry contract**: one coordinate space (`0..canvas.width` x `0..canvas.height`), one shape
style table, one chair-position algorithm, one colour token map. No surface may invent its own.

### B2. One renderer, three modes

`src/features/floorplan/ui/FloorPlanView.tsx` — a single read-only renderer used by **every** surface:

| Surface | Mode | Behaviour |
|---|---|---|
| `dinein/TableSelector` (customer) | `select` | tap available table; unavailable dimmed; no drag |
| `manager-hub` (floor plan module) | `live` | status colours, no drag; opens inspector |
| `manager-hub/floor-editor` | `edit` | drag/resize/rotate/chairs (wraps the same primitives) |
| kitchen / FOH / analytics | `status` | status colours + legend |

Shared primitives live in `src/features/floorplan/ui/`: `tableShapeStyle()`, `chairNodesFor()`,
`propIcon()`, `FloorGrid`, `FloorPlanLegend`, `resolveTableVisualState()`.
`tableShapeStyle` is **extracted from** `FloorCanvas.tsx` and re-used, not re-implemented.

### B3. Non-negotiable parity rules

1. Same table shape → identical CSS on every screen.
2. Same status → identical fill from `STATUS_COLOR_TOKENS`.
3. Same props (kitchen/bathroom/window/...) drawn on every screen, same icons.
4. No `Math.random()` in any layout path.
5. Customer selector reads the **same** `FloorPlan` object the manager editor saves.

---

## File ownership (avoid collisions)

| Owner | Files |
|---|---|
| **turtle (me)** | `src/features/floorplan/**`, `src/features/manager-hub/**`, `src/features/dinein/**`, `src/features/admin/**`, `src/features/appViews.tsx`, `App.tsx`, `src/shared/**`, `src/core/types.ts` |
| **helper agent** | `src/data/pocketbase/**`, `src/data/contracts/**`, `lib/**`, `package.json`, `.env.example`, `vite.config.ts`, `src/data/insforge/**` (delete) |
| **Hermes** | `db/pocketbase/**` (schema, hooks, routes, rules, deploy.sh) |

Nobody edits another owner's files without messaging first.

---

## Verification (end-to-end, not just "it compiles")

1. `npx tsc --noEmit -p tsconfig.app.json` clean (currently masked by `mercadopago.ts`).
2. `npm run build` succeeds.
3. Local PocketBase on `:8096` with the generated migration; app loads menu, settings, tables.
4. Customer flow: pick table (same plan as manager) → order → kitchen sees it → status advances.
5. Manager flow: edit plan → save → reload → customer selector shows the **identical** formation.
6. Floor-plan parity check: render the same `FloorPlan` on all surfaces, screenshot-diff the table rects.
7. Re-run the react/db/type/security findings from `reviews/` and confirm each is closed or ticketed.
