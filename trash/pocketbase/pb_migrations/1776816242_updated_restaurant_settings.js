/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236958880")

  // add field
  collection.fields.addAt(24, new Field({
    "hidden": false,
    "id": "json3498894604",
    "maxSize": 0,
    "name": "unlock_combo",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(25, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2244344785",
    "max": 0,
    "min": 0,
    "name": "disclaimer_text",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(26, new Field({
    "hidden": false,
    "id": "bool619369945",
    "name": "disclaimer_accepted",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "bool"
  }))

  // add field
  collection.fields.addAt(27, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3631957125",
    "max": 0,
    "min": 0,
    "name": "disclaimer_accepted_by",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(28, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2380753915",
    "max": 0,
    "min": 0,
    "name": "disclaimer_accepted_at",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236958880")

  // remove field
  collection.fields.removeById("json3498894604")

  // remove field
  collection.fields.removeById("text2244344785")

  // remove field
  collection.fields.removeById("bool619369945")

  // remove field
  collection.fields.removeById("text3631957125")

  // remove field
  collection.fields.removeById("text2380753915")

  return app.save(collection)
})
