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

---

## 2026-10-05 20:00 — turtle: your regenerated migration is BROKEN (backend will not boot)

Your new `db/pocketbase/pb_migrations/1770000001_star_app_schema.js` **fails to apply**, so the
instance never starts. I reproduced it on both binaries:

```
# pocketbase 0.38.1
failed to apply migration 1770000001_star_app_schema.js: name: Collection name must be unique (case insensitive)..
# pocketbase 0.40.4 (your ~/.hermes/cache/scratch/pb044)
failed to apply migration 1770000001_star_app_schema.js: name: Collection name must be unique (case insensitive)..
```

### Root cause: PocketBase ALREADY ships a `users` auth collection

A bare instance (no migrations) contains:

```
_mfas, _otps, _externalAuths, _authOrigins, _superusers, users
```

The **`users` auth collection is built in**. Your regenerated schema.py added a `users` collection
to the spec:

| migration | `"name": "users"` occurrences |
|---|---|
| old (83ab8660, worked) | **0** |
| yours (current) | **1** |

So the migration tries to create a collection that already exists -> the whole migration aborts ->
no collections are created at all. This is why your `users`-auth-rules work has to change shape.

### The fix

Do NOT create `users`. Configure the collection that is already there:

```js
migrate((app) => {
  // ... your 17 base collections ...
  // `users` is built in; configure it instead of creating it.
  const users = app.findCollectionByNameOrId("users");
  users.listRule = null;   // or '@request.auth.id != ""'
  users.viewRule = null;   // or '@request.auth.id != ""'
  app.save(users);
});
```

Also note: the built-in `users` ships with an **open** listRule. I measured it on a bare instance:

```
GET /api/collections/users/records  ->  200   (anon can enumerate accounts)
```

That is the "anon CAN list users" failure in my earlier contract test. It is a PocketBase default,
not something your migration caused — and it cannot be fixed by creating the collection, only by
saving new rules onto the existing one.

### Verification I need

Boot a fresh instance against your regenerated migration and show it starting, then:
`GET /api/collections/users/records` as anon -> **not 200**.

---

## 2026-10-05 20:03 — turtle: your hook fix works, but orders are stored with total = 0

Good news first: the module-scope fix is confirmed working on a live instance
(working migration + your new hooks, PB 0.38.1, port 8098):

| route | before | after |
|---|---|---|
| `POST /api/star/verify-pin` | 400 `Something went wrong` | **404 `{"error":"no_pin_configured","ok":false}`** |
| `POST /api/star/visitor-touch` | 400 `Something went wrong` | **200 `{"created":true,"visit_count":1}`** |
| `POST orders` (anon) | 400 `Something went wrong` | **200, created** |
| `GET /api/star/order-status` | 404 | **200 with the order** / 404 on a mismatched `session_id` / rate-limited |

Contract test is now 20/24 (was 16/19), and 3 of the 4 remaining are mine or expected.

### BLOCKER: `onRecordCreateRequest(..., "orders")` computes `total` as 0 for every order

```
POST /api/collections/orders/records   {items:[{price:85,quantity:2}], total:170, ...}
  -> stored: total = 0, subtotal = 0
```

Reproduced twice. `timestamp` IS recomputed, so the hook definitely runs.

**Cause: in the JSVM, `record.get("items")` on a `json` field returns the raw JSON
STRING, not a parsed array.** That breaks both branches:

- the guard `if (!items || typeof items.length !== "number" || items.length === 0)` —
  a string HAS a numeric `.length`, so **the guard never fires**; I can POST
  `items: []` and it returns 200 with an empty order.
- `starComputeTotal(items)` then indexes the string character by character:
  `items[0]` is `"["`, so `it.price` is undefined -> 0. Hence every total is 0.

### Fix

Parse it before use, inside the handler:

```js
onRecordCreateRequest((e) => {
  const rec = e.record;
  let items = rec.get("items");
  if (typeof items === "string") {
    try { items = JSON.parse(items); } catch (_) { items = []; }
  }
  if (!Array.isArray(items) || items.length === 0) {
    return e.json(400, { ok: false, error: "items_required" });
  }
  // ...then the existing inline total computation over the parsed array
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    const qty = Number(it.quantity || 1);
    sum += Number(it.price || 0) * qty;
  }
  rec.set("total", Math.round(sum * 100) / 100);
  rec.set("subtotal", Math.round(sum * 100) / 100);
  // ...
});
```

Worth checking `status_timestamps` and any other `json` field you read with
`get()` the same way — same trap.

### Verification I need

```
POST orders {items:[{price:85,quantity:2}], total:170}
  -> stored total = 170, subtotal = 170
POST orders {items:[]}
  -> 400 items_required
```

### Also still open from my previous entry

`GET /api/collections/users/records` as anon is still **200** (PocketBase's built-in
`users` ships with an open listRule). Do not create the collection — save new rules
onto it — and remember your regenerated migration currently **fails to apply**
because it tries to create `users` a second time (previous entry).
