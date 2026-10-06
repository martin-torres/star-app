# Silent Failure Hunt — star-app

**Scope:** `App.tsx`, `index.tsx`, `lib/`, `src/` (InsForge data layer, manager hub, admin, kitchen, dine-in, customer, payments, hooks, core).
**Method:** read every file containing `catch`, `console.error`, `console.warn`, `return null`/`return []`, `.then(` without `.catch`, and every repository/adapter; traced each failure path to the user-visible screen.
**Date:** 2026-10-05

---

## Executive summary

The app is built so that **every load failure degrades into a plausible-looking empty state instead of an error**. The two most dangerous consequences:

1. **A failed settings fetch silently downgrades the kitchen and owner dashboards to PIN `0000`** and re-brands the app with defaults.
2. **A single failed query blanks the entire admin console** (all 7 pages) with no error, because `Promise.all` + a swallow-only catch is the only load path.

Realtime, order-status writes, promos, manager-hub modules, visitor tracking, and translations all follow the same "log-and-forget" pattern. Payments are fake-success stubs and the dine-in bill/payment flow is never persisted at all.

---

## Findings (worst first)

### 1. CRITICAL — Settings load failure silently falls back to PIN `0000` (kitchen + owner lock bypass)

- **Location:** `App.tsx:118-126` (settings fetch, `catch` logs only), `src/core/uiSettings.ts:84-85` (`adminPin`/`kitchenPin` default `'0000'`), `src/features/locks/pins.tsx:13,63` (`expectedPin = '0000'`), consumed at `App.tsx:720,728,748`.
- **Issue:** `settingsApi.get()` rejection is only `console.error`'d. `settings` stays `null`; `resolveUiSettings(null)` returns `adminPin: '0000'`, `kitchenPin: '0000'`. The lock screens compare against that value.
- **User-visible symptom:** Backend/settings outage → the kitchen panel and the Data (owner/analytics) panel unlock with `0000`. Doors that should be gated open with the factory PIN.
- **Blast radius:** Kitchen lock, Owner/Data lock, Manager dashboard lock (`App.tsx:726-731`), plus all branding/mode (also silently defaults to `to-go` at `App.tsx:61`, hiding dine-in).
- **Smallest loud fix:** On settings failure set a distinct error/`settingsError` state and render a banner; change `resolveUiSettings` PIN fallbacks to fail closed (e.g. throw / empty PIN that can never match) instead of `'0000'`.

### 2. CRITICAL — One failed query blanks the entire admin console

- **Location:** `src/features/admin/AdminModule.tsx:37-64` (`loadData`: `Promise.all([menuApi.getAll, ordersApi.getAll, promosApi.getAll, settingsApi.get, tablesApi.getAll])`, `catch { console.error } finally setLoading(false)`).
- **Issue:** `Promise.all` rejects on the **first** failure; the catch discards all results and never records an error. Lists keep their initial `[]` values.
- **User-visible symptom:** Owner logs into admin and sees **empty menu, empty orders, empty promos, empty tables, empty settings** — indistinguishable from "brand-new restaurant" — with no error and no retry affordance.
- **Blast radius:** Dashboard, Menu, Orders, Promotions, Settings, Inventory, Tables (all admin pages).
- **Smallest loud fix:** Switch to `Promise.allSettled`, keep each successful list, collect failures into an `error` state, and render it in `AdminLayout`; add a Retry button.

### 3. HIGH — Two backend clients with mismatched fallback URLs; admin + translations can silently point at `localhost`

- **Location:** `src/data/insforge/client.ts:4` (`… || 'https://2y542jyv.us-east.insforge.app'`) vs `src/data/pocketbase/client.ts:4` (`… || 'http://localhost:8090'`); `src/features/admin/adminApi.ts:1` imports the **pocketbase** (localhost-default) client; `src/data/pocketbase/translation-resolver.ts` (re-exported by `src/data/insforge/translation-resolver.ts`) uses the same client.
- **Issue:** `.env` / `.env.production` are gitignored (confirmed), so production builds depend on platform env vars. If `VITE_INSFORGE_URL` is unset, the InsForge client falls back to the live host (works) but the **admin + translation client falls back to `http://localhost:8090`** (dead in production).
- **User-visible symptom:** In prod, every admin read/write and every translation load fails → combined with finding #2, the admin console is silently blank; all UI strings fall back to keys/Spanish.
- **Blast radius:** Entire admin module, all translated UI text, menu descriptions.
- **Smallest loud fix:** Collapse to one client module; delete the `localhost` default (throw a config error if the URL is missing) so a misconfigured deploy fails loudly at startup.

### 4. HIGH — Kitchen shows "Sin órdenes activas" when the order fetch fails, and realtime never recovers

- **Location:** `App.tsx:148-160` (`ordersApi.getActive` → `catch { console.error }` → `orders=[]`), rendered by `src/features/kitchen/kitchenView.tsx:45-49`. Realtime: `App.tsx:348-369` and `App.tsx:372-394` — `subscribeToOrders(...).then((fn)=>…)` with **no `.catch`**.
- **Issue:** A failed active-orders fetch is treated as "no orders". A rejected `subscribeToOrders` produces an unhandled promise rejection and no live updates for the life of the session.
- **User-visible symptom:** During an outage the kitchen shows the empty-state ("Sin órdenes activas") while real orders exist; even after recovery, new orders never appear (no live subscription).
- **Blast radius:** Kitchen panel; customer order tracking (`App.tsx:372-394`).
- **Smallest loud fix:** Give the kitchen fetch an explicit error state with retry (don't conflate empty/failed); add `.catch` to both `subscribeToOrders(...)` calls and show a "live updates offline" indicator.

### 5. HIGH — Failed promo fetch silently hides all promotions

- **Location:** `App.tsx:139-145` (`catch(() => console.error('Error al cargar las promociones.'))`); also `lib/pocketbase.ts:41-44` (`catch { console.error; return [] }`); `src/data/pocketbase/mappers.ts` not involved.
- **Issue:** Any error (network, auth, schema) becomes `promos = []`.
- **User-visible symptom:** Landing and menu show no promotions — looks like the owner configured none.
- **Blast radius:** Landing view, Menu view (`src/features/customer/views.tsx`).
- **Smallest loud fix:** Track a `promosError` state and show a small "couldn't load promotions" notice instead of an indistinguishable empty list.

### 6. HIGH — Order-status updates from the kitchen/admin fail silently (floating promises)

- **Location:** `App.tsx:332-339` (`updateOrderStatus` logs then **rethrows**); `src/features/kitchen/kitchenView.tsx:157-160,189` (button `onClick={() => updateOrderStatus(...)}` — floating promise); modal closes unconditionally at `kitchenView.tsx:188-191`; `src/features/admin/AdminModule.tsx:123-131` rethrows; `src/features/admin/pages/OrdersPage.tsx:56-61` (`await onUpdateStatus(...)` inside an uncaught handler).
- **User-visible symptom:** Tapping "Aceptar Comanda" / "Marcar Cocinado" during an outage does nothing — the card stays in the old column and no error appears. The transfer-proof modal closes even though the status write failed, implying success.
- **Blast radius:** Kitchen panel, Admin → Orders.
- **Smallest loud fix:** Catch at the call sites, show an inline error/toast, and don't close the modal / advance the column until the write resolves.

### 7. MEDIUM-HIGH — Manager Hub module loads and deletes fail silently

- **Location:** `src/features/manager-hub/menu/ui/MenuModule.tsx:24-30` (`void load()` — no try/catch), delete at `:71`; `…/pricing/ui/PricingModule.tsx:24-30`, delete at `:74`; `…/promotions/ui/PromotionsModule.tsx` (same `void load()` shape + delete at `:89`); `…/imports/ui/ImportsModule.tsx:22-28` (`void load()`), and `apply()` upsert at `:121` is outside its try block.
- **Issue:** Only the `save` paths have `try/catch`+`setError`; the initial `load()` and all Delete buttons call the repo promise directly. A rejection is unhandled and the list simply stays/returns empty.
- **User-visible symptom:** Manager opens Catalog/Pricing/Promos/Imports and sees an empty list with no error; deleting an item appears to do nothing (item reappears after reload) with no message.
- **Blast radius:** Manager Hub → Operations (catalog, pricing, promos, imports).
- **Smallest loud fix:** Wrap every `load()` and delete in `try/catch` with `setError(...)`, mirroring the existing `saveDraft` pattern.

### 8. MEDIUM-HIGH — Admin settings save silently no-ops; write errors are ignored in the settings repo

- **Location:** `src/features/admin/AdminModule.tsx:158-169` (`handleSettingsSave`: only writes `if (settings?.id)`, otherwise `return true`); `src/features/admin/pages/SettingsPage.tsx:29-36` (`try { await onSave } finally { setSaving(false) }` — no catch); `src/data/insforge/settings-repo.ts:59-99` (`save()` awaits `update`/`insert` but never checks the returned `error`).
- **User-visible symptom:** Owner edits settings and clicks Save; the button un-busies and no error appears, but nothing was persisted when the settings row is missing/id-less or the write fails.
- **Blast radius:** Admin → Settings (branding, PINs, payment settings, delivery rules).
- **Smallest loud fix:** Throw when there is no id to update (or upsert); check the `error` field on every write in `InsForgeSettingsRepository.save`; add `catch` + visible message in `SettingsPage`.

### 9. MEDIUM — Dine-in bill/payment is never persisted

- **Location:** `App.tsx:440-454` (`handleRequestBill` builds `billData` locally only), `App.tsx:456-467` (`handlePaymentComplete` only resets local state), `src/features/dinein/BillPayment.tsx:94-99` (`handlePay` calls the local callback).
- **Issue:** No call to `bill_requests` / `dining_sessions` even though `src/data/insforge/dinein-repo.ts` provides `createBillRequest` / `updateBillRequest` / `createSession`.
- **User-visible symptom:** A table "pays" and the UI resets to QR scan; there is no server record of the bill, payment split, or session.
- **Blast radius:** Entire dine-in flow.
- **Smallest loud fix:** Persist the bill request and payment via the dine-in repo; surface failures instead of advancing to the "payment complete" screen.

### 10. MEDIUM — Payment providers are fake-success stubs and are not wired into checkout

- **Location:** `src/features/payments/mercadopago.ts:88-100` (returns `{success:true}` + synthetic `transactionId`), `codi.ts:26-36` (`success:true` with a URL never generated), `transfer.ts:49-60` (`success:true` without any upload); offered in `src/features/customer/views.tsx:607-642` (conekta / mercadopago / codi buttons) while `App.tsx:269-330` (`placeOrder`) never calls them.
- **Issue:** Selecting card/Mercado Pago/CoDi creates an order with `paymentMethod: 'conekta' | 'mercadopago' | 'codi'` and status `recibido`; nothing is charged, and the stub would report success if called.
- **User-visible symptom:** Customer believes a card/CoDi payment happened; no money moves and the order is queued as if paid/confirmed.
- **Blast radius:** Checkout, Kitchen (wrong payment method shown), revenue reporting.
- **Smallest loud fix:** Until integrated, hide/disable these options (or label them "próximamente"); make the stubs throw instead of returning `success:true` so nothing can mistake them for real.

### 11. MEDIUM — Visitor tracking failures are invisible

- **Location:** `src/hooks/useVisitorTracking.ts:77-79` (`catch { console.error }`), `:89-97` (associate swallow), `lib/visitorService.ts:42-61` (rethrows, then swallowed by caller), `lib/visitorService.ts:63-76` (`getVisitorBySessionId` catch → `return null`).
- **User-visible symptom:** Attribution/analytics silently lose visits and order links; no dashboard signal that tracking is broken.
- **Blast radius:** Analytics/visitor attribution; `associated_orders` never populated.
- **Smallest loud fix:** Surface a warning in the analytics view and log with session context; distinguish "no visitor" from "lookup failed".

### 12. MEDIUM — Translation failures are misreported as "collection not found" and silently drop all localized text

- **Location:** `src/data/pocketbase/translation-resolver.ts:49-51, 68-70, 87-89` (each `catch (e:any) { console.warn('⚠️ <collection> not found, skipping translations') }`).
- **Issue:** Any error — network, auth, quota, schema — is logged as "collection not found" at warn level, and `loadAll()` resolves successfully. `src/hooks/useTranslations.ts:16-25` sets no failure the UI reads (Landing/Menu ignore `error`).
- **User-visible symptom:** All UI strings fall back to keys/Spanish and menu descriptions fall back to defaults, with no indication why.
- **Blast radius:** Every screen using `useTranslations` (landing, menu, checkout, tracking).
- **Smallest loud fix:** Only treat a true 404/`PGRST116`-style error as "not found"; let real errors reject `loadAll()` and surface them.

### 13. MEDIUM — Restaurant QR lookup swallows all errors → wrong message

- **Location:** `lib/pocketbase.ts:109-146` (`restaurantsApi.getById`/`getBySlug`/`getAll` all `catch { return null | [] }`), consumed by `App.tsx:400-419` (`handleQRScan`).
- **User-visible symptom:** A network outage shows "Restaurante no encontrado" (same as a genuinely bad QR), so the user retries forever instead of being told the server is unreachable.
- **Blast radius:** Dine-in entry (QR scan).
- **Smallest loud fix:** Let these throw and have `handleQRScan` distinguish "not found" from "connection error".

### 14. MEDIUM-LOW — Checkout delivery fee computed at distance 0

- **Location:** `App.tsx:342-345` (`checkoutDeliveryFee = calculateDeliveryFee(0, thresholds)`), and `App.tsx:644` passes `deliveryDistanceKm={0}`. The real distance is computed in `placeOrder` (`App.tsx:282-285`) using `STORE_LOCATION === CUSTOMER_LOCATION`.
- **User-visible symptom:** The displayed delivery fee is always the 0-km fee (and the shown distance is always 0.0 km), while the stored order may differ — a silently wrong total.
- **Blast radius:** Checkout totals, tracking totals.
- **Smallest loud fix:** Compute the real distance once (customer address → store) and pass the same values to both the display and the order payload.

### 15. LOW-MEDIUM — Use of a client-only "unlock" and unlogged disclaimer persistence

- **Location:** `src/hooks/useUnlockState.ts:24-47` (`acceptDisclaimer` writes localStorage, then a DB write whose failure is `console.log('Could not save disclaimer to database')` — info severity, no retry), `:19-22` (`unlock()` persists to `localStorage`).
- **User-visible symptom:** Legal disclaimer acceptance may not persist server-side; the customer unlock flag can be forged by editing `localStorage` (`ldl_unlocked`).
- **Blast radius:** Age/disclaimer compliance, gated content.
- **Smallest loud fix:** Use `console.error` + a visible retry/queue for the disclaimer write; treat client lock as cosmetic, not a security boundary.

### 16. LOW-MEDIUM — Manager floor plans only persist to `localStorage`

- **Location:** `src/features/manager-hub/shell/ManagerHubPage.tsx:27-29, 31-37`; `src/features/manager-hub/shell/floorPlanPersistence.ts:5-20` (`saveFloorPlanStore`/`loadFloorPlanStore`, corrupt-JSON `catch { return null }`).
- **User-visible symptom:** A manager's floor plan is device-local; it vanishes on another device/browser and is never in the DB — even though `floor_plans`/`floor_props` repos exist (`src/data/insforge/floor-plan-repo.ts`, `floor-props-repo.ts`).
- **Blast radius:** Manager Hub floor editor.
- **Smallest loud fix:** Persist through the floor-plan repos and surface save errors; keep localStorage only as a cache.

### 17. LOW — Manager floor plan shows hardcoded demo table statuses

- **Location:** `src/features/manager-hub/shell/ManagerHubPage.tsx:40-63` (`tableStatusMap` built from a fixed `demoStatuses` array).
- **User-visible symptom:** Tables always show occupancy/status colors unrelated to real orders, with no "demo" indicator.
- **Blast radius:** Manager Hub floor plan.
- **Smallest loud fix:** Wire `tableStatusSync`/real data or label the map as a preview.

### 18. LOW — Mapper fallbacks hide corrupt/invalid data

- **Location:** `src/data/insforge/mappers.ts:42-53` (`asJson` `catch { return fallback }` silently drops unparseable `options`/`bundle_items`), `:107-142` (`toOrder` coerces unknown `status` → `'recibido'` and non-array `items` → `[]`; lines `136-140` are a duplicated dead branch, both arms identical), `src/data/pocketbase/mappers.ts:92-97` (same duplication).
- **User-visible symptom:** A malformed order renders with no items and default status; bad promo bundles vanish — no signal that data was corrupt.
- **Blast radius:** Menu, promos, kitchen, tracking, analytics.
- **Smallest loud fix:** Log a structured warning (and dedupe the dead branch) when a coercion/fallback fires.

### 19. LOW — Admin `getCurrentUser` ignores its error

- **Location:** `src/features/admin/adminApi.ts:20-23` (`const { data } = await insforge.auth.getCurrentUser(); return !!data?.user;`).
- **User-visible symptom:** An auth-check failure is indistinguishable from "not logged in".
- **Smallest loud fix:** Read `error` and surface it.

### 20. LOW — Admin tables CRUD targets a different table than the canonical repo

- **Location:** `src/features/admin/adminApi.ts:147-182` uses `.from('tables')`; the active repository `src/data/insforge/tables-repo.ts:8-14` uses `.from('restaurant_tables')`.
- **User-visible symptom:** If `tables` doesn't exist/mirror `restaurant_tables`, admin table CRUD errors are swallowed by `AdminModule.loadData` → empty Tables page.
- **Blast radius:** Admin → Tables.
- **Smallest loud fix:** Point admin table CRUD at `restaurant_tables` (or the shared repo) and surface errors.

### 21. LOW — No top-level error boundary; a customer/kitchen render error white-screens

- **Location:** `index.tsx:11-16` renders `<App />` with no boundary; only the admin module wraps itself (`src/features/admin/AdminModule.tsx:317`, `src/features/admin/components/ErrorBoundary.tsx`).
- **Additional latent crash:** `App.tsx:536-543` calls `React.useState`/`React.useEffect` **inside a `switch` case** of `renderCustomerView` (a function invoked conditionally at `App.tsx:707`) — a Rules-of-Hooks violation that can throw "Rendered more hooks than during the previous render" when entering `table-selection`.
- **User-visible symptom:** A render error anywhere in the customer/kitchen path blanks the app with no recovery UI.
- **Smallest loud fix:** Add an app-level `ErrorBoundary`; extract the table-selection state (`App.tsx:536-543`) into its own component so hooks are unconditional.

---

## Verified clean (errors propagate correctly)

- `src/data/insforge/{menu,orders,tables,app-modules,dinein,floor-plan,floor-props,imports,promos,staff}-repo.ts` and the manager-hub repos (`menuRepo`, `pricingRepo`, `promotionsRepo`, `importsRepo`) all `if (error) throw error` — the failure is surfaced to callers (the problem is the callers listed above).
- `App.tsx:98-116` menu load **does** set a user-visible `ErrorView` (though that same gate replaces the whole UI, including kitchen/manager — see established fact; not re-flagged here).
- `App.tsx:178-193` analytics load **does** set `analyticsError`, rendered by `src/features/analytics/dataView.tsx:44-62`.
- `src/features/admin/adminApi.ts` CRUD (except `getCurrentUser`) throws on error.

## Dead code / confusion worth removing

- `src/data/pocketbase/index.ts` and `src/data/pocketbase/{menu,orders,settings,tables}-repo.ts`, `mappers.ts` are **not imported anywhere** (only `client.ts` and `translation-resolver.ts` are live). They instantiate a second, localhost-default client and invite exactly the mismatch in finding #3.
- `src/features/payments/*` modules are exported but never imported by the app.

## Recommended minimal-diff sequence

1. Fix #2 (`Promise.all` → `allSettled` + error UI) and #3 (single client) — highest blast radius.
2. Fix #1 (fail-closed PINs + surface settings failure).
3. Fix #4/#5/#6 (kitchen order/promo load states, realtime `.catch`, order-status error feedback).
4. Fix #7/#8 (manager module + admin settings error handling).
5. Address #9/#10 (persist dine-in payments; disable stub payment options) before taking real orders.
