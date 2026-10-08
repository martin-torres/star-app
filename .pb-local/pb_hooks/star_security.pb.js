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
//      record of another visitor. The Telegram bot token also shipped to the
//      browser inside the world-readable restaurant_settings blob.
//
// ── PocketBase 0.40.4 constraints (re-verified on the downloaded release) ───
// 1. Route/hook handlers CANNOT see module scope. Neither a top-level `const`
//    nor a top-level `function` is visible inside a routerAdd callback:
//        const SPIKE = "x"   -> ReferenceError: SPIKE is not defined
//        function h() {...}  -> ReferenceError: h is not defined
//    PocketBase reports the unhandled ReferenceError as an opaque 400
//    "Something went wrong while processing your request." EVERY handler below
//    is therefore fully inline and self-contained - including its own copy of
//    the rate limiter. Do not hoist anything into module-scope helpers, however
//    tempting; local `const`/`function` declarations INSIDE a handler are fine.
// 2. Registering the same METHOD+path twice PANICS PocketBase at startup
//    (total outage). Every path here is unique across pb_hooks/.
// 3. Cross-request state must use $app.store() (a module variable does not
//    persist and, per constraint 1, is not even reachable).
// 4. Request headers normalise to underscores (`x_kitchen_pin`).
//
// Every handler also wraps its body in try/catch so a programming error returns
// a 500 with `detail` instead of the opaque 400 above.
//
// Deployment: place next to pb_data as pb_hooks/star_security.pb.js and restart.

// ---------------------------------------------------------------------------
// 1. Server-side PIN verification  (POST /api/star/verify-pin)
//
// A 4-digit PIN is brute-forceable in isolation, so failures are limited per
// IP+scope (5 / 10 min) AND per restaurant+scope (25 / 10 min). The global cap
// is deliberate: e.realIP() reads X-Forwarded-For, and a caller who can
// influence that header could otherwise rotate its way to unlimited guesses.
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/verify-pin", (e) => {
  try {
    const body = (e.requestInfo() || {}).body || {};
    const restaurantId = String(body.restaurant_id || "");
    const scope = String(body.scope || "");
    const pin = String(body.pin || "");

    if (!restaurantId || (scope !== "admin" && scope !== "kitchen") || !pin) {
      return e.json(400, { ok: false, error: "restaurant_id, scope and pin are required" });
    }

    // ---- inline rate limiter (constraint 1) ----
    const store = $app.store();
    const now = Date.now();
    const windowMs = 10 * 60 * 1000;
    let ip = "unknown";
    try { ip = String(e.realIP() || "unknown"); } catch (ignored) { /* keep default */ }

    const key = scope + "|" + ip;
    const globalKey = "global|" + scope + "|" + restaurantId;

    const readRec = function (k) {
      try {
        const raw = store.get(k);
        if (raw) return JSON.parse(String(raw));
      } catch (ignored) { /* unreadable state is treated as fresh */ }
      return null;
    };
    const check = function (k, max) {
      const rec = readRec(k);
      if (!rec || (now - rec.first) > windowMs) {
        return { allowed: true, retryAfter: 0, first: now, count: 0 };
      }
      if (rec.count >= max) {
        return {
          allowed: false,
          retryAfter: Math.ceil((rec.first + windowMs - now) / 1000),
          first: rec.first,
          count: rec.count,
        };
      }
      return { allowed: true, retryAfter: 0, first: rec.first, count: rec.count };
    };

    const localLimit = check(key, 5);
    const globalLimit = check(globalKey, 25);
    if (!localLimit.allowed || !globalLimit.allowed) {
      return e.json(429, {
        ok: false,
        error: "too_many_attempts",
        retry_after_seconds: Math.max(localLimit.retryAfter, globalLimit.retryAfter),
      });
    }

    let settings = null;
    try {
      settings = $app.findFirstRecordByFilter(
        "private_settings",
        "restaurant_id = {:rid}",
        { rid: restaurantId },
      );
    } catch (ignored) { settings = null; }
    if (!settings) return e.json(404, { ok: false, error: "no_pin_configured" });

    const salt = settings.getString("pin_salt");
    const expected = scope === "admin"
      ? settings.getString("admin_pin_hash")
      : settings.getString("kitchen_pin_hash");
    if (!salt || !expected) return e.json(404, { ok: false, error: "no_pin_configured" });

    const candidate = $security.sha256(salt + ":" + pin);
    if (!$security.equal(candidate, expected)) {
      store.set(key, JSON.stringify({ first: localLimit.first, count: localLimit.count + 1 }));
      store.set(globalKey, JSON.stringify({ first: globalLimit.first, count: globalLimit.count + 1 }));
      const after = check(key, 5);
      return e.json(401, {
        ok: false,
        error: "invalid_pin",
        attempts_remaining: after.allowed ? (5 - after.count) : 0,
      });
    }

    store.remove(key);

    // Issue a short-lived staff session so kitchen/manager UIs can list/update
    // orders without a PocketBase user login (PIN is the gate).
    const sessionToken = $security.randomString(48);
    const sessionTtlMs = 8 * 60 * 60 * 1000;
    store.set("staffsess|" + sessionToken, JSON.stringify({
      restaurant_id: restaurantId,
      scope: scope,
      exp: now + sessionTtlMs,
    }));

    return e.json(200, {
      ok: true,
      scope: scope,
      session_token: sessionToken,
      expires_in_seconds: Math.floor(sessionTtlMs / 1000),
    });
  } catch (err) {
    return e.json(500, { ok: false, error: "verify_pin_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 1b. Kitchen board over PIN session (orders are not anon-readable)
// ---------------------------------------------------------------------------

routerAdd("GET", "/api/star/kitchen-orders", (e) => {
  try {
    const headerBag = (e.requestInfo() || {}).headers || {};
    const token = String(headerBag["x_star_session"] || headerBag["x-star-session"] || "");
    if (!token) return e.json(401, { ok: false, error: "staff_session_required" });
    let sess = null;
    try {
      const raw = $app.store().get("staffsess|" + token);
      if (raw) sess = JSON.parse(String(raw));
    } catch (ignored) { sess = null; }
    if (!sess || !sess.exp || Date.now() > Number(sess.exp)) {
      return e.json(401, { ok: false, error: "staff_session_required" });
    }
    if (sess.scope !== "kitchen" && sess.scope !== "admin") {
      return e.json(401, { ok: false, error: "staff_session_required" });
    }
    const restaurantId = String(sess.restaurant_id || "");
    const closed = ["entregado", "paid", "cancelled"];
    let filter = "";
    for (let i = 0; i < closed.length; i++) {
      filter += (filter ? " && " : "") + "status != '" + closed[i] + "'";
    }
    if (restaurantId) {
      filter += " && restaurant_id = '" + restaurantId + "'";
    }
    const records = e.app.findRecordsByFilter("orders", filter, "-timestamp", 200, 0);
    const items = [];
    for (let i = 0; i < records.length; i++) {
      items.push(records[i].publicExport());
    }
    return e.json(200, { ok: true, items: items });
  } catch (err) {
    return e.json(500, { ok: false, error: "kitchen_orders_failed", detail: String(err) });
  }
});

routerAdd("POST", "/api/star/kitchen-orders/{id}/status", (e) => {
  try {
    const headerBag = (e.requestInfo() || {}).headers || {};
    const token = String(headerBag["x_star_session"] || headerBag["x-star-session"] || "");
    if (!token) return e.json(401, { ok: false, error: "staff_session_required" });
    let sess = null;
    try {
      const raw = $app.store().get("staffsess|" + token);
      if (raw) sess = JSON.parse(String(raw));
    } catch (ignored) { sess = null; }
    if (!sess || !sess.exp || Date.now() > Number(sess.exp)) {
      return e.json(401, { ok: false, error: "staff_session_required" });
    }
    if (sess.scope !== "kitchen" && sess.scope !== "admin") {
      return e.json(401, { ok: false, error: "staff_session_required" });
    }
    let id = "";
    try { id = String(e.request.pathValue("id") || ""); } catch (ignored) { id = ""; }
    const body = (e.requestInfo() || {}).body || {};
    const status = String(body.status || "");
    const allowed = [
      "pendiente_pago", "recibido", "preparando", "empaquetando",
      "listo", "en_camino", "entregado", "paid", "cancelled",
    ];
    if (!id || allowed.indexOf(status) === -1) {
      return e.json(400, { ok: false, error: "id_and_status_required" });
    }
    const order = e.app.findRecordById("orders", id);
    if (!order) return e.json(404, { ok: false, error: "not_found" });
    if (sess.restaurant_id && String(order.getString("restaurant_id")) !== String(sess.restaurant_id)) {
      return e.json(403, { ok: false, error: "wrong_restaurant" });
    }
    order.set("status", status);
    let stamps = order.get("status_timestamps");
    if (typeof stamps !== "string") stamps = String(stamps);
    try { stamps = JSON.parse(stamps); } catch (ignored) { stamps = {}; }
    if (!stamps || typeof stamps !== "object") stamps = {};
    stamps[status] = Date.now();
    order.set("status_timestamps", JSON.stringify(stamps));
    e.app.save(order);
    return e.json(200, { ok: true, item: order.publicExport() });
  } catch (err) {
    return e.json(500, { ok: false, error: "kitchen_status_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 2. Set / rotate a PIN  (POST /api/star/set-pin)  - superuser only
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/set-pin", (e) => {
  try {
    if (!e.hasSuperuserAuth()) {
      return e.json(403, { ok: false, error: "superuser_required" });
    }

    const body = (e.requestInfo() || {}).body || {};
    const restaurantId = String(body.restaurant_id || "");
    const scope = String(body.scope || "");
    const pin = String(body.pin || "");

    if (!restaurantId || (scope !== "admin" && scope !== "kitchen")) {
      return e.json(400, { ok: false, error: "restaurant_id and scope are required" });
    }
    if (!/^[0-9]{4,8}$/.test(pin)) {
      return e.json(400, { ok: false, error: "pin must be 4-8 digits" });
    }

    let rec = null;
    try {
      rec = $app.findFirstRecordByFilter(
        "private_settings",
        "restaurant_id = {:rid}",
        { rid: restaurantId },
      );
    } catch (ignored) {
      const collection = $app.findCollectionByNameOrId("private_settings");
      rec = new Record(collection);
      rec.set("restaurant_id", restaurantId);
      rec.set("pin_salt", $security.randomString(32));
    }

    const salt = rec.getString("pin_salt") || $security.randomString(32);
    rec.set("pin_salt", salt);
    const hash = $security.sha256(salt + ":" + pin);
    rec.set(scope === "admin" ? "admin_pin_hash" : "kitchen_pin_hash", hash);
    $app.save(rec);

    return e.json(200, { ok: true, scope: scope });
  } catch (err) {
    return e.json(500, { ok: false, error: "set_pin_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 3. Customer order tracking  (GET /api/star/order-status?id=&session_id=)
//
// Orders are NOT anonymously listable. The tracking screen owns one order id
// and one client session id, so this route returns exactly ONE order and only
// when the session id matches. A mismatch answers 404, never 403 - a caller
// must not be able to probe which order ids exist.
// ---------------------------------------------------------------------------

routerAdd("GET", "/api/star/order-status", (e) => {
  try {
    const query = (e.requestInfo() || {}).query || {};
    const id = String(query.id || "");
    const sessionId = String(query.session_id || "");

    if (!id || !sessionId) {
      return e.json(400, { ok: false, error: "id and session_id are required" });
    }

    // ---- inline rate limiter: polling is legitimate, so the cap is generous
    //      (120 requests / minute / IP) but not unlimited.
    const store = $app.store();
    const now = Date.now();
    const windowMs = 60 * 1000;
    let ip = "unknown";
    try { ip = String(e.realIP() || "unknown"); } catch (ignored) { /* keep default */ }
    const key = "orderstatus|" + ip;

    let rec = null;
    try {
      const raw = store.get(key);
      if (raw) rec = JSON.parse(String(raw));
    } catch (ignored) { rec = null; }
    if (!rec || (now - rec.first) > windowMs) rec = { first: now, count: 0 };
    if (rec.count >= 120) {
      return e.json(429, { ok: false, error: "too_many_requests" });
    }
    store.set(key, JSON.stringify({ first: rec.first, count: rec.count + 1 }));

    let record = null;
    try { record = e.app.findRecordById("orders", id); } catch (ignored) { record = null; }
    if (!record) return e.json(404, { ok: false, error: "not_found" });
    if (String(record.getString("session_id") || "") !== sessionId) {
      return e.json(404, { ok: false, error: "not_found" });
    }

    // Plain object so the payload marshals exactly like a collection record.
    return e.json(200, JSON.parse(JSON.stringify(record)));
  } catch (err) {
    return e.json(500, { ok: false, error: "order_status_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 4. Visitor upsert  (POST /api/star/visitor-touch)
//
// Anonymous clients cannot PATCH visitor rows (updateRule is null), so the
// "returning visitor" bump and the order association go through this route.
// It UPSERTS: the first touch for an unknown session creates the row (counters
// are server-owned), later touches bump it. The caller only supplies its
// session id, an optional order id and optional device hints - never counters.
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/visitor-touch", (e) => {
  try {
    const body = (e.requestInfo() || {}).body || {};
    const sessionId = String(body.sessionId || "");
    const orderId = body.orderId ? String(body.orderId) : "";

    if (sessionId.length < 6 || sessionId.length > 128) {
      return e.json(400, { ok: false, error: "sessionId (6..128 chars) is required" });
    }

    // ---- inline rate limiter: 60 touches / minute / IP.
    const store = $app.store();
    const now = Date.now();
    const windowMs = 60 * 1000;
    let ip = "unknown";
    try { ip = String(e.realIP() || "unknown"); } catch (ignored) { /* keep default */ }
    const key = "visitor|" + ip;

    let rec = null;
    try {
      const raw = store.get(key);
      if (raw) rec = JSON.parse(String(raw));
    } catch (ignored) { rec = null; }
    if (!rec || (now - rec.first) > windowMs) rec = { first: now, count: 0 };
    if (rec.count >= 60) {
      return e.json(429, { ok: false, error: "too_many_requests" });
    }
    store.set(key, JSON.stringify({ first: rec.first, count: rec.count + 1 }));

    const nowIso = new Date().toISOString();

    let visitor = null;
    try {
      visitor = $app.findFirstRecordByFilter("visitors", "sessionId = {:sid}", { sid: sessionId });
    } catch (ignored) { visitor = null; }

    if (!visitor) {
      const collection = $app.findCollectionByNameOrId("visitors");
      visitor = new Record(collection);
      visitor.set("sessionId", sessionId);
      visitor.set("first_visit", nowIso);
      visitor.set("last_visit", nowIso);
      visitor.set("visit_count", 1);
      if (body.restaurant_id) visitor.set("restaurant_id", String(body.restaurant_id));
      if (body.userAgent) visitor.set("userAgent", String(body.userAgent));
      if (body.deviceType) visitor.set("deviceType", String(body.deviceType));
      if (body.isPwaInstalled === true) visitor.set("isPwaInstalled", true);
      if (orderId) visitor.set("associated_orders", [orderId]);
      $app.save(visitor);
      return e.json(200, { ok: true, created: true, visit_count: 1 });
    }

    visitor.set("last_visit", nowIso);
    const count = (Number(visitor.get("visit_count")) || 0) + 1;
    visitor.set("visit_count", count);

    if (orderId) {
      // `associated_orders` is a `json` field: read it back as raw JSON text
      // (never index the Go []byte directly) and write it back as a JSON string.
      let orders = visitor.get("associated_orders");
      if (typeof orders !== "string") orders = String(orders);
      try { orders = JSON.parse(orders); } catch (ignored) { orders = null; }
      if (!orders || typeof orders.length !== "number") orders = [];
      if (orders.indexOf(orderId) === -1) {
        orders.push(orderId);
        visitor.set("associated_orders", JSON.stringify(orders));
      }
    }

    $app.save(visitor);
    return e.json(200, { ok: true, created: false, visit_count: count });
  } catch (err) {
    return e.json(500, { ok: false, error: "visitor_touch_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 5. Server-side Telegram send  (POST /api/star/notify-order)
//
// The bot token is an outbound credential and must never reach the browser, so
// the client no longer calls api.telegram.org itself: it POSTs the order id
// here and the server reads the token from private_settings (falling back to
// the legacy restaurant_settings.data blob, which the enrich hook below strips
// from every client response).
//
// Anti-spam: the message is sent at most once per order id, only for orders
// created in the last 15 minutes, and 10 requests / minute / IP.
// Body: { order_id }
// ---------------------------------------------------------------------------

routerAdd("POST", "/api/star/notify-order", (e) => {
  try {
    const body = (e.requestInfo() || {}).body || {};
    const orderId = String(body.order_id || body.orderId || "");
    if (!orderId) return e.json(400, { ok: false, error: "order_id is required" });

    const store = $app.store();
    const now = Date.now();

    // ---- inline rate limiter ----
    const windowMs = 60 * 1000;
    let ip = "unknown";
    try { ip = String(e.realIP() || "unknown"); } catch (ignored) { /* keep default */ }
    const rateKey = "notify|" + ip;
    let rec = null;
    try {
      const raw = store.get(rateKey);
      if (raw) rec = JSON.parse(String(raw));
    } catch (ignored) { rec = null; }
    if (!rec || (now - rec.first) > windowMs) rec = { first: now, count: 0 };
    if (rec.count >= 10) return e.json(429, { ok: false, error: "too_many_requests" });
    store.set(rateKey, JSON.stringify({ first: rec.first, count: rec.count + 1 }));

    // ---- idempotency: one notification per order ----
    const doneKey = "notified|" + orderId;
    if (store.get(doneKey)) {
      return e.json(200, { ok: true, sent: false, reason: "already_sent" });
    }

    let order = null;
    try { order = e.app.findRecordById("orders", orderId); } catch (ignored) { order = null; }
    if (!order) return e.json(404, { ok: false, error: "order_not_found" });

    // ---- refuse to notify about stale orders (blocks replay spam) ----
    const ts = Number(order.get("timestamp")) || 0;
    if (!ts || (now - ts) > 15 * 60 * 1000) {
      return e.json(400, { ok: false, error: "order_too_old" });
    }

    const restaurantId = String(order.getString("restaurant_id") || "");

    // ---- resolve credentials server-side ----
    let token = "";
    let chatId = "";
    try {
      const priv = $app.findFirstRecordByFilter(
        "private_settings",
        "restaurant_id = {:rid}",
        { rid: restaurantId },
      );
      token = String(priv.getString("telegram_bot_token") || "");
      chatId = String(priv.getString("telegram_chat_id") || "");
    } catch (ignored) { /* no private row yet - fall through to the blob */ }

    if (!token || !chatId) {
      try {
        const settings = $app.findFirstRecordByFilter(
          "restaurant_settings",
          "restaurant_id = {:rid}",
          { rid: restaurantId },
        );
        let blob = settings.get("data");
        if (typeof blob !== "string") blob = String(blob);
        try { blob = JSON.parse(blob); } catch (ignored) { blob = null; }
        if (blob && typeof blob === "object") {
          if (!token) token = String(blob.telegramBotToken || "");
          if (!chatId) chatId = String(blob.telegramChatId || "");
        }
      } catch (ignored) { /* not configured in the blob either */ }
    }

    if (!token || !chatId) {
      return e.json(200, { ok: true, sent: false, reason: "not_configured" });
    }

    // ---- build the message (same shape the client used to send) ----
    const statusLabels = {
      recibido: "Recibido",
      preparando: "Preparando",
      empaquetando: "Empaquetando",
      listo: "Listo para recoger",
      en_camino: "En camino",
      entregado: "Entregado",
      pendiente_pago: "Pendiente de pago",
    };
    const paymentLabels = {
      efectivo: "Efectivo",
      transferencia: "Transferencia",
      tarjeta: "Tarjeta",
    };
    const orderType = String(order.getString("order_type") || "");
    const status = String(order.getString("status") || "");
    const payment = String(order.getString("payment_method") || "");

    let itemsText = "";
    const items = order.get("items");
    if (items && typeof items.length === "number") {
      for (let i = 0; i < items.length; i++) {
        const it = items[i] || {};
        const qty = Number(it.quantity || 1);
        itemsText += "\u2022 " + String(it.name || "item") + " x" + qty + "\n";
      }
    }

    const message =
      "\uD83D\uDD14 NUEVO PEDIDO\n" +
      "Cliente: " + String(order.getString("customer_name") || "Invitado") + "\n" +
      "Tipo: " + (orderType === "delivery" ? "Delivery" : (orderType === "dine-in" ? "Dine-in" : "Pickup")) + "\n" +
      "Pago: " + (paymentLabels[payment] || payment || "-") + "\n" +
      "Total: $" + String(order.get("total") || 0) + "\n" +
      "Status: " + (statusLabels[status] || status) + "\n" +
      "Items:\n" + itemsText;

    let ok = false;
    let detail = "";
    try {
      const res = $http.send({
        url: "https://api.telegram.org/bot" + token + "/sendMessage",
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id: chatId, text: message, parse_mode: "Markdown" }),
        timeout: 10,
      });
      ok = res.statusCode >= 200 && res.statusCode < 300;
      if (!ok) detail = "telegram_status_" + res.statusCode;
    } catch (ignored) {
      detail = "telegram_request_failed";
    }

    if (ok) {
      store.set(doneKey, "1");
      return e.json(200, { ok: true, sent: true });
    }
    // Deliberately not a 500: the order is fine, only the notification failed.
    return e.json(200, { ok: true, sent: false, reason: detail || "send_failed" });
  } catch (err) {
    return e.json(500, { ok: false, error: "notify_order_failed", detail: String(err) });
  }
});

// ---------------------------------------------------------------------------
// 6. Order integrity - the server decides status and total
// ---------------------------------------------------------------------------

onRecordCreateRequest(
  (e) => {
    try {
      const rec = e.record;

      // A PocketBase `json` field reaches JS as a Go []byte - an object with
      // numeric keys whose String() is the raw JSON text. `items.length` on the
      // raw value is the BYTE count, so it must be decoded first (a byte array
      // also "passes" a naive length check while yielding no usable fields).
      let items = rec.get("items");
      if (typeof items !== "string") {
        items = String(items);
      }
      try { items = JSON.parse(items); } catch (ignored) { items = null; }

      if (!items || typeof items.length !== "number" || items.length === 0) {
        return e.json(400, { ok: false, error: "items_required" });
      }

      // ---- inline total: unit price x quantity, or grams/1000 x price-per-kg.
      //      Delivery fee is NOT part of `total` in this app (tracked separately).
      let sum = 0;
      for (let i = 0; i < items.length; i++) {
        const it = items[i] || {};
        const qty = Number(it.quantity || 1);
        if (it.isWeightBased && it.weightPricePerKg) {
          sum += (Number(it.weightInGrams || 0) / 1000) * Number(it.weightPricePerKg) * qty;
        } else {
          sum += Number(it.price || 0) * qty;
        }
      }
      const total = Math.round(sum * 100) / 100;

      // The client may not choose its own status: a transfer order is pending
      // until the manager confirms the proof, everything else starts as received.
      const method = String(rec.getString("payment_method") || "efectivo");
      rec.set("status", method === "transferencia" ? "pendiente_pago" : "recibido");

      rec.set("total", total);
      rec.set("subtotal", total);

      // Server time wins over a client-supplied timestamp.
      const nowMs = Date.now();
      rec.set("timestamp", nowMs);
      rec.set("status_timestamps", JSON.stringify({ recibido: nowMs }));

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
    } catch (err) {
      return e.json(500, { ok: false, error: "order_sanitise_failed", detail: String(err) });
    }
  },
  "orders",
);

// ---------------------------------------------------------------------------
// 7. Visitor rows: server owns the counters on a direct API create
// ---------------------------------------------------------------------------

onRecordCreateRequest(
  (e) => {
    try {
      const rec = e.record;
      const now = new Date().toISOString();
      rec.set("first_visit", now);
      rec.set("last_visit", now);
      rec.set("visit_count", 1);
      e.next();
    } catch (err) {
      return e.json(500, { ok: false, error: "visitor_sanitise_failed", detail: String(err) });
    }
  },
  "visitors",
);

// ---------------------------------------------------------------------------
// 7b. Dine-in bill paid → mark linked orders paid (anon cannot update orders)
// ---------------------------------------------------------------------------

onRecordAfterCreateSuccess(
  (e) => {
    try {
      const rec = e.record;
      const status = String(rec.getString("status") || "");
      if (status !== "paid") return;

      let orderIds = rec.get("order_ids");
      if (typeof orderIds !== "string") orderIds = String(orderIds);
      try { orderIds = JSON.parse(orderIds); } catch (ignored) { orderIds = null; }
      if (!orderIds || typeof orderIds.length !== "number") orderIds = [];

      const nowMs = Date.now();
      for (let i = 0; i < orderIds.length; i++) {
        const id = String(orderIds[i] || "");
        if (!id) continue;
        try {
          const order = e.app.findRecordById("orders", id);
          if (!order) continue;
          order.set("status", "paid");
          let stamps = order.get("status_timestamps");
          if (typeof stamps !== "string") stamps = String(stamps);
          try { stamps = JSON.parse(stamps); } catch (ignored) { stamps = {}; }
          if (!stamps || typeof stamps !== "object") stamps = {};
          stamps.paid = nowMs;
          order.set("status_timestamps", JSON.stringify(stamps));
          e.app.save(order);
        } catch (ignored) { /* best-effort per order */ }
      }

      // Free the table on the floor plan once the bill is settled.
      const tableId = String(rec.getString("table_id") || "");
      if (tableId) {
        try {
          const table = e.app.findRecordById("restaurant_tables", tableId);
          if (table) {
            table.set("is_available", true);
            e.app.save(table);
          }
        } catch (ignored) { /* table free is best-effort */ }
      }
    } catch (err) {
      console.log("[star] bill_requests after-create failed:", String(err));
    }
  },
  "bill_requests",
);

// ---------------------------------------------------------------------------
// 8. Strip the Telegram bot token from every client-visible settings response
//
// restaurant_settings.data is world-readable and used to carry telegramBotToken.
// The token now lives in private_settings (no API rules at all) and this hook
// removes the legacy copy from the serialised record. Superuser responses (the
// dashboard) keep the field so an operator can still read/migrate it.
// ---------------------------------------------------------------------------

onRecordEnrich(
  (e) => {
    try {
      const info = e.requestInfo;
      if (info && info.hasSuperuserAuth()) return;

      const rec = e.record;
      if (!rec) return;
      // json fields arrive as a Go []byte whose String() is the JSON text.
      let blob = rec.get("data");
      if (typeof blob !== "string") blob = String(blob);
      try { blob = JSON.parse(blob); } catch (ignored) { return; }
      if (!blob || typeof blob !== "object") return;
      if (!("telegramBotToken" in blob)) return;

      delete blob.telegramBotToken;
      rec.set("data", JSON.stringify(blob));
    } catch (ignored) { /* never break a read because of redaction */ }
  },
  "restaurant_settings",
);
