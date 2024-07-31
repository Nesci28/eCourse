/// <reference path="../pb_data/types.d.ts" />
migrate((db) => {
    const collection = new Collection({
      "id": "wvwoh0upoquadzw",
      "created": "2024-07-31 15:12:18.347Z",
      "updated": "2024-07-31 15:12:18.347Z",
      "name": "course_progressions",
      "type": "base",
      "system": false,
      "schema": [
        {
          "system": false,
          "id": "m29iwhqw",
          "name": "course",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "7jo5p6lzwwht0s5",
            "cascadeDelete": false,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "xvuqs5n0",
          "name": "assignee",
          "type": "relation",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "collectionId": "_pb_users_auth_",
            "cascadeDelete": true,
            "minSelect": null,
            "maxSelect": 1,
            "displayFields": null
          }
        },
        {
          "system": false,
          "id": "jmie1g1a",
          "name": "title",
          "type": "text",
          "required": true,
          "presentable": false,
          "unique": false,
          "options": {
            "min": null,
            "max": null,
            "pattern": ""
          }
        },
      ],
      "indexes": [],
      "listRule": "@request.auth.id != \"\" && course.assignees.id ?= @request.auth.id",
      "viewRule": "@request.auth.id != \"\" && course.assignees.id ?= @request.auth.id",
      "createRule": null,
      "updateRule": "@request.auth.id != \"\" && course.assignees.id ?= @request.auth.id",
      "deleteRule": null,
      "options": {}
    });
  
    return Dao(db).saveCollection(collection);
  }, (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("wvwoh0upoquadzw");
  
    return dao.deleteCollection(collection);
  })
  