/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_orders_001");

  // Helper function to check if a field exists by name
  const fieldExists = (fieldName) => {
    return collection.fields.some(f => f.name === fieldName);
  };

  // Add all missing fields only if they don't exist
  const fieldsToAdd = [
    { name: 'deliveryDistanceKm', type: 'number' },
    { name: 'deliveryFee', type: 'number' },
    { name: 'sessionId', type: 'text' },
  ];

  fieldsToAdd.forEach(({ name, type }) => {
    if (!fieldExists(name)) {
      const fieldCount = collection.fields.length;
      collection.fields.addAt(fieldCount, new Field({
        "hidden": false,
        "id": "field_" + name,
        "name": name,
        "presentable": false,
        "primaryKey": false,
        "required": false,
        "system": false,
        "type": type,
        ...(type === 'number' ? { min: 0, max: null, onlyInt: false } : {})
      }));
    }
  });

  return dao.saveCollection(collection);
}, (db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("pbc_orders_001");

  // Remove all added fields
