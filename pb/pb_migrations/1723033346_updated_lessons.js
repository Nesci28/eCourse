/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
  const dao = new Dao(db);
  const collection = dao.findCollectionByNameOrId("b36lt0a0v5anqh3");

  // update
  collection.schema.addField(
    new SchemaField({
      system: false,
      id: "dsrdszdy",
      name: "duration",
      type: "text",
      required: false,
      presentable: false,
      unique: false,
      options: {
        min: null,
        max: null,
        pattern: "",
      },
    }),
  );

  return dao.saveCollection(collection);
});
