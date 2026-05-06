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
        "hidden": false,
        "id": "select2546616235",
        "maxSelect": 1,
        "name": "mode",
        "presentable": false,
        "required": false,
        "system": false,
        "type": "select",
        "values": [
          "a",
          "b"
        ]
      }
    ],
    "id": "pbc_3504259215",
    "indexes": [],
    "listRule": null,
    "name": "test_select_max",
    "system": false,
    "type": "base",
    "updateRule": null,
    "viewRule": null
  });

  return app.save(collection);
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3504259215");

  return app.delete(collection);
})
