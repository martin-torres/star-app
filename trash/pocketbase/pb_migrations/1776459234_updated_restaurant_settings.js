/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236958880")

  // add field
  collection.fields.addAt(1, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1579384326",
    "max": 0,
    "min": 0,
    "name": "name",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": true,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(2, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3292170333",
    "max": 0,
    "min": 0,
    "name": "shortName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(3, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1767278655",
    "max": 0,
    "min": 0,
    "name": "currency",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(4, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2644588302",
    "max": 0,
    "min": 0,
    "name": "tagline",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(5, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1843675174",
    "max": 0,
    "min": 0,
    "name": "description",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(6, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3070270102",
    "max": 0,
    "min": 0,
    "name": "locationText",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(7, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1408619060",
    "max": 0,
    "min": 0,
    "name": "logoUrl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(8, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text249930527",
    "max": 0,
    "min": 0,
    "name": "heroImageUrl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(9, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text926500146",
    "max": 0,
    "min": 0,
    "name": "heroTitle",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3368015805",
    "max": 0,
    "min": 0,
    "name": "heroSubtitle",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(11, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text817853459",
    "max": 0,
    "min": 0,
    "name": "pickupLocationText",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(12, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2409770035",
    "max": 0,
    "min": 0,
    "name": "adminPin",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(13, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3020697127",
    "max": 0,
    "min": 0,
    "name": "kitchenPin",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(14, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text1394690110",
    "max": 0,
    "min": 0,
    "name": "primaryColor",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(15, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text738595751",
    "max": 0,
    "min": 0,
    "name": "secondaryColor",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(16, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text392674374",
    "max": 0,
    "min": 0,
    "name": "accentColor",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(17, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text52431559",
    "max": 0,
    "min": 0,
    "name": "backgroundColor",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(18, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3676639506",
    "max": 0,
    "min": 0,
    "name": "googleFontUrl",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(19, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text2631652085",
    "max": 0,
    "min": 0,
    "name": "googleFontName",
    "pattern": "",
    "presentable": false,
    "primaryKey": false,
    "required": false,
    "system": false,
    "type": "text"
  }))

  // add field
  collection.fields.addAt(20, new Field({
    "hidden": false,
    "id": "json989021800",
    "maxSize": 0,
    "name": "categories",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(21, new Field({
    "hidden": false,
    "id": "json3304259336",
    "maxSize": 0,
    "name": "uiText",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(22, new Field({
    "hidden": false,
    "id": "json3303149241",
    "maxSize": 0,
    "name": "deliveryRules",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  // add field
  collection.fields.addAt(23, new Field({
    "hidden": false,
    "id": "json1899113732",
    "maxSize": 0,
    "name": "paymentSettings",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(collection)
}, (app) => {
  const collection = app.findCollectionByNameOrId("pbc_2236958880")

  // remove field
  collection.fields.removeById("text1579384326")

  // remove field
  collection.fields.removeById("text3292170333")

  // remove field
  collection.fields.removeById("text1767278655")

  // remove field
  collection.fields.removeById("text2644588302")

  // remove field
  collection.fields.removeById("text1843675174")

  // remove field
  collection.fields.removeById("text3070270102")

  // remove field
  collection.fields.removeById("text1408619060")

  // remove field
  collection.fields.removeById("text249930527")

  // remove field
  collection.fields.removeById("text926500146")

  // remove field
  collection.fields.removeById("text3368015805")

  // remove field
  collection.fields.removeById("text817853459")

  // remove field
  collection.fields.removeById("text2409770035")

  // remove field
  collection.fields.removeById("text3020697127")

  // remove field
  collection.fields.removeById("text1394690110")

  // remove field
  collection.fields.removeById("text738595751")

  // remove field
  collection.fields.removeById("text392674374")

  // remove field
  collection.fields.removeById("text52431559")

  // remove field
  collection.fields.removeById("text3676639506")

  // remove field
  collection.fields.removeById("text2631652085")

  // remove field
  collection.fields.removeById("json989021800")

  // remove field
  collection.fields.removeById("json3304259336")

  // remove field
  collection.fields.removeById("json3303149241")

  // remove field
  collection.fields.removeById("json1899113732")

  return app.save(collection)
})
