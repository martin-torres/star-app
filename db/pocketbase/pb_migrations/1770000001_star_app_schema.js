/// <reference path="../pb_data/types.d.ts" />
// star-app schema - generated from the app code, not from any previous database.
// Regenerate with db/pocketbase/schema.py. Do not hand-edit.
migrate((app) => {
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000001",
                "name": "name",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000002",
                "name": "slug",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000003",
                "name": "address",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000004",
                "name": "phone",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000005",
                "name": "primary_color",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000006",
                "name": "secondary_color",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000007",
                "name": "accent_color",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000008",
                "name": "background_color",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000009",
                "name": "logo_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000010",
                "name": "hero_image_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000011",
                "name": "hero_text",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000012",
                "name": "tagline",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000013",
                "name": "description",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000014",
                "name": "currency",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000015",
                "name": "mode",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "to-go",
                    "dine-in",
                    "both"
                ]
            },
            {
                "hidden": false,
                "id": "text100000016",
                "name": "google_font_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000017",
                "name": "google_font_name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "autodate100000018",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000019",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_2911074084",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_restaurants_slug` ON `restaurants` (`slug`)"
        ],
        "listRule": "",
        "name": "restaurants",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000020",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "json100000021",
                "name": "data",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "autodate100000022",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000023",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_3319819818",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_settings_restaurant` ON `restaurant_settings` (`restaurant_id`)"
        ],
        "listRule": "",
        "name": "restaurant_settings",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000024",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000025",
                "name": "pin_salt",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000026",
                "name": "admin_pin_hash",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000027",
                "name": "kitchen_pin_hash",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000028",
                "name": "telegram_bot_token",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000029",
                "name": "telegram_chat_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "autodate100000030",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000031",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_1121156968",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_private_settings_restaurant` ON `private_settings` (`restaurant_id`)"
        ],
        "listRule": null,
        "name": "private_settings",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": null
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000032",
                "name": "restaurant_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000033",
                "name": "name",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000034",
                "name": "description",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000035",
                "name": "price",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "text100000036",
                "name": "category",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000037",
                "name": "image_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000038",
                "name": "is_weight_based",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "number100000039",
                "name": "weight_price_per_kg",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000040",
                "name": "weight_in_grams",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "json100000041",
                "name": "options",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000042",
                "name": "strain",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000043",
                "name": "is_available",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "number100000044",
                "name": "stock",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "bool100000045",
                "name": "track_inventory",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000046",
                "name": "station",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "autodate100000047",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000048",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_1890765354",
        "indexes": [
            "CREATE INDEX `idx_menu_items_restaurant_category` ON `menu_items` (`restaurant_id`, `category`)",
            "CREATE INDEX `idx_menu_items_station` ON `menu_items` (`station`)"
        ],
        "listRule": "",
        "name": "menu_items",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000049",
                "name": "restaurant_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000050",
                "name": "name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000051",
                "name": "description",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000052",
                "name": "price",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "text100000053",
                "name": "image_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000054",
                "name": "category",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000055",
                "name": "active",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000056",
                "name": "code",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000057",
                "name": "type",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "promotion",
                    "event"
                ]
            },
            {
                "hidden": false,
                "id": "text100000058",
                "name": "offer_type",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000059",
                "name": "offer_value",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000060",
                "name": "discount_type",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "fixed",
                    "percent",
                    "bundle"
                ]
            },
            {
                "hidden": false,
                "id": "number100000061",
                "name": "discount_value",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000062",
                "name": "original_price",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "json100000063",
                "name": "bundle_items",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000064",
                "name": "item_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "date100000065",
                "name": "target_date",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
            },
            {
                "hidden": false,
                "id": "number100000066",
                "name": "target_weekday",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "json100000067",
                "name": "conditions",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "json100000068",
                "name": "action",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "autodate100000069",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000070",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_0835843845",
        "indexes": [
            "CREATE INDEX `idx_promos_restaurant_active` ON `promos` (`restaurant_id`, `active`)",
            "CREATE INDEX `idx_promos_target_date` ON `promos` (`target_date`)"
        ],
        "listRule": "",
        "name": "promos",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000071",
                "name": "restaurant_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000072",
                "name": "table_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000073",
                "name": "customer_name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000074",
                "name": "customer_address",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "json100000075",
                "name": "items",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000076",
                "name": "total",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000077",
                "name": "subtotal",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000078",
                "name": "tax",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000079",
                "name": "delivery_fee",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "text100000080",
                "name": "status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000081",
                "name": "payment_method",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000082",
                "name": "pay_with_amount",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "text100000083",
                "name": "transfer_screenshot",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000084",
                "name": "delivery_distance_km",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "select100000085",
                "name": "order_type",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "pickup",
                    "delivery",
                    "dine-in"
                ]
            },
            {
                "hidden": false,
                "id": "text100000086",
                "name": "notes",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000087",
                "name": "session_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000088",
                "name": "timestamp",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "json100000089",
                "name": "status_timestamps",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000090",
                "name": "kitchen_status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000091",
                "name": "bar_status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000092",
                "name": "foh_request_status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "autodate100000093",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000094",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_3845127662",
        "indexes": [
            "CREATE INDEX `idx_orders_restaurant_timestamp` ON `orders` (`restaurant_id`, `timestamp`)",
            "CREATE INDEX `idx_orders_status` ON `orders` (`status`)",
            "CREATE INDEX `idx_orders_session` ON `orders` (`session_id`)"
        ],
        "listRule": "@request.auth.id != \"\"",
        "name": "orders",
        "system": false,
        "type": "base",
        "updateRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000095",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000096",
                "name": "table_number",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "text100000097",
                "name": "display_name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000098",
                "name": "seats",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "text100000099",
                "name": "location",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000100",
                "name": "qr_code_url",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000101",
                "name": "x",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000102",
                "name": "y",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000103",
                "name": "width",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000104",
                "name": "height",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000105",
                "name": "rotation",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "select100000106",
                "name": "shape",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "square",
                    "rectangle",
                    "circular",
                    "booth",
                    "l_shaped"
                ]
            },
            {
                "hidden": false,
                "id": "bool100000107",
                "name": "is_available",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000108",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000109",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_1977220560",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_tables_restaurant_number` ON `restaurant_tables` (`restaurant_id`, `table_number`)"
        ],
        "listRule": "",
        "name": "restaurant_tables",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000110",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000111",
                "name": "table_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000112",
                "name": "customer_name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000113",
                "name": "customer_phone",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000114",
                "name": "status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "active",
                    "ordering",
                    "bill_requested",
                    "paid",
                    "closed"
                ]
            },
            {
                "hidden": false,
                "id": "json100000115",
                "name": "order_ids",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000116",
                "name": "session_start",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000117",
                "name": "session_end",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "autodate100000118",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000119",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_0532987283",
        "indexes": [
            "CREATE INDEX `idx_sessions_restaurant_table` ON `dining_sessions` (`restaurant_id`, `table_id`)"
        ],
        "listRule": null,
        "name": "dining_sessions",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": null
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000120",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000121",
                "name": "table_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "json100000122",
                "name": "order_ids",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000123",
                "name": "subtotal",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000124",
                "name": "tax",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000125",
                "name": "tip",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000126",
                "name": "total",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "select100000127",
                "name": "status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "requested",
                    "processing",
                    "paid",
                    "cancelled"
                ]
            },
            {
                "hidden": false,
                "id": "json100000128",
                "name": "payments",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000129",
                "name": "requested_at",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "autodate100000130",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000131",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_4135131280",
        "indexes": [
            "CREATE INDEX `idx_bill_requests_restaurant_table` ON `bill_requests` (`restaurant_id`, `table_id`)"
        ],
        "listRule": null,
        "name": "bill_requests",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": null
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000132",
                "name": "restaurant_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000133",
                "name": "sessionId",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000134",
                "name": "userAgent",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000135",
                "name": "deviceType",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000136",
                "name": "isPwaInstalled",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000137",
                "name": "ip",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000138",
                "name": "first_visit",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000139",
                "name": "last_visit",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000140",
                "name": "visit_count",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "json100000141",
                "name": "associated_orders",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000142",
                "name": "name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000143",
                "name": "phone",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000144",
                "name": "leadCaptured",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000145",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000146",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_2071241791",
        "indexes": [
            "CREATE INDEX `idx_visitors_session` ON `visitors` (`sessionId`)"
        ],
        "listRule": "@request.auth.id != \"\"",
        "name": "visitors",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": "@request.auth.id != \"\""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000147",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000148",
                "name": "canvas_w",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000149",
                "name": "canvas_h",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000150",
                "name": "grid_size",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "autodate100000151",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000152",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_3880182247",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_floor_plans_restaurant` ON `floor_plans` (`restaurant_id`)"
        ],
        "listRule": "",
        "name": "floor_plans",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000153",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000154",
                "name": "floor_plan_id",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000155",
                "name": "prop_type",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "number100000156",
                "name": "x",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000157",
                "name": "y",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000158",
                "name": "width",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000159",
                "name": "height",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000160",
                "name": "rotation",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "autodate100000161",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000162",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_2304758686",
        "indexes": [
            "CREATE INDEX `idx_floor_props_restaurant_plan` ON `floor_props` (`restaurant_id`, `floor_plan_id`)"
        ],
        "listRule": "",
        "name": "floor_props",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "@request.auth.id != \"\"",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000163",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000164",
                "name": "kind",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "csv",
                    "image",
                    "doc"
                ]
            },
            {
                "hidden": false,
                "id": "select100000165",
                "name": "status",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "uploaded",
                    "parsed",
                    "previewed",
                    "applied",
                    "failed"
                ]
            },
            {
                "hidden": false,
                "id": "json100000166",
                "name": "summary",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "json100000167",
                "name": "errors",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000168",
                "name": "file_name",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "autodate100000169",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000170",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_1170178885",
        "indexes": [
            "CREATE INDEX `idx_import_jobs_restaurant_created` ON `import_jobs` (`restaurant_id`, `created_at`)"
        ],
        "listRule": "@request.auth.id != \"\"",
        "name": "import_jobs",
        "system": false,
        "type": "base",
        "updateRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "@request.auth.id != \"\"",
        "deleteRule": "@request.auth.id != \"\"",
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000171",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000172",
                "name": "name",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "select100000173",
                "name": "role",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "select",
                "maxSelect": 1,
                "values": [
                    "manager",
                    "server",
                    "foh",
                    "kitchen",
                    "bar",
                    "owner"
                ]
            },
            {
                "hidden": false,
                "id": "text100000174",
                "name": "pin",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000175",
                "name": "is_active",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000176",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000177",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_1114567570",
        "indexes": [
            "CREATE INDEX `idx_staff_restaurant` ON `staff` (`restaurant_id`)"
        ],
        "listRule": "@request.auth.id != \"\"",
        "name": "staff",
        "system": false,
        "type": "base",
        "updateRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "@request.auth.id != \"\"",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000178",
                "name": "staff_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000179",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "date100000180",
                "name": "clock_in",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
            },
            {
                "hidden": false,
                "id": "date100000181",
                "name": "clock_out",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "date",
                "max": "",
                "min": ""
            },
            {
                "hidden": false,
                "id": "number100000182",
                "name": "tables_served",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": true
            },
            {
                "hidden": false,
                "id": "number100000183",
                "name": "total_tips",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "number100000184",
                "name": "total_sales",
                "presentable": false,
                "required": false,
                "system": false,
                "type": "number",
                "max": null,
                "min": null,
                "onlyInt": false
            },
            {
                "hidden": false,
                "id": "autodate100000185",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000186",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_0408994708",
        "indexes": [
            "CREATE INDEX `idx_staff_shifts_staff` ON `staff_shifts` (`staff_id`)"
        ],
        "listRule": "@request.auth.id != \"\"",
        "name": "staff_shifts",
        "system": false,
        "type": "base",
        "updateRule": "@request.auth.id != \"\"",
        "viewRule": "@request.auth.id != \"\""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": null,
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "text100000187",
                "name": "restaurant_id",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "text100000188",
                "name": "slug",
                "presentable": false,
                "required": true,
                "system": false,
                "type": "text",
                "autogeneratePattern": "",
                "max": 0,
                "min": 0,
                "pattern": ""
            },
            {
                "hidden": false,
                "id": "bool100000189",
                "name": "enabled",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "json100000190",
                "name": "settings",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "autodate100000191",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000192",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_3286942618",
        "indexes": [
            "CREATE UNIQUE INDEX `idx_app_modules_restaurant_slug` ON `app_modules` (`restaurant_id`, `slug`)"
        ],
        "listRule": "",
        "name": "app_modules",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    const collection = new Collection({
        "createRule": "@request.auth.id != \"\"",
        "deleteRule": null,
        "fields": [
            {
                "autogeneratePattern": "[a-z0-9]{15}",
                "hidden": false,
                "id": "text3208210256",
                "max": 15,
                "min": 15,
                "name": "id",
                "pattern": "^[a-z0-9]+$",
                "presentable": false,
                "primaryKey": true,
                "required": true,
                "system": true,
                "type": "text"
            },
            {
                "hidden": false,
                "id": "file100000193",
                "name": "file",
                "presentable": false,
                "system": false,
                "type": "file",
                "maxSelect": 1,
                "maxSize": 5242880,
                "mimeTypes": [
                    "image/png",
                    "image/jpeg",
                    "image/gif",
                    "image/webp",
                    "image/heic"
                ],
                "protected": false,
                "thumbs": []
            },
            {
                "hidden": false,
                "id": "autodate100000194",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000195",
                "name": "updated_at",
                "onCreate": true,
                "onUpdate": true,
                "presentable": false,
                "system": false,
                "type": "autodate"
            }
        ],
        "id": "pbc_3760176746",
        "indexes": [],
        "listRule": "",
        "name": "images",
        "system": false,
        "type": "base",
        "updateRule": null,
        "viewRule": ""
    });

    app.save(collection);
  }
  {
    // Extend the collection PocketBase already seeded. Only missing
    // fields are added, so this block is safe to re-run.
    const collection = app.findCollectionByNameOrId("users");
    const additions = [
        {
            "hidden": false,
            "id": "select100900001",
            "name": "role",
            "presentable": false,
            "required": false,
            "system": false,
            "type": "select",
            "maxSelect": 1,
            "values": [
                "owner",
                "manager",
                "staff"
            ]
        },
        {
            "hidden": false,
            "id": "text100900002",
            "name": "restaurant_id",
            "presentable": false,
            "required": false,
            "system": false,
            "type": "text",
            "autogeneratePattern": "",
            "max": 0,
            "min": 0,
            "pattern": ""
        },
        {
            "hidden": false,
            "id": "bool100900003",
            "name": "is_active",
            "presentable": false,
            "system": false,
            "type": "bool"
        }
    ];
    for (let i = 0; i < additions.length; i++) {
      if (!collection.fields.getByName(additions[i].name)) {
        collection.fields.add(new Field(additions[i]));
      }
    }
    collection.listRule = "id = @request.auth.id";
    collection.viewRule = "id = @request.auth.id";
    collection.createRule = null;
    collection.updateRule = "id = @request.auth.id";
    collection.deleteRule = null;

    app.save(collection);
  }
  return null;
}, (app) => {
  {
    const collection = app.findCollectionByNameOrId("users");
    const names = ["role", "restaurant_id", "is_active"];
    for (let i = 0; i < names.length; i++) {
      const f = collection.fields.getByName(names[i]);
      if (f) { collection.fields.removeById(f.id); }
    }
    collection.listRule = "id = @request.auth.id";
    collection.viewRule = "id = @request.auth.id";
    collection.createRule = "";
    collection.updateRule = "id = @request.auth.id";
    collection.deleteRule = "id = @request.auth.id";

    app.save(collection);
  }
  app.delete(app.findCollectionByNameOrId("images"));
  app.delete(app.findCollectionByNameOrId("app_modules"));
  app.delete(app.findCollectionByNameOrId("staff_shifts"));
  app.delete(app.findCollectionByNameOrId("staff"));
  app.delete(app.findCollectionByNameOrId("import_jobs"));
  app.delete(app.findCollectionByNameOrId("floor_props"));
  app.delete(app.findCollectionByNameOrId("floor_plans"));
  app.delete(app.findCollectionByNameOrId("visitors"));
  app.delete(app.findCollectionByNameOrId("bill_requests"));
  app.delete(app.findCollectionByNameOrId("dining_sessions"));
  app.delete(app.findCollectionByNameOrId("restaurant_tables"));
  app.delete(app.findCollectionByNameOrId("orders"));
  app.delete(app.findCollectionByNameOrId("promos"));
  app.delete(app.findCollectionByNameOrId("menu_items"));
  app.delete(app.findCollectionByNameOrId("private_settings"));
  app.delete(app.findCollectionByNameOrId("restaurant_settings"));
  app.delete(app.findCollectionByNameOrId("restaurants"));
})
