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
                "id": "autodate100000028",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000029",
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
                "id": "text100000030",
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
                "id": "text100000031",
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
                "id": "text100000032",
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
                "id": "number100000033",
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
                "id": "text100000034",
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
                "id": "text100000035",
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
                "id": "bool100000036",
                "name": "is_weight_based",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "number100000037",
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
                "id": "number100000038",
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
                "id": "json100000039",
                "name": "options",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000040",
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
                "id": "bool100000041",
                "name": "is_available",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "number100000042",
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
                "id": "bool100000043",
                "name": "track_inventory",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000044",
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
                "id": "autodate100000045",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000046",
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
                "id": "text100000047",
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
                "id": "text100000048",
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
                "id": "text100000049",
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
                "id": "number100000050",
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
                "id": "text100000051",
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
                "id": "text100000052",
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
                "id": "bool100000053",
                "name": "active",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000054",
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
                "id": "select100000055",
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
                "id": "text100000056",
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
                "id": "text100000057",
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
                "id": "select100000058",
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
                "id": "number100000059",
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
                "id": "number100000060",
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
                "id": "json100000061",
                "name": "bundle_items",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000062",
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
                "id": "date100000063",
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
                "id": "number100000064",
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
                "id": "json100000065",
                "name": "conditions",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "json100000066",
                "name": "action",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "autodate100000067",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000068",
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
                "id": "text100000069",
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
                "id": "text100000070",
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
                "id": "text100000071",
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
                "id": "text100000072",
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
                "id": "json100000073",
                "name": "items",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000074",
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
                "id": "number100000075",
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
                "id": "number100000076",
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
                "id": "number100000077",
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
                "id": "text100000078",
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
                "id": "text100000079",
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
                "id": "number100000080",
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
                "id": "text100000081",
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
                "id": "number100000082",
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
                "id": "select100000083",
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
                "id": "text100000084",
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
                "id": "text100000085",
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
                "id": "number100000086",
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
                "id": "json100000087",
                "name": "status_timestamps",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000088",
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
                "id": "text100000089",
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
                "id": "text100000090",
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
                "id": "autodate100000091",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000092",
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
        "listRule": null,
        "name": "orders",
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
                "id": "text100000093",
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
                "id": "number100000094",
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
                "id": "text100000095",
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
                "id": "number100000096",
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
                "id": "text100000097",
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
                "id": "text100000098",
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
                "id": "number100000099",
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
                "id": "number100000100",
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
                "id": "number100000101",
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
                "id": "number100000102",
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
                "id": "number100000103",
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
                "id": "select100000104",
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
                "id": "bool100000105",
                "name": "is_available",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000106",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000107",
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
                "id": "text100000108",
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
                "id": "text100000109",
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
                "id": "text100000110",
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
                "id": "text100000111",
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
                "id": "select100000112",
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
                "id": "json100000113",
                "name": "order_ids",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000114",
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
                "id": "number100000115",
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
                "id": "autodate100000116",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000117",
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
                "id": "text100000118",
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
                "id": "text100000119",
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
                "id": "json100000120",
                "name": "order_ids",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000121",
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
                "id": "number100000122",
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
                "id": "number100000123",
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
                "id": "number100000124",
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
                "id": "select100000125",
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
                "id": "json100000126",
                "name": "payments",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "number100000127",
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
                "id": "autodate100000128",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000129",
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
                "id": "text100000130",
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
                "id": "text100000131",
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
                "id": "text100000132",
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
                "id": "text100000133",
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
                "id": "bool100000134",
                "name": "isPwaInstalled",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "text100000135",
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
                "id": "text100000136",
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
                "id": "text100000137",
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
                "id": "number100000138",
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
                "id": "json100000139",
                "name": "associated_orders",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000140",
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
                "id": "text100000141",
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
                "id": "bool100000142",
                "name": "leadCaptured",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000143",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000144",
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
        "listRule": null,
        "name": "visitors",
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
                "id": "text100000145",
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
                "id": "number100000146",
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
                "id": "number100000147",
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
                "id": "number100000148",
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
                "id": "autodate100000149",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000150",
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
                "id": "text100000151",
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
                "id": "text100000152",
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
                "id": "text100000153",
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
                "id": "number100000154",
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
                "id": "number100000155",
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
                "id": "number100000156",
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
                "id": "number100000157",
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
                "id": "number100000158",
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
                "id": "autodate100000159",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000160",
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
                "id": "text100000161",
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
                "id": "select100000162",
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
                "id": "select100000163",
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
                "id": "json100000164",
                "name": "summary",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "json100000165",
                "name": "errors",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "text100000166",
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
                "id": "autodate100000167",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000168",
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
        "listRule": null,
        "name": "import_jobs",
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
                "id": "text100000169",
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
                "id": "text100000170",
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
                "id": "select100000171",
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
                "id": "text100000172",
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
                "id": "bool100000173",
                "name": "is_active",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "autodate100000174",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000175",
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
        "listRule": null,
        "name": "staff",
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
                "id": "text100000176",
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
                "id": "text100000177",
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
                "id": "date100000178",
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
                "id": "date100000179",
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
                "id": "number100000180",
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
                "id": "number100000181",
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
                "id": "number100000182",
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
                "id": "autodate100000183",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000184",
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
        "listRule": null,
        "name": "staff_shifts",
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
                "id": "text100000185",
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
                "id": "text100000186",
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
                "id": "bool100000187",
                "name": "enabled",
                "presentable": false,
                "system": false,
                "type": "bool"
            },
            {
                "hidden": false,
                "id": "json100000188",
                "name": "settings",
                "presentable": false,
                "system": false,
                "type": "json",
                "maxSize": 0
            },
            {
                "hidden": false,
                "id": "autodate100000189",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000190",
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
                "id": "file100000191",
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
                "id": "autodate100000192",
                "name": "created_at",
                "onCreate": true,
                "onUpdate": false,
                "presentable": false,
                "system": false,
                "type": "autodate"
            },
            {
                "hidden": false,
                "id": "autodate100000193",
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

  return null;
}, (app) => {
  app.delete(app.findCollectionByNameOrId("pbc_3760176746"));
  app.delete(app.findCollectionByNameOrId("pbc_3286942618"));
  app.delete(app.findCollectionByNameOrId("pbc_0408994708"));
  app.delete(app.findCollectionByNameOrId("pbc_1114567570"));
  app.delete(app.findCollectionByNameOrId("pbc_1170178885"));
  app.delete(app.findCollectionByNameOrId("pbc_2304758686"));
  app.delete(app.findCollectionByNameOrId("pbc_3880182247"));
  app.delete(app.findCollectionByNameOrId("pbc_2071241791"));
  app.delete(app.findCollectionByNameOrId("pbc_4135131280"));
  app.delete(app.findCollectionByNameOrId("pbc_0532987283"));
  app.delete(app.findCollectionByNameOrId("pbc_1977220560"));
  app.delete(app.findCollectionByNameOrId("pbc_3845127662"));
  app.delete(app.findCollectionByNameOrId("pbc_0835843845"));
  app.delete(app.findCollectionByNameOrId("pbc_1890765354"));
  app.delete(app.findCollectionByNameOrId("pbc_1121156968"));
  app.delete(app.findCollectionByNameOrId("pbc_3319819818"));
  app.delete(app.findCollectionByNameOrId("pbc_2911074084"));
})
