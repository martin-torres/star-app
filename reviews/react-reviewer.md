# React Review — star-app

**Reviewer:** react-reviewer (React/JSX lanes only)
**Scope:** all `.tsx` under `src/`, plus `App.tsx`, `index.tsx`. Generic TypeScript type-safety,
async correctness, and Node/build issues are owned by `typescript-reviewer`; React-specific
duplicates of those are noted only where they change React runtime behavior.
**Repo:** `/Users/lomalinda007yahoo.com/Documents/Apps/star-app` (React 19.2, Vite 6, TS 5.8, Tailwind via CDN)

## Verdict: **BLOCK**

A CRITICAL rules-of-hooks violation, a CRITICAL client-bundle secret leak, and two render-time
ReferenceErrors that crash whole screens. This code would not pass review at a top React shop.

### Tooling status
- `npx tsc --noEmit -p tsconfig.app.json` reports **only** `src/features/payments/mercadopago.ts(19)` syntax
  errors and suppresses **all** semantic diagnostics project-wide. Every type-level finding below is
  therefore invisible to CI today.
- `eslint.config.js` correctly configures `eslint-plugin-react-hooks` (flat `recommended`), but
  **eslint and its plugins are not installed** (no `node_modules/.bin/eslint`), so this rules-of-hooks
  violation is never caught. Installing + wiring lint into CI is a prerequisite fix.

---

## CRITICAL

### [CRITICAL] Hooks called conditionally inside a `switch` case (rules of hooks)
**File:** `App.tsx:536-543`
**Issue:** `renderCustomerView()` is a plain function called during `App`'s render (line 707). Inside
`case 'table-selection':` it calls `React.useState` and `React.useEffect`:
```tsx
case 'table-selection': {
  const [tables, setTables] = React.useState<RestaurantTable[]>([]);
  React.useEffect(() => { ... }, [currentRestaurant?.id]);
  return (<TableSelector ... />);
}
```
**Why:** Hooks run only when `dineInStage === 'table-selection'`. The number/order of hooks attached to
`App` changes between renders (e.g. advancing `'restaurant-info' → 'table-selection'` adds two hooks).
React throws *"Rendered more hooks than during the previous render"* and unmounts the tree; even in the
best case this is an illegal conditional hook. This is exactly what `react-hooks/rules-of-hooks` exists
to prevent — and lint is not running.
**Fix:** Extract a real component, e.g.
```tsx
function TableSelectionStep({ restaurantId, ui, onSelectTable }) {
  const [tables, setTables] = React.useState<RestaurantTable[]>([]);
  React.useEffect(() => {
    if (restaurantId) tablesApi.getAll(restaurantId).then(setTables).catch(console.error);
  }, [restaurantId]);
  return <TableSelector tables={tables} ... />;
}
```
and render `<TableSelectionStep .../>` in the `case`.

### [CRITICAL] Admin credentials shipped in the client bundle
**File:** `src/features/admin/AdminModule.tsx:76-77`
**Issue:**
```tsx
const adminEmail = import.meta.env.VITE_ADMIN_EMAIL || prompt('Admin email:') || '';
const adminPassword = import.meta.env.VITE_ADMIN_PASSWORD || prompt('Admin password:') || '';
```
**Why:** Vite statically inlines every `import.meta.env.VITE_*` into the emitted JS. `VITE_ADMIN_EMAIL`
is set in `.env` (`admin@dipasquale.com`), so the admin identifier is readable by anyone who loads the
app; the same code path invites storing `VITE_ADMIN_PASSWORD`, which would leak the password verbatim.
The admin tree is imported by `App.tsx:22` (and re-exported by `appViews.tsx`), so it is bundled even
though `App` never renders it — the value ships regardless.
**Fix:** Do not authenticate with credentials compiled into a browser bundle. Move the admin
authentication to a server-side endpoint / InsForge-secured flow and remove both `VITE_ADMIN_*` reads.
Prompting for a password (current fallback) is also not an acceptable auth pattern.

---

## HIGH

### [HIGH] `OPS_TABS` referenced but declared nowhere — render-time ReferenceError
**File:** `src/features/manager-hub/shell/ModuleHost.tsx:106`
**Issue:** `{OPS_TABS.map((tab) => (...))}` inside the `route === "operations"` branch. No `OPS_TABS`
exists in the file or its imports.
**Why:** The moment a manager selects the "Ops" nav item, `ModuleHost` throws `ReferenceError: OPS_TABS
is not defined` during render. There is no error boundary around `ManagerHubPage`, so the whole app
crashes.
**Fix:** Declare the constant (mirroring `TABLE_TYPES`/`PROP_TYPES`), e.g.
`const OPS_TABS: Array<{value: OperationsViewMode; label: string; icon: string}> = [...]`.

### [HIGH] `statusConfig[order.status]` can be `undefined` → crash of the admin Orders page
**File:** `src/features/admin/pages/OrdersPage.tsx:22-30, 98, 105-107`
**Issue:** `statusConfig` is typed `Record<OrderStatus, {...}>` but omits `'paid'` and `'cancelled'`
(both present in `core/types.ts:9-10`). Line 98 does `const status = statusConfig[order.status]` then
reads `status.color` / `status.icon`.
**Why:** Any order with status `paid` or `cancelled` makes `status` `undefined` and the render throws
`Cannot read properties of undefined (reading 'color')`. The `AdminErrorBoundary` catches it, but the
Orders screen is dead for the whole session. (The missing keys are also a compile error that tsc is
currently suppressing.)
**Fix:** Add `paid`/`cancelled` entries, or index defensively:
`const status = statusConfig[order.status] ?? { label: order.status, color: 'bg-gray-100 text-gray-700', icon: null }`.

### [HIGH] `Math.random()` evaluated during render — layout jitter / non-determinism
**File:** `src/features/dinein/TableSelector.tsx:128-129`
**Issue:**
```tsx
left: `${table.x || 10 + Math.random() * 70}%`,
top:  `${table.y || 10 + Math.random() * 60}%`,
```
**Why:** When a table has no stored `x`/`y`, a fresh random position is generated **on every render**,
so tables jump whenever `TableSelector` re-renders (selection change, StrictMode double-render, parent
re-render). Random work in render is also non-deterministic/impure and breaks any memoization.
**Fix:** Compute stable fallback coordinates from the table index (or `useMemo` once per table list and
store them), never `Math.random()` in render.

### [HIGH] `dangerouslySetInnerHTML` / unsafe URL schemes — none found (clean)
Audited: no `dangerouslySetInnerHTML`, no `innerHTML`, no `javascript:`/`data:` `href`/`src` writes.
User-controlled images render via `<img src>` (safe). **No finding — recorded as checked.**

### [HIGH] Derived state stored in state via effect with an unstable dependency
**File:** `src/features/customer/views.tsx:164-185` (`MenuView`)
**Issue:** `visibleCategories` is recomputed as a new array on every render (lines 170-172) and is used
as a dependency of **two** near-duplicate `useEffect`s (lines 175-179 and 181-185) that call
`setSelectedCategory`.
**Why:** New array identity each render makes both effects run on every render; the two effects
implement the same "reset invalid category" logic. It doesn't infinite-loop today only because the
setState is guarded, but it is a classic derived-state-in-effect smell and a wasted render per pass.
**Fix:** `const visibleCategories = useMemo(() => (...), [categories, menuItems, isUnlocked])`, keep a
single effect, or derive `selectedCategory` during render (fall back to `visibleCategories[0]?.code`
when the current one is absent).

### [HIGH] `useMemo` dependency rebuilt every render (memoization defeated)
**File:** `src/features/customer/views.tsx:390-411` (`CheckoutView`)
**Issue:** `const dbCombo = settings?.unlock_combo || [ {...}, {...}, {...} ]` creates a new array
literal each render whenever `settings.unlock_combo` is absent, and `dbCombo` is a dep of both
`useMemo(..., [cart, isUnlocked, dbCombo])` and `useMemo(..., [cart, isUnlockOrder, dbCombo])`.
**Why:** Both memos recompute on every render — the memoization does nothing. On a checkout with many
items this repeats the combo-reduction work each keystroke.
**Fix:** Hoist the default combo to a module-level constant; `const dbCombo = settings?.unlock_combo ?? DEFAULT_UNLOCK_COMBO;`.

### [HIGH] Interactive elements as non-semantic `<div onClick>` (keyboard/AT unreachable)
**Files (representative):**
- `src/features/customer/views.tsx:99-106` (promo card "add to cart"), `:241-248` (menu item), `:491-498` (upsell card)
- `src/features/kitchen/kitchenView.tsx:72-77` (transfer screenshot preview), `:114-143` ("click to copy address")
- `src/features/customer/components/WeightOrderModal.tsx:212-215` (clickable calculation block)
**Issue:** Clickable `<div>`s with `onClick` only — no `role`, `tabIndex`, or `onKeyDown`.
**Why:** Excludes keyboard-only and assistive-tech users; fails `jsx-a11y`. These are primary purchase
actions (add to cart / open item).
**Fix:** Render a `<button>` (or `<a>` where navigational) and keep the styling; if a wrapper must be a
`div`, add `role="button" tabIndex={0}` plus an Enter/Space handler.

### [HIGH] Form inputs without associated labels
**Files:** `AdminModule.tsx:222` (admin PIN — only a `placeholder`), `QRScanner.tsx:53`,
`MenuPage.tsx:111`, `OrdersPage.tsx:73`, `InventoryPage.tsx:79`, manager-module inputs
(`MenuModule.tsx:52-56`, `PricingModule.tsx:53-58`, `PromotionsModule.tsx:57-63`),
`CheckoutView` cash field (`views.tsx:671` label not tied via `htmlFor`).
**Why:** Placeholder-only inputs have no accessible name; screen readers announce nothing useful. The
cash-field `<label>` is not programmatically associated with the input.
**Fix:** Add `aria-label`, or an `id` + `<label htmlFor>`. (In `AdminModule` the visible context is text,
not a label.)

### [HIGH] Modals have no dialog semantics, no Escape, no focus management
**Files:** `views.tsx:734-771` (disclaimer + "Unlocked" overlays), `WeightOrderModal.tsx:117`,
`OptionSelector.tsx:17-21`, all admin modals (`MenuPage.tsx:202`, `PromotionsPage.tsx:160`,
`TablesPage.tsx:181,298`, `OrdersPage.tsx:144`, `AdminLayout.tsx:49-54`).
**Why:** No `role="dialog"`/`aria-modal`, no focus trap, no Escape-to-close, focus not moved into the
dialog. Keyboard users can tab behind the overlay.
**Fix:** Add `role="dialog" aria-modal="true"`, an Escape handler, and initial focus (or adopt a
headless dialog primitive).

### [HIGH] State initialized from a prop without reset; component defined inside a component
**File:** `src/features/admin/pages/SettingsPage.tsx:26, 38-51`
**Issue:** `const [formData, setFormData] = useState(settings)` seeds once and never resyncs if the
`settings` prop changes (e.g. after `loadData()` in `AdminModule`). `ColorInput` is declared **inside**
`SettingsPage`, so it is a brand-new component type every render.
**Why:** `formData` can silently diverge from the prop after a save/refetch. `ColorInput` remounts its
`<input type="color">` on every parent render, which can drop focus/interaction mid-edit.
**Fix:** Hoist `ColorInput` to module scope (pass `label/value/onChange`), and either `key={settings.id}`
on `SettingsPage` or sync via a controlled effect with a proper comparison.

---

## MEDIUM

### [MEDIUM] `key={index}` in lists that support insert/remove/reorder
**File:** `src/features/admin/pages/PromotionsPage.tsx:262`
**Issue:** Bundle-item rows use `key={index}` while rows are edited/removed **by index**
(`updateBundleItem(index, ...)`, `removeBundleItem(index)`).
**Why:** Removing a middle row makes React reuse DOM/state for the wrong row; input values can appear
attached to the wrong item. Also present (display-only, lower risk) at `BillPayment.tsx:115,277`,
`DiningScreen.tsx:83`, `OrdersPage.tsx:168`, `RestaurantInfo.tsx:82`, `dataView.tsx:213,235`,
`views.tsx:122,452`, `statusViews.tsx:37`, `pins.tsx:40,90`.
**Fix:** Give bundle rows a stable id (the component already has an `id` field — populate/use it).

### [MEDIUM] Heavy computation during render (no `useMemo`)
**File:** `src/features/analytics/dataView.tsx:65-146`
**Issue:** On every render it filters all orders by `timeView`, reduces them, builds `itemStats`/
`bestSellers`, and calls `getSalesForDay(i+1)` (a fresh `orders.filter`) once per day of the month —
≈31 order-array scans per render. `new Date()` is also recomputed each render.
**Why:** Visible jank on the analytics screen with real order volumes; work repeats on unrelated
re-renders.
**Fix:** Wrap the derived aggregates in `useMemo(..., [orders, timeView])` and precompute the monthly
per-day totals in one pass.

### [MEDIUM] Network write on every keystroke (no debounce)
**File:** `src/features/admin/pages/InventoryPage.tsx:138`
**Issue:** `onChange={(e) => onUpdateStock(item.id, parseInt(e.target.value) || 0)}` persists stock on
each digit; `handleUpdateStock` in `AdminModule` then calls `loadData()` (a 5-endpoint `Promise.all`).
**Why:** Typing "100" fires three full data reloads; each reload replaces `items` and can fight the
input. UX + backend load.
**Fix:** Local draft state + debounce, or save on blur/Enter.

### [MEDIUM] Context value recreated every render; unlock state not shared
**Files:** `src/contexts/LanguageContext.tsx:28`, `src/hooks/useUnlockState.ts:8-64`
**Issue:** `value={{ language, setLanguage }}` is a new object each provider render → every
`useLanguage()` consumer re-renders. `useUnlockState` keeps `isUnlocked`/`disclaimerAccepted` in
component-local `useState`, so two mounted instances (e.g. `MenuView` and `CheckoutView`) don't observe
each other's `unlock()` until remount.
**Why:** Unnecessary re-renders; unlock semantics depend on remount timing rather than shared state.
**Fix:** `useMemo` the context value; back unlock state with a context/module store (or
`useSyncExternalStore`) so it is consistent across consumers.

### [MEDIUM] Duplicated / redundant state
**File:** `App.tsx:162-170`
**Issue:** `const initialViewMode = urlMode; const [viewMode, setViewMode] = useState(initialViewMode);`
then an effect copies `urlMode → viewMode`. `useUrlMode` always returns `'customer'` on first render, so
the initializer is dead and the value is set twice.
**Why:** Two sources of truth for the same view; easy to desync. (`useUrlMode` could return the parsed
mode synchronously during the first render instead.)
**Fix:** Derive `viewMode` from `urlMode` where possible, or initialize the hook's state from the URL in
its initializer and drop the sync effect.

### [MEDIUM] Fetch in effect without `AbortController`
**File:** `src/hooks/useVisitorTracking.ts:14-23, 36-87`
**Issue:** `getVisitorIP()` fetches `https://api64.ipify.org` on mount; cleanup only flips an
`isMounted` flag (no abort).
**Why:** The in-flight request and any subsequent state writes race unmount/StrictMode double-mount.
**Fix:** Pass a signal to `fetch` and abort in cleanup, or gate all post-await work behind the flag
(already partly done).

### [MEDIUM] Non-descriptive image `alt`
**Files:** `src/features/customer/views.tsx:60` (`alt="Grilled Chicken Hero"` hardcoded on the dynamic
hero image), `src/features/analytics/dataView.tsx:236` (`alt=""` on best-seller product images).
**Why:** Hero alt is wrong for other restaurants; product images marked decorative lose information
(acceptable only if the adjacent name is the accessible label — it is here, so lower severity).
**Fix:** Use the configured restaurant/item name, or mark truly decorative images `alt=""`.

### [MEDIUM] `React.*` namespace used without importing React
**Files:** `AdminLayout.tsx:22,36`, `ErrorBoundary.tsx:25`, `DashboardPage.tsx:8,22`,
`OrdersPage.tsx:22`, `ModuleHost.tsx:45,51`
**Why:** These files import named exports or nothing from `react` but reference `React.ReactNode` /
`React.ErrorInfo` / `React.DragEvent`, which is undefined (`TS2503`). Only a types issue (erased at
runtime) but it is why the ErrorBoundary "looks broken" in type land. **Defer to `typescript-reviewer`**;
React-side fix is `import type { ReactNode } from 'react'` etc.
**Note on `ErrorBoundary.tsx`:** as written it is a valid class component (`extends Component<Props,
State>` with `this.state`/`this.props` from the base class) and is correctly mounted in
`AdminModule.tsx:317` and `AdminLayout.tsx:134`. The "broken" claim in the brief is a type-resolution
artifact, not a runtime defect — flag for `typescript-reviewer`, not a React bug.

---

## Cross-cutting / deferred (not React-owned)
- `src/features/payments/mercadopago.ts:19` syntax error suppresses **all** `tsc` diagnostics — fix this
  first, or every downstream type finding stays hidden. (`typescript-reviewer`)
- `vite.config.ts:81-82` defines `process.env.API_KEY` / `process.env.GEMINI_API_KEY` from
  `GEMINI_API_KEY`. Not referenced in client code today, but `define` will inline the secret into the
  bundle if any dependency reads it. Remove unless a real client use exists. (security/typescript)
- `index.html:44-56` manually registers `/sw.js` while `vite-plugin-pwa` also generates/registers a
  service worker — double registration. (build/PWA)
- `AdminModule` is imported in `App.tsx:22` but never rendered (`viewMode === 'admin'` renders
  `KitchenView`); the admin tree is dead code that still ships — relevant to the secret-leak severity.
- Pattern-wide `any` (`kitchenView:any`, `dataView:any`, `views.tsx` `{...}: any`) — `typescript-reviewer`.

## Summary

| Severity | Count | Headline |
|---|---|---|
| CRITICAL | 2 | Hooks-in-switch (`App.tsx`), admin creds in client bundle (`AdminModule.tsx`) |
| HIGH | 8 | `OPS_TABS` ReferenceError, `statusConfig` crash, `Math.random()` in render, derived-state effect, broken memo dep, div-onClick a11y, unlabeled inputs, modal a11y, `useState(prop)` + nested component |
| MEDIUM | 8 | index keys, heavy render work, per-keystroke writes, context/state duplication, missing abort, alt text, `React.*` imports |

**Required before merge:** fix the two CRITICALs and the two render crashes; install ESLint with
`react-hooks` + `jsx-a11y` and wire `tsc`/lint into CI so this class of defect cannot reappear.