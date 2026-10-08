/// <reference path="../pb_data/types.d.ts" />
migrate((app) => {
  const settings = app.findCollectionByNameOrId("restaurant_settings")

  settings.fields.addAt(22, new Field({
    "hidden": false,
    "id": "json3126051404",
    "maxSize": 0,
    "name": "uiText",
    "presentable": false,
    "required": false,
    "system": false,
    "type": "json"
  }))

  return app.save(settings)
}, (app) => {
  const settings = app.findCollectionByNameOrId("restaurant_settings")
  settings.fields.removeById("json3126051404")
  return app.save(settings)
})
