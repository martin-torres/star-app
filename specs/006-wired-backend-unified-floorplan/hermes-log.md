# Hermes log + E2E findings

> **READ THE TOP ENTRY FIRST — it is a proven, blocking bug in your file.**

---

## 2026-10-05 19:42 — turtle: E2E against a real PocketBase instance (PROVEN ROOT CAUSE)

I booted your migration + hooks on a real instance (`pocketbase 0.38.1`, `127.0.0.1:8096`,
`--dir` scratch, `--migrationsDir db/pocketbase/pb_migrations`, `--hooksDir db/pocketbase/pb_hooks`).
All 17 app collections migrated cleanly, including `users` and `private_settings`. Then I called the API.

### Result: 16/19 checks pass. Three real failures, one root cause.

| # | Check | Result |
|---|---|---|
| 1 | anon CANNOT list `orders` / `visitors` / `staff` / `import_jobs` / `private_settings` | **PASS** (403 each) |
| 2 | anon CAN list `menu_items` / `restaurant_tables` / `floor_props` | **PASS** (200) |
| 3 | `POST /api/star/verify-pin` | **FAIL — 400** `Something went wrong while processing your request.` |
| 4 | `POST /api/star/visitor-touch` | **FAIL — 400** (same opaque error) |
| 5 | anon `POST /api/collections/orders/records` | **FAIL — 400** (same opaque error) |
| 6 | `GET /api/star/order-status` | **FAIL — 404** (not implemented yet — your task 2) |
| 7 | anon CAN list `users` | **FAIL — 200** (open `listRule`; accounts enumerable) |

### Root cause of #3, #4, #5 — PROVEN, not inferred

**PocketBase handlers cannot see module scope.** Every `routerAdd`/`onRecord*` callback runs in an
isolated context, so `starAttempts`, `starClientKey()`, `starLimitCheck()`, `starRecordFailure()`,
`starClearFailures()`, `starPinHash()`, `starComputeTotal()` are all **undefined** inside the
handlers. Referencing one throws a `ReferenceError`, which PocketBase surfaces as the opaque
`400 "Something went wrong while processing your request."`

I proved it with a two-route probe on the same instance (identical except for scope):

```
POST /api/star/probe-module-scope   -> {"message":"Something went wrong while processing your request.","status":400}
POST /api/star/probe-inline         -> {"value":"INLINE_OK"}
```

- `/probe-module-scope` referenced a module-level `const` + `function` -> **400**
- `/probe-inline` did the same work with only locals -> **200**

Consequence: **the entire order flow is dead** (`orders` create calls `starComputeTotal`), PIN
verification always 400s, and visitor tracking always 400s. This outranks everything else.

### The fix (yours, `db/pocketbase/pb_hooks/star_security.pb.js`)

Inline every helper into the handler that uses it. Do not rely on module scope. Cross-request state
(only the rate limiter needs it) must use `$app.store()` — a module `const starAttempts = {}` does
not survive into the handler context.

Sketch that matches the proven-working pattern:

```js
routerAdd("POST", "/api/star/verify-pin", (e) => {
  // 1) inline the body parse
  const info = e.requestInfo();
  const body = info.body || {};
  // 2) inline the rate limiter, state in $app.store()
  const now = Date.now();
  const storeKey = "star_pin_attempts";
  let attempts = $app.store().get(storeKey) || {};
  // 3) inline the hash: $security.sha256(salt + ":" + pin)  <- no wrapper function
  // 4) inline the total computation inside onRecordCreateRequest for "orders"
  ...
});
```

Same treatment for `onRecordCreateRequest(..., "orders")` (inline the items/total/status logic) and
for `/api/star/visitor-touch`.

### Also required

- `users`: `listRule`/`viewRule` must not be `""`. Use `null` (superuser/self only) or
  `@request.auth.id != ""` — anon must not enumerate accounts.
- Implement `GET /api/star/order-status?id=&session_id=` (one order only, never a list).

### How to reproduce exactly what I ran

```
mkdir -p /tmp/pb/{pb_data,pb_migrations,pb_hooks}
cp db/pocketbase/pb_migrations/*.js /tmp/pb/pb_migrations/
cp db/pocketbase/pb_hooks/*.js /tmp/pb/pb_hooks/
pocketbase serve --http=127.0.0.1:8096 --dir /tmp/pb/pb_data \
  --migrationsDir /tmp/pb/pb_migrations --hooksDir /tmp/pb/pb_hooks
pocketbase superuser upsert e2e@local.test e2e-password-123 --dir /tmp/pb/pb_data
# then: POST /api/star/probe-module-scope vs /api/star/probe-inline
```

A live instance is already running for you at `127.0.0.1:8096` (superuser `e2e@local.test` /
`e2e-password-123`, seeded with restaurant slug `azucar-y-nuez`, 6 tables covering every shape,
1 menu item with `station=kitchen`, a floor plan + prop). Hot-reloads hooks on file change.

### Definition of done for this fix

Re-run the contract test and show the output: `python3 ~/jcode-scratch/star-e2e.py`
Target: **19/19**, specifically
- anon order create -> 201, and a forged `status:"paid", total:0` order comes back stored as
  `status:"recibido"` with a server-computed `total`
- anon `GET` of that order -> not 200
- `verify-pin` -> 401 for a wrong PIN, 404 for `no_pin_configured`, never 400
- anon list `users` -> not 200
- `GET /api/star/order-status?id=&session_id=` -> not 404

Append your entry below this one.
