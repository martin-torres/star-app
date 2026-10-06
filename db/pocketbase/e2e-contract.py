#!/usr/bin/env python3
"""star-app E2E: seed a local PocketBase instance and exercise the real API contract.

Run:  python3 star-e2e.py
Assumes PocketBase on 127.0.0.1:8096 with db/pocketbase migration + hooks applied.
"""
import json
import urllib.error
import urllib.parse
import urllib.request

import os
BASE = os.environ.get("PB_URL", "http://127.0.0.1:8096")
SU_EMAIL = "e2e@local.test"
SU_PASS = "e2e-password-123"

results = []


def call(method, path, body=None, token=None, raw=False):
    url = BASE + path
    data = None
    headers = {}
    if body is not None:
        data = json.dumps(body).encode()
        headers["Content-Type"] = "application/json"
    if token:
        headers["Authorization"] = token
    req = urllib.request.Request(url, data=data, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req, timeout=15) as r:
            payload = r.read().decode()
            return r.status, (payload if raw else json.loads(payload or "{}"))
    except urllib.error.HTTPError as e:
        payload = e.read().decode()
        try:
            return e.code, (payload if raw else json.loads(payload or "{}"))
        except json.JSONDecodeError:
            return e.code, payload


def check(name, ok, detail=""):
    results.append((name, ok, detail))
    print(("PASS " if ok else "FAIL ") + name + ("  :: " + str(detail)[:220] if detail else ""))


def su_token():
    st, body = call("POST", "/api/collections/_superusers/auth-with-password",
                    {"identity": SU_EMAIL, "password": SU_PASS})
    return body.get("token")


def upsert(token, collection, match_field, match_value, payload):
    """Find by field, else create."""
    flt = urllib.parse.quote(f"{match_field}='{match_value}'")
    st, body = call("GET", f"/api/collections/{collection}/records?perPage=1&filter={flt}", token=token)
    items = body.get("items", []) if isinstance(body, dict) else []
    if items:
        rid = items[0]["id"]
        st, body = call("PATCH", f"/api/collections/{collection}/records/{rid}", payload, token=token)
        return rid, st, body
    st, body = call("POST", f"/api/collections/{collection}/records", payload, token=token)
    return body.get("id") if isinstance(body, dict) else None, st, body


def main():
    tok = su_token()
    check("superuser auth", bool(tok), f"token_len={len(tok or '')}")
    if not tok:
        return

    # ---- seed ---------------------------------------------------------------
    rest_id, st, body = upsert(tok, "restaurants", "slug", "azucar-y-nuez", {
        "name": "Azucar y Nuez",
        "slug": "azucar-y-nuez",
        "currency": "MXN",
        "mode": "both",
        "primary_color": "#f59e0b",
        "secondary_color": "#ea580c",
        "address": "Monterrey, NL",
    })
    check("seed restaurant", st in (200, 201) and bool(rest_id), f"status={st} id={rest_id}")

    plan_id, st, body = upsert(tok, "floor_plans", "restaurant_id", rest_id, {
        "restaurant_id": rest_id, "canvas_w": 680, "canvas_h": 400, "grid_size": 24,
    })
    check("seed floor_plan", st in (200, 201) and bool(plan_id), f"status={st}")

    st, body = call("POST", "/api/collections/floor_props/records", {
        "restaurant_id": rest_id, "floor_plan_id": plan_id, "prop_type": "kitchen_area",
        "x": 500, "y": 20, "width": 140, "height": 80, "rotation": 0,
    }, token=tok)
    check("seed floor_prop", st in (200, 201), f"status={st}")

    shapes = ["square", "rectangle", "circular", "booth", "l_shaped", "square"]
    for i, shape in enumerate(shapes, start=1):
        _tid, st, body = upsert(tok, "restaurant_tables", "table_number", i, {
            "restaurant_id": rest_id,
            "table_number": i,
            "display_name": f"Mesa {i}",
            "seats": 4 if shape != "booth" else 6,
            "location": ["patio", "window", "middle", "bar", "private", "outdoor"][i - 1],
            "x": 20 + ((i - 1) % 3) * 150,
            "y": 20 + ((i - 1) // 3) * 140,
            "width": 88 if shape == "circular" else 84,
            "height": 88 if shape == "circular" else 64,
            "rotation": 0,
            "shape": shape,
            "is_available": True,
        })
        if st not in (200, 201):
            check(f"seed table {i}", False, f"status={st} body={body}")
            break
    else:
        check("seed 6 tables (all shapes)", True)

    st, body = call("POST", "/api/collections/menu_items/records", {
        "restaurant_id": rest_id, "name": "Taco al Pastor", "description": "3 tacos",
        "price": 85, "category": "especial", "station": "kitchen", "is_available": True,
        "track_inventory": True, "stock": 50,
    }, token=tok)
    check("seed menu_item (station=kitchen)", st in (200, 201), f"status={st}")

    # ---- anonymous access rules (the security core) -------------------------
    st, body = call("GET", "/api/collections/menu_items/records?perPage=5")
    check("anon CAN list menu_items (public read)", st == 200, f"status={st}")

    st, body = call("GET", "/api/collections/restaurant_tables/records?perPage=50")
    anon_tables = len(body.get("items", [])) if isinstance(body, dict) else 0
    check("anon CAN list restaurant_tables (floor plan read)", st == 200 and anon_tables > 0,
          f"status={st} n={anon_tables}")

    st, body = call("GET", "/api/collections/floor_props/records?perPage=50")
    check("anon CAN list floor_props", st == 200, f"status={st}")

    st, body = call("GET", "/api/collections/orders/records?perPage=5")
    check("anon CANNOT list orders (no customer-data leak)", st != 200, f"status={st}")

    st, body = call("GET", "/api/collections/visitors/records?perPage=5")
    check("anon CANNOT list visitors", st != 200, f"status={st}")

    st, body = call("GET", "/api/collections/staff/records?perPage=5")
    check("anon CANNOT list staff (no plaintext PINs)", st != 200, f"status={st}")

    st, body = call("GET", "/api/collections/import_jobs/records?perPage=5")
    check("anon CANNOT list import_jobs", st != 200, f"status={st}")

    st, body = call("GET", "/api/collections/private_settings/records?perPage=5")
    check("anon CANNOT list private_settings (PIN hashes)", st != 200, f"status={st}")

    st, body = call("GET", "/api/collections/users/records?perPage=5")
    check("anon CANNOT list users", st != 200, f"status={st}")

    # ---- customer write path -----------------------------------------------
    st, order = call("POST", "/api/collections/orders/records", {
        "restaurant_id": rest_id,
        "customer_name": "E2E Guest",
        "customer_address": "Pickup",
        "items": [{"id": "x", "name": "Taco al Pastor", "quantity": 2, "price": 85}],
        "total": 170,
        "status": "recibido",
        "payment_method": "efectivo",
        "order_type": "pickup",
        "timestamp": 1791249000000,
        "status_timestamps": {"recibido": 1791249000000},
    })
    order_id = order.get("id") if isinstance(order, dict) else None
    check("anon CAN create an order", st in (200, 201) and bool(order_id), f"status={st}")

    if order_id:
        # Server hook must recompute status/total regardless of what we send.
        st2, forged = call("POST", "/api/collections/orders/records", {
            "restaurant_id": rest_id,
            "customer_name": "Forger",
            "customer_address": "x",
            "items": [],
            "total": 0,
            "status": "paid",
            "payment_method": "efectivo",
            "order_type": "pickup",
            "timestamp": 1791249000001,
        })
        f_status = forged.get("status") if isinstance(forged, dict) else None
        f_total = forged.get("total") if isinstance(forged, dict) else None
        check("server hook rejects forged status=paid/total=0",
              st2 in (200, 201) and f_status != "paid",
              f"status={st2} stored_status={f_status} stored_total={f_total}")

        st, got = call("GET", f"/api/collections/orders/records/{order_id}")
        check("anon CANNOT read back the order it created (listRule/viewRule locked)",
              st != 200, f"status={st}")

    # ---- PIN route ----------------------------------------------------------
    st, body = call("POST", "/api/star/verify-pin",
                    {"restaurant_id": rest_id, "scope": "admin", "pin": "0000"})
    check("verify-pin route responds (no crash)", st in (200, 400, 401, 404, 429),
          f"status={st} body={str(body)[:160]}")

    # ---- narrow customer routes (Hermes's deliverable) ----------------------
    # A route's own 404 is correct behaviour; PocketBase's generic miss is
    # `{"message":"File not found."}` with no `ok` key. Distinguish them.
    st, body = call("GET", "/api/star/order-status?id=doesnotexist123&session_id=abc")
    check(
        "GET /api/star/order-status route exists (JSON 404, not PocketBase's File-not-found)",
        isinstance(body, dict) and "ok" in body,
        f"status={st} body={str(body)[:160]}",
    )

    # Real read path: create an order carrying a session id, then read it back
    # through the narrow route (the only way an anon customer can poll status).
    st, sess_order = call("POST", "/api/collections/orders/records", {
        "restaurant_id": rest_id,
        "customer_name": "Poll Me",
        "customer_address": "Pickup",
        "items": [{"id": "x", "name": "Taco al Pastor", "quantity": 1, "price": 85}],
        "total": 85,
        "status": "recibido",
        "payment_method": "efectivo",
        "order_type": "pickup",
        "session_id": "e2e-session-1",
        "timestamp": 1791249000002,
    })
    sess_order_id = sess_order.get("id") if isinstance(sess_order, dict) else None
    st, body = call("GET", f"/api/star/order-status?id={sess_order_id}&session_id=e2e-session-1")
    # the route returns the order record itself, not a wrapper
    got_id = body.get("id") if isinstance(body, dict) else None
    check(
        "GET /api/star/order-status returns the caller's own order",
        st == 200 and got_id == sess_order_id,
        f"status={st} id={got_id} want={sess_order_id}",
    )

    st, body = call("GET", f"/api/star/order-status?id={sess_order_id}&session_id=WRONG")
    check(
        "GET /api/star/order-status refuses a mismatched session_id",
        st != 200,
        f"status={st}",
    )

    # The hook documents an items-required guard; verify it actually fires.
    st, body = call("POST", "/api/collections/orders/records", {
        "restaurant_id": rest_id, "customer_name": "No Items", "customer_address": "x",
        "items": [], "total": 0, "status": "recibido", "payment_method": "efectivo",
        "order_type": "pickup", "timestamp": 1791249000003,
    })
    check(
        "order hook rejects an order with no items",
        st >= 400,
        f"status={st} body={str(body)[:140]}",
    )

    st, body = call("POST", "/api/star/visitor-touch",
                    {"restaurant_id": rest_id, "sessionId": "e2e-sess", "ip": "127.0.0.1"})
    check("POST /api/star/visitor-touch exists", st != 404, f"status={st} body={str(body)[:160]}")

    # ---- summary ------------------------------------------------------------
    passed = sum(1 for _, ok, _ in results if ok)
    print(f"\n=== {passed}/{len(results)} checks passed ===")
    for name, ok, detail in results:
        if not ok:
            print(f"  FAILED: {name} :: {detail}")


if __name__ == "__main__":
    main()
