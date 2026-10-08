/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
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
        "cascadeDelete": true,
        "collectionId": "pbc_1567773776",
        "hidden": false,
        "id": "relation2984734830",
        "maxSelect": 1,
        "minSelect": 0,
        "name": "restaurant_id",
        "presentable": false,
        "required": true,
        "system": false,
        "type": "relation"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text1631579359",
        "max": 100,
        "min": 0,
        "name": "session_id",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "autogeneratePattern": "",
        "hidden": false,
        "id": "text2783163181",
        "max": 50,
        "min": 0,
        "name": "ip",
        "pattern": "",
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": "text"
      },
      {
        "hidden": false,
        "id": "select99058195",
        "maxSelect": 0,
        "name": "device_type",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "mobile",
          "desktop",
          "tablet"
        ]
      },
      {
        "hidden": false,
        "id": "bool3824458182",
        "name": "is_pwa_installed",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "bool"
      },
      {
        "hidden": false,
        "id": "number4033658627",
        "max": null,
        "min": null,
        "name": "visit_count",
        "onlyInt": false,
        "presentable": false,
        "required": false,
        "system": false,
        "type": "number"
      },
      {
        "hidden": false,
        "id": "date1648226099",
        "max": "",
        "min": "",
        "name": "first_visit",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      },
      {
        "hidden": false,
        "id": "date557178658",
        "max": "",
        "min": "",
        "name": "last_visit",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "date"
      }
    ],
    "id": "pbc_993721382",
    "indexes": [],
    "listRule": null,
    "name": "visitors",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_993721382");

  return app.delete(collection);
})
