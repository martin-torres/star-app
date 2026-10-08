#!/usr/bin/env python3
"""star-app schema spec -> PocketBase 0.40 migration file.

Single source of truth for the star-app PocketBase database. Field names mirror
what the app code reads/writes (snake_case, matching src/data/insforge/mappers.ts)
so the existing mappers can be reused unchanged.

Regenerate:  python3 db/pocketbase/schema.py > db/pocketbase/pb_migrations/<ts>_star_app_schema.js
"""
import json
import sys
import zlib

# --------------------------------------------------------------------------
# collection spec
#   text / number / bool / json / date / autodate / select / file
#   "auto"  -> created_at autodate(onCreate) / updated_at autodate(onCreate+onUpdate)
# --------------------------------------------------------------------------

RESTAURANTS = [
    ("name", "text", {"required": True}),
    ("slug", "text", {"required": True}),
    ("address", "text", {}),
    ("phone", "text", {}),
    ("primary_color", "text", {}),
    ("secondary_color", "text", {}),
    ("accent_color", "text", {}),
    ("background_color", "text", {}),
    ("logo_url", "text", {}),
    ("hero_image_url", "text", {}),
    ("hero_text", "text", {}),
    ("tagline", "text", {}),
    ("description", "text", {}),
    ("currency", "text", {}),
    ("mode", "select", {"values": ["to-go", "dine-in", "both"]}),
    ("google_font_url", "text", {}),
    ("google_font_name", "text", {}),
    ("auto", "", {}),
]

COLLECTIONS = [
    # (name, type, fields, indexes, rules dict)
    (
        "restaurants", "base", RESTAURANTS,
        ["CREATE UNIQUE INDEX `idx_restaurants_slug` ON `restaurants` (`slug`)"],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "restaurant_settings", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("data", "json", {}),
            ("auto", "", {}),
        ],
        ["CREATE UNIQUE INDEX `idx_settings_restaurant` ON `restaurant_settings` (`restaurant_id`)"],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        # Server-only. Manager PINs live here as salted hashes and are never
        # exposed through any API rule. The app must NOT hold or compare PINs -
        # it asks the hook route /api/star/verify-pin instead.
        # (Previously the PIN shipped to the browser in restaurant_settings and
        # was compared client-side with `newCode === expectedPin`.)
        "private_settings", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("pin_salt", "text", {}),
            ("admin_pin_hash", "text", {}),
            ("kitchen_pin_hash", "text", {}),
            # Telegram credentials live here, NOT in restaurant_settings.data.
            # That blob is world-readable; the bot token is an outbound-send
            # credential, so the browser must never receive it. The server reads
            # these (or falls back to the legacy blob location) when it sends.
            ("telegram_bot_token", "text", {}),
            ("telegram_chat_id", "text", {}),
            ("auto", "", {}),
        ],
        ["CREATE UNIQUE INDEX `idx_private_settings_restaurant` ON `private_settings` (`restaurant_id`)"],
        {"listRule": None, "viewRule": None, "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "menu_items", "base", [
            ("restaurant_id", "text", {}),
            ("name", "text", {"required": True}),
            ("description", "text", {}),
            ("price", "number", {}),
            ("category", "text", {}),
            ("image_url", "text", {}),
            ("is_weight_based", "bool", {}),
            ("weight_price_per_kg", "number", {}),
            ("weight_in_grams", "number", {"onlyInt": True}),
            ("options", "json", {}),
            ("strain", "text", {}),
            ("is_available", "bool", {}),
            ("stock", "number", {"onlyInt": True}),
            ("track_inventory", "bool", {}),
            # spec 005 — station-based order routing. Absent from every existing schema file.
            ("station", "text", {}),
            ("auto", "", {}),
        ],
        [
            "CREATE INDEX `idx_menu_items_restaurant_category` ON `menu_items` (`restaurant_id`, `category`)",
            "CREATE INDEX `idx_menu_items_station` ON `menu_items` (`station`)",
        ],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "promos", "base", [
            ("restaurant_id", "text", {}),
            ("name", "text", {}),
            ("description", "text", {}),
            ("price", "number", {}),
            ("image_url", "text", {}),
            ("category", "text", {}),
            ("active", "bool", {}),
            ("code", "text", {}),
            ("type", "select", {"values": ["promotion", "event"]}),
            ("offer_type", "text", {}),
            ("offer_value", "text", {}),
            ("discount_type", "select", {"values": ["fixed", "percent", "bundle"]}),
            ("discount_value", "number", {}),
            ("original_price", "number", {}),
            ("bundle_items", "json", {}),
            ("item_id", "text", {}),
            ("target_date", "date", {}),
            ("target_weekday", "number", {"onlyInt": True}),
            ("conditions", "json", {}),
            ("action", "json", {}),
            ("auto", "", {}),
        ],
        [
            "CREATE INDEX `idx_promos_restaurant_active` ON `promos` (`restaurant_id`, `active`)",
            "CREATE INDEX `idx_promos_target_date` ON `promos` (`target_date`)",
        ],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "orders", "base", [
            ("restaurant_id", "text", {}),
            ("table_id", "text", {}),
            ("customer_name", "text", {}),
            ("customer_address", "text", {}),
            ("items", "json", {"required": True}),
            ("total", "number", {}),
            ("subtotal", "number", {}),
            ("tax", "number", {}),
            ("delivery_fee", "number", {}),
            ("status", "text", {}),
            ("payment_method", "text", {}),
            ("pay_with_amount", "number", {}),
            ("transfer_screenshot", "text", {}),
            ("delivery_distance_km", "number", {}),
            ("order_type", "select", {"values": ["pickup", "delivery", "dine-in"]}),
            ("notes", "text", {}),
            ("session_id", "text", {}),
            ("timestamp", "number", {"onlyInt": True}),
            ("status_timestamps", "json", {}),
            # spec 005 — per-station completion, drives the floor-plan colour coding
            ("kitchen_status", "text", {}),
            ("bar_status", "text", {}),
            ("foh_request_status", "text", {}),
            ("auto", "", {}),
        ],
        [
            "CREATE INDEX `idx_orders_restaurant_timestamp` ON `orders` (`restaurant_id`, `timestamp`)",
            "CREATE INDEX `idx_orders_status` ON `orders` (`status`)",
            "CREATE INDEX `idx_orders_session` ON `orders` (`session_id`)",
        ],
        # create is open (anonymous customer checkout); read is NOT - the old instance
        # exposed every order to the anon key, which we deliberately do not repeat.
        # Managers/kitchen are authenticated users of the `users` auth collection.
        {"listRule": "@request.auth.id != \"\"", "viewRule": "@request.auth.id != \"\"",
         "createRule": "", "updateRule": "@request.auth.id != \"\"", "deleteRule": None},
    ),
    (
        "restaurant_tables", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("table_number", "number", {"onlyInt": True}),
            ("display_name", "text", {}),
            ("seats", "number", {"onlyInt": True}),
            ("location", "text", {}),
            ("qr_code_url", "text", {}),
            ("x", "number", {"onlyInt": True}),
            ("y", "number", {"onlyInt": True}),
            ("width", "number", {"onlyInt": True}),
            ("height", "number", {"onlyInt": True}),
            ("rotation", "number", {"onlyInt": True}),
            ("shape", "select", {"values": ["square", "rectangle", "circular", "booth", "l_shaped"]}),
            ("is_available", "bool", {}),
            ("auto", "", {}),
        ],
        [
            "CREATE UNIQUE INDEX `idx_tables_restaurant_number` ON `restaurant_tables` (`restaurant_id`, `table_number`)",
        ],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "dining_sessions", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("table_id", "text", {}),
            ("customer_name", "text", {}),
            ("customer_phone", "text", {}),
            ("status", "select", {"values": ["active", "ordering", "bill_requested", "paid", "closed"]}),
            ("order_ids", "json", {}),
            ("session_start", "number", {"onlyInt": True}),
            ("session_end", "number", {"onlyInt": True}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_sessions_restaurant_table` ON `dining_sessions` (`restaurant_id`, `table_id`)"],
        {"listRule": None, "viewRule": None, "createRule": "", "updateRule": None, "deleteRule": None},
    ),
    (
        "bill_requests", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("table_id", "text", {}),
            ("order_ids", "json", {}),
            ("subtotal", "number", {}),
            ("tax", "number", {}),
            ("tip", "number", {}),
            ("total", "number", {}),
            ("status", "select", {"values": ["requested", "processing", "paid", "cancelled"]}),
            ("payments", "json", {}),
            ("requested_at", "number", {"onlyInt": True}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_bill_requests_restaurant_table` ON `bill_requests` (`restaurant_id`, `table_id`)"],
        {"listRule": None, "viewRule": None, "createRule": "", "updateRule": None, "deleteRule": None},
    ),
    (
        "visitors", "base", [
            ("restaurant_id", "text", {}),
            # the code writes these four in camelCase - kept as-is so no app change is needed
            ("sessionId", "text", {}),
            ("userAgent", "text", {}),
            ("deviceType", "text", {}),
            ("isPwaInstalled", "bool", {}),
            ("ip", "text", {}),
            ("first_visit", "text", {}),
            ("last_visit", "text", {}),
            ("visit_count", "number", {"onlyInt": True}),
            ("associated_orders", "json", {}),
            ("name", "text", {}),
            ("phone", "text", {}),
            ("leadCaptured", "bool", {}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_visitors_session` ON `visitors` (`sessionId`)"],
        # create stays open (first-visit row from the browser; counters are forced
        # server-side by the create hook). Reads are manager-only; the returning-visit
        # bump goes through POST /api/star/visitor-touch.
        {"listRule": "@request.auth.id != \"\"", "viewRule": "@request.auth.id != \"\"",
         "createRule": "", "updateRule": None, "deleteRule": None},
    ),
    (
        "floor_plans", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("canvas_w", "number", {"onlyInt": True}),
            ("canvas_h", "number", {"onlyInt": True}),
            ("grid_size", "number", {"onlyInt": True}),
            ("auto", "", {}),
        ],
        ["CREATE UNIQUE INDEX `idx_floor_plans_restaurant` ON `floor_plans` (`restaurant_id`)"],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "floor_props", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("floor_plan_id", "text", {}),
            ("prop_type", "text", {}),
            ("x", "number", {"onlyInt": True}),
            ("y", "number", {"onlyInt": True}),
            ("width", "number", {"onlyInt": True}),
            ("height", "number", {"onlyInt": True}),
            ("rotation", "number", {"onlyInt": True}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_floor_props_restaurant_plan` ON `floor_props` (`restaurant_id`, `floor_plan_id`)"],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        "import_jobs", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("kind", "select", {"values": ["csv", "image", "doc"]}),
            ("status", "select", {"values": ["uploaded", "parsed", "previewed", "applied", "failed"]}),
            ("summary", "json", {}),
            ("errors", "json", {}),
            ("file_name", "text", {}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_import_jobs_restaurant_created` ON `import_jobs` (`restaurant_id`, `created_at`)"],
        # manager-only: the manager Hub imports screen is the only writer/reader.
        {"listRule": "@request.auth.id != \"\"", "viewRule": "@request.auth.id != \"\"",
         "createRule": "@request.auth.id != \"\"", "updateRule": "@request.auth.id != \"\"", "deleteRule": None},
    ),
    (
        "staff", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("name", "text", {"required": True}),
            ("role", "select", {"values": ["manager", "server", "foh", "kitchen", "bar", "owner"]}),
            ("pin", "text", {}),
            ("is_active", "bool", {}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_staff_restaurant` ON `staff` (`restaurant_id`)"],
        # manager-only: contains PINs. Read + write for authenticated managers.
        {"listRule": "@request.auth.id != \"\"", "viewRule": "@request.auth.id != \"\"",
         "createRule": "@request.auth.id != \"\"", "updateRule": "@request.auth.id != \"\"", "deleteRule": "@request.auth.id != \"\""},
    ),
    (
        "staff_shifts", "base", [
            ("staff_id", "text", {"required": True}),
            ("restaurant_id", "text", {"required": True}),
            ("clock_in", "date", {}),
            ("clock_out", "date", {}),
            ("tables_served", "number", {"onlyInt": True}),
            ("total_tips", "number", {}),
            ("total_sales", "number", {}),
            ("auto", "", {}),
        ],
        ["CREATE INDEX `idx_staff_shifts_staff` ON `staff_shifts` (`staff_id`)"],
        # manager/analytics-only.
        {"listRule": "@request.auth.id != \"\"", "viewRule": "@request.auth.id != \"\"",
         "createRule": "@request.auth.id != \"\"", "updateRule": "@request.auth.id != \"\"", "deleteRule": None},
    ),
    (
        "app_modules", "base", [
            ("restaurant_id", "text", {"required": True}),
            ("slug", "text", {"required": True}),
            ("enabled", "bool", {}),
            ("settings", "json", {}),
            ("auto", "", {}),
        ],
        ["CREATE UNIQUE INDEX `idx_app_modules_restaurant_slug` ON `app_modules` (`restaurant_id`, `slug`)"],
        {"listRule": "", "viewRule": "", "createRule": None, "updateRule": None, "deleteRule": None},
    ),
    (
        # replaces InsForge storage for lib/pocketbase.ts uploadFile()
        "images", "base", [
            ("file", "file", {"maxSelect": 1, "maxSize": 5 * 1024 * 1024,
                              "mimeTypes": ["image/png", "image/jpeg", "image/gif", "image/webp", "image/heic"]}),
            ("auto", "", {}),
        ],
        [],
        # read is public (menu/brand images are rendered by customers), but upload
        # is for authenticated managers only - an anonymous caller could otherwise
        # use this instance as free file hosting.
        {"listRule": "", "viewRule": "", "createRule": "@request.auth.id != \"\"",
         "updateRule": None, "deleteRule": None},
    ),
]

# --------------------------------------------------------------------------
# PATCHES - collections that ALREADY EXIST in a fresh PocketBase database.
#
# PocketBase 0.40 seeds a default `users` auth collection (id
# `_pb_users_auth_`, fields id/password/tokenKey/email/emailVisibility/verified/
# name/avatar/created/updated, self-only rules). Creating another `users` fails
# the whole migration with "Collection name must be unique", so the manager/staff
# login collection is EXTENDED here instead of created.
#
# The default createRule is "" (anyone may self-register) - for a managers/staff
# collection that must be closed, so createRule/deleteRule are set to null
# (superuser-only) and reads stay self-only.
# --------------------------------------------------------------------------

PATCHES = [
    (
        "users",
        [
            ("role", "select", {"values": ["owner", "manager", "staff"]}),
            ("restaurant_id", "text", {}),
            ("is_active", "bool", {}),
        ],
        {"listRule": "id = @request.auth.id", "viewRule": "id = @request.auth.id",
         "createRule": None, "updateRule": "id = @request.auth.id", "deleteRule": None},
        # PocketBase's own defaults, restored on rollback.
        {"listRule": "id = @request.auth.id", "viewRule": "id = @request.auth.id",
         "createRule": "", "updateRule": "id = @request.auth.id", "deleteRule": "id = @request.auth.id"},
    ),
]


def field_id(kind: str, n: int) -> str:
    # PocketBase field ids look like "<type><digits>"; avoid leading zeros.
    return f"{kind}{100000000 + n}"


def make_field(name, kind, opts, n, auto_kind=None):
    if name == "auto":
        # expands to created_at / updated_at autodate pair
        return None
    fid = field_id(kind, n)
    base = {"hidden": False, "id": fid, "name": name, "presentable": False,
            "required": opts.get("required", False), "system": False, "type": kind}
    if kind == "text":
        base.update({"autogeneratePattern": "", "max": 0, "min": 0, "pattern": ""})
    elif kind == "number":
        base.update({"max": None, "min": None, "onlyInt": opts.get("onlyInt", False)})
    elif kind == "bool":
        base.pop("required")
    elif kind == "json":
        base.update({"maxSize": 0})
        base.pop("required")
    elif kind == "date":
        base.update({"max": "", "min": ""})
    elif kind == "select":
        base.update({"maxSelect": opts.get("maxSelect", 1), "values": opts.get("values", [])})
    elif kind == "file":
        base.update({
            "maxSelect": opts.get("maxSelect", 1),
            "maxSize": opts.get("maxSize", 0),
            "mimeTypes": opts.get("mimeTypes", []),
            "protected": False,
            "thumbs": [],
        })
        base.pop("required")
    return base


def autodate(name, n, on_update):
    return {"hidden": False, "id": field_id("autodate", n), "name": name,
            "onCreate": True, "onUpdate": on_update, "presentable": False,
            "system": False, "type": "autodate"}


def primary_id():
    return {"autogeneratePattern": "[a-z0-9]{15}", "hidden": False, "id": "text3208210256",
            "max": 15, "min": 15, "name": "id", "pattern": "^[a-z0-9]+$",
            "presentable": False, "primaryKey": True, "required": True,
            "system": True, "type": "text"}


def build():
    out_collections = []
    counter = 0
    for cname, ctype, fields, indexes, rules in COLLECTIONS:
        flist = [primary_id()]
        for (fname, fkind, fopts) in fields:
            if fname == "auto":
                counter += 1
                flist.append(autodate("created_at", counter, False))
                counter += 1
                flist.append(autodate("updated_at", counter, True))
                continue
            counter += 1
            f = make_field(fname, fkind, fopts, counter)
            if f:
                flist.append(f)
        cid = "pbc_" + str(zlib.crc32(cname.encode()) % 10_000_000_000).zfill(10)
        out_collections.append({
            "collection": {
                "createRule": rules["createRule"],
                "deleteRule": rules["deleteRule"],
                "fields": flist,
                "id": cid,
                "indexes": indexes,
                "listRule": rules["listRule"],
                "name": cname,
                "system": False,
                "type": ctype,
                "updateRule": rules["updateRule"],
                "viewRule": rules["viewRule"],
            },
            "cid": cid,
            "name": cname,
        })
    return out_collections


HEADER = '''/// <reference path="../pb_data/types.d.ts" />
// star-app schema - generated from the app code, not from any previous database.
// Regenerate with db/pocketbase/schema.py. Do not hand-edit.
migrate((app) => {
'''

FOOTER_UP = "  return null;\n}, (app) => {\n"
FOOTER_DOWN = "})\n"


def emit_collection(item):
    return ("  {\n    const collection = new Collection(" +
            json.dumps(item["collection"], indent=4).replace("\n", "\n    ") +
            ");\n\n    app.save(collection);\n  }\n")


def emit_patch(name, fields, rules):
    flist = [make_field(fn, fk, fo, 900000 + i + 1)
             for i, (fn, fk, fo) in enumerate(fields)]
    out = "  {\n"
    out += "    // Extend the collection PocketBase already seeded. Only missing\n"
    out += "    // fields are added, so this block is safe to re-run.\n"
    out += "    const collection = app.findCollectionByNameOrId(" + json.dumps(name) + ");\n"
    out += "    const additions = " + json.dumps(flist, indent=4).replace("\n", "\n    ") + ";\n"
    out += "    for (let i = 0; i < additions.length; i++) {\n"
    out += "      if (!collection.fields.getByName(additions[i].name)) {\n"
    out += "        collection.fields.add(new Field(additions[i]));\n"
    out += "      }\n"
    out += "    }\n"
    for k, v in rules.items():
        out += "    collection." + k + " = " + json.dumps(v) + ";\n"
    out += "\n    app.save(collection);\n  }\n"
    return out


def emit_patch_rollback(name, fields, rules):
    names = [f[0] for f in fields]
    out = "  {\n"
    out += "    const collection = app.findCollectionByNameOrId(" + json.dumps(name) + ");\n"
    out += "    const names = " + json.dumps(names) + ";\n"
    out += "    for (let i = 0; i < names.length; i++) {\n"
    out += "      const f = collection.fields.getByName(names[i]);\n"
    out += "      if (f) { collection.fields.removeById(f.id); }\n"
    out += "    }\n"
    for k, v in rules.items():
        out += "    collection." + k + " = " + json.dumps(v) + ";\n"
    out += "\n    app.save(collection);\n  }\n"
    return out


def main():
    cols = build()
    print(HEADER, end="")
    for item in cols:
        print(emit_collection(item), end="")
    for name, fields, rules, _rollback in PATCHES:
        print(emit_patch(name, fields, rules), end="")
    print(FOOTER_UP, end="")
    # Rollback: undo the patches, then drop the created collections. Delete by
    # NAME, not id: PocketBase rewrites the id of an `auth` collection named
    # "users" to the well-known `_pb_users_auth_`, so a generated cid would not
    # resolve.
    for name, fields, _rules, rollback in reversed(PATCHES):
        print(emit_patch_rollback(name, fields, rollback), end="")
    for item in reversed(cols):
        print(f'  app.delete(app.findCollectionByNameOrId("{item["name"]}"));')
    print(FOOTER_DOWN, end="")


if __name__ == "__main__":
    main()
