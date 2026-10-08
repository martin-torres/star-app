/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // remove field
  collection.fields.removeById("number2157745638")

  // remove field
  collection.fields.removeById("number363968585")

  // remove field
  collection.fields.removeById("number3663105604")

  // remove field
  collection.fields.removeById("number2782324286")

  // remove field
  collection.fields.removeById("json1352541898")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text4236875316",
    "max": 0,
    "min": 0,
    "name": "customerName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2315611599",
    "max": 0,
    "min": 0,
    "name": "customerAddress",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "json3776899405",
    "maxSize": 0,
    "name": "items",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number3257917790",
    "max": null,
    "min": null,
    "name": "total",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_3527180448")

  // add field
  collection.fields.addAt(1, new Field({
    "hidden": false,
    "id": "number2157745638",
    "max": null,
    "min": null,
    "name": "payWithAmount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "hidden": false,
    "id": "number363968585",
    "max": null,
    "min": null,
    "name": "deliveryDistanceKm",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "hidden": false,
    "id": "number3663105604",
    "max": null,
    "min": null,
    "name": "deliveryFee",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "hidden": false,
    "id": "number2782324286",
    "max": null,
    "min": null,
    "name": "timestamp",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "hidden": false,
    "id": "json1352541898",
    "maxSize": 0,
    "name": "statusTimestamps",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // remove field
  collection.fields.removeById("text4236875316")

  // remove field
  collection.fields.removeById("text2315611599")

  // remove field
  collection.fields.removeById("json3776899405")

  // remove field
  collection.fields.removeById("number3257917790")

  return app.save(collection)
})
