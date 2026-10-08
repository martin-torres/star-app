/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_113412683")

  // add field: bundleItems (JSON array of items in the bundle)
  collection.fields.addAt(7, new Field({
    "hidden": false,
    "id": "json_bundle_items",
    "name": "bundleItems",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field: discountType (select: fixed or percent)
  collection.fields.addAt(8, new Field({
    "hidden": false,
    "id": "select_discount_type",
    "maxSelect": 1,
    "name": "discountType",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "select",
    "values": ["fixed", "percent"]
  }))

  // add field: discountValue (number)
  collection.fields.addAt(9, new Field({
    "hidden": false,
    "id": "number_discount_value",
    "max": null,
    "min": 0,
    "name": "discountValue",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // add field: originalPrice (sum of individual items)
  collection.fields.addAt(10, new Field({
    "hidden": false,
    "id": "number_original_price",
    "max": null,
    "min": 0,
    "name": "originalPrice",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_113412683")

  // remove field
  collection.fields.removeById("json_bundle_items")

  // remove field
  collection.fields.removeById("select_discount_type")

  // remove field
  collection.fields.removeById("number_discount_value")

  // remove field
  collection.fields.removeById("number_original_price")

  return app.save(collection)
})
