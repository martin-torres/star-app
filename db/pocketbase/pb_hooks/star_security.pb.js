/// <reference path="../pb_data/types.d.ts" />
//
// star-app server-side security hooks.
//
// These exist because three things were enforced in the browser, which means
// they were not enforced at all:
//   1. Manager/kitchen PINs were shipped to the client and compared with
//      `newCode === expectedPin` (src/features/locks/pins.tsx). Anyone could
//      read the PIN out of the settings response.
//   2. An anonymous client could POST an order with any `status`/`total`,
//      including status:"paid" and total:0.
//   3. Visitor rows were writable by anyone, so a customer could edit the
//      record of another visitor.
//
// Deployment: place next to pb_data as pb_hooks/star_security.pb.js and restart.

// ---------------------------------------------------------------------------
// helpers
// ---------------------------------------------------------------------------

// In-process sliding-window limiter. Resets when the PocketBase process
// restarts; adequate for PIN brute-force protection on a single instance.
const starAttempts = {};

function starClientKey(e, scope) {
  let ip = "unknown";
  try {
    ip = e.realIP() || "unknown";
  } catch (_) {
    /* ignore */
  }
  return scope + "|" + ip;
}

function starLimitCheck(key, max, windowMs) {
  const now = Date.now();
  const rec = starAttempts[key];
  if (!rec || now - rec.first > windowMs) {
    starAttempts[key] = { first: now, count: 0 };
    return { allowed: true, retryAfter: 0 };
  }
  if (rec.count >= max) {
    return {
      allowed: false,
      retryAfter: Math.ceil((rec.first + windowMs - now) / 1000),
    };
  }
  return { allowed: true, retryAfter: 0 };
}

function starRecordFailure(key) {
  const rec = starAttempts[key];
  if (rec) {
    rec.count += 1;
  } else {
    starAttempts[key] = { first: Date.now(), count: 1 };
  }
}

function starClearFailures(key) {
  delete starAttempts[key];
}

// Salted SHA-256. PINs are low-entropy by nature; rate limiting is what makes
// this safe, and the hash never leaves the server (private_settings has no API
// rules at all).
function starPinHash(salt, pin) {
  return $security.sha256(salt + ":" + pin);
}

// Mirrors the client's cart arithmetic exactly: unit price x quantity, or
// weight-in-grams/1000 x price-per-kg for weight-based items. Delivery fee is
// NOT part of `total` in this app (it is tracked separately).
function starComputeTotal(items) {
  let sum = 0;
  for (let i = 0; i < items.length; i++) {
    const it = items[i] || {};
    const qty = Number(it.quantity || 1);
    if (it.isWeightBased && it.weightPricePerKg) {
      sum += (Number(it.weightInGrams || 0) / 1000) * Number(it.weightPricePerKg) * qty;
    } else {
      sum += Number(it.price || 0) * qty;
    }
    // bundled promo children are priced by the bundle price, already in `price`
  }
  return Math.round(sum * 100) / 100;
}

// ---------------------------------------------------------------------------
// 1. Server-side PIN verification
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/verify-pin", (e) => {
  const info = e.requestInfo();
  const body = info.body || {};
  const restaurantId = String(body.restaurant_id || "");
  const scope = String(body.scope || "");
  const pin = String(body.pin || "");

  if (!restaurantId || (scope !== "admin" && scope !== "kitchen") || !pin) {
    return e.json(400, { ok: false, error: "restaurant_id, scope and pin are required" });
  }

  // Rate limiting: 5 failures per 10 minutes per IP per scope, PLUS a global
  // ceiling of 25 per restaurant+scope. The global cap is deliberate: this hook
  // keys on e.realIP(), which reads X-Forwarded-For, and a client that can
  // influence that header (any proxy that appends rather than overwrites) could
  // otherwise rotate its way to unlimited guesses. The ceiling holds regardless.
  const key = starClientKey(e, scope);
  const globalKey = "global|" + scope + "|" + restaurantId;
  const limit = starLimitCheck(key, 5, 10 * 60 * 1000);
  const globalLimit = starLimitCheck(globalKey, 25, 10 * 60 * 1000);
  if (!limit.allowed || !globalLimit.allowed) {
    return e.json(429, {
      ok: false,
      error: "too_many_attempts",
      retry_after_seconds: Math.max(limit.retryAfter, globalLimit.retryAfter),
    });
  }

  let settings;
  try {
    settings = $app.findFirstRecordByFilter(
      "private_settings",
      "restaurant_id = {:rid}",
      { rid: restaurantId },
    );
  } catch (_) {
    return e.json(404, { ok: false, error: "no_pin_configured" });
  }

  const salt = settings.getString("pin_salt");
  const expected =
    scope === "admin"
      ? settings.getString("admin_pin_hash")
      : settings.getString("kitchen_pin_hash");

  if (!salt || !expected) {
    // No PIN configured for this scope: refuse rather than allow.
    return e.json(404, { ok: false, error: "no_pin_configured" });
  }

  if (!$security.equal(starPinHash(salt, pin), expected)) {
    starRecordFailure(key);
    starRecordFailure(globalKey);
    const after = starLimitCheck(key, 5, 10 * 60 * 1000);
    return e.json(401, {
      ok: false,
      error: "invalid_pin",
      attempts_remaining: after.allowed ? 5 - (starAttempts[key] ? starAttempts[key].count : 0) : 0,
    });
  }

  starClearFailures(key);
  return e.json(200, { ok: true, scope: scope });
});

// ---------------------------------------------------------------------------
// 2. Manager-only: set / rotate a PIN
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/set-pin", (e) => {
  if (!e.hasSuperuserAuth()) {
    return e.json(403, { ok: false, error: "superuser_required" });
  }

  const info = e.requestInfo();
  const body = info.body || {};
  const restaurantId = String(body.restaurant_id || "");
  const scope = String(body.scope || "");
  const pin = String(body.pin || "");

  if (!restaurantId || (scope !== "admin" && scope !== "kitchen")) {
    return e.json(400, { ok: false, error: "restaurant_id and scope are required" });
  }
  if (!/^[0-9]{4,8}$/.test(pin)) {
    return e.json(400, { ok: false, error: "pin must be 4-8 digits" });
  }

  let rec;
  try {
    rec = $app.findFirstRecordByFilter(
      "private_settings",
      "restaurant_id = {:rid}",
      { rid: restaurantId },
    );
  } catch (_) {
    const collection = $app.findCollectionByNameOrId("private_settings");
    rec = new Record(collection);
    rec.set("restaurant_id", restaurantId);
    rec.set("pin_salt", $security.randomString(32));
  }

  rec.set(scope === "admin" ? "admin_pin_hash" : "kitchen_pin_hash", starPinHash(rec.getString("pin_salt"), pin));
  $app.save(rec);

  return e.json(200, { ok: true, scope: scope });
});

// ---------------------------------------------------------------------------
// 3. Order integrity - the server decides status and total
// ---------------------------------------------------------------------------

onRecordCreateRequest(
  (e) => {
    const rec = e.record;
    const items = rec.get("items");

    if (!items || typeof items.length !== "number" || items.length === 0) {
      return e.json(400, { ok: false, error: "items_required" });
    }

    // The client may not choose its own status: a transfer order is pending
    // until the manager confirms the proof, everything else starts as received.
    const method = String(rec.getString("payment_method") || "efectivo");
    rec.set("status", method === "transferencia" ? "pendiente_pago" : "recibido");

    // Totals are recomputed server-side so a crafted request cannot set total:0.
    rec.set("total", starComputeTotal(items));
    rec.set("subtotal", starComputeTotal(items));

    // Server time wins over a client-supplied timestamp.
    rec.set("timestamp", Date.now());
    rec.set("status_timestamps", { recibido: Date.now() });

    // Proof of payment must point at an uploaded file in this instance, or be empty.
    const proof = String(rec.getString("transfer_screenshot") || "");
    if (proof && proof.indexOf("/api/files/") !== 0 && proof.indexOf("http") !== 0) {
      rec.set("transfer_screenshot", "");
    }

    // Station state is server-owned (spec 005); clients cannot pre-set it.
    rec.set("kitchen_status", "pending");
    rec.set("bar_status", "pending");
    rec.set("foh_request_status", "");

    e.next();
  },
  "orders",
);

// ---------------------------------------------------------------------------
// 4. Visitor rows: server owns the counters
// ---------------------------------------------------------------------------

onRecordCreateRequest(
  (e) => {
    const rec = e.record;
    const now = new Date().toISOString();
    rec.set("first_visit", now);
    rec.set("last_visit", now);
    rec.set("visit_count", 1);
    e.next();
  },
  "visitors",
);

// Anonymous clients can no longer PATCH visitor rows (updateRule is null), so
// the "returning visitor" bump goes through this route instead. The server
// decides which fields change; the caller only supplies its session id.
routerAdd("POST", "/api/star/visitor-touch", (e) => {
  const info = e.requestInfo();
  const body = info.body || {};
  const sessionId = String(body.sessionId || "");
  const orderId = body.orderId ? String(body.orderId) : "";

  if (!sessionId) {
    return e.json(400, { ok: false, error: "sessionId is required" });
  }

  const key = starClientKey(e, "visitor");
  const limit = starLimitCheck(key, 60, 60 * 1000);
  if (!limit.allowed) {
    return e.json(429, { ok: false, error: "too_many_requests" });
  }

  let rec;
  try {
    rec = $app.findFirstRecordByFilter("visitors", "sessionId = {:sid}", { sid: sessionId });
  } catch (_) {
    return e.json(404, { ok: false, error: "visitor_not_found" });
  }

  rec.set("last_visit", new Date().toISOString());
  rec.set("visit_count", (Number(rec.get("visit_count")) || 0) + 1);

  if (orderId) {
    let orders = rec.get("associated_orders");
    if (!orders || typeof orders.length !== "number") {
      orders = [];
    }
    if (orders.indexOf(orderId) === -1) {
      orders.push(orderId);
      rec.set("associated_orders", orders);
    }
  }

  $app.save(rec);
  return e.json(200, { ok: true });
});
