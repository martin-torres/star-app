/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const orders = app.findCollectionByNameOrId("orders")
  const settings = app.findCollectionByNameOrId("restaurant_settings")

  // orders.payWithAmount (number, optional)
  orders.fields.addAt(8, new Field({
    "hidden": false,
    "id": "number3126051401",
    "max": null,
    "min": null,
    "name": "payWithAmount",
    "onlyInt": false,
    "presentable": false,
    "required": false,
    "system": false,
    "type": "number"
  }))

  // orders.transferScreenshot (file, optional)
  orders.fields.addAt(9, new Field({
    "hidden": false,
    "id": "file3126051402",
    "maxSelect": 1,
    "maxSize": 0,
    "mimeTypes": [
      "image/x-xpixmap",
      "image/png",
      "image/jpeg",
      "image/bmp",
      "image/heic",
      "image/heif",
      "image/webp"
    ],
    "name": "transferScreenshot",
    "presentable": false,
    "protected": false,
    "required": false,
    "system": false,
    "thumbs": [],
    "type": "file"
  }))

  // restaurant_settings.backgroundColor (text, optional)
  settings.fields.addAt(10, new Field({
    "autogeneratePattern": "",
    "hidden": false,
    "id": "text3126051403",
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

  app.save(orders)
  return app.save(settings)
}, (app) => {
  const orders = app.findCollectionByNameOrId("orders")
  const settings = app.findCollectionByNameOrId("restaurant_settings")

  orders.fields.removeById("number3126051401")
  orders.fields.removeById("file3126051402")
  settings.fields.removeById("text3126051403")

  app.save(orders)
  return app.save(settings)
})
