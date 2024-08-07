/// <reference path="../pb_data/types.d.ts" />
migrate(
  (db) => {
    const collection = new Collection({
      id: "fsgdhocigluuank",
      created: "2024-08-07 15:12:18.347Z",
      updated: "2024-08-07 15:12:18.347Z",
      name: "course_certificates",
      type: "base",
      system: false,
      schema: [
        {
          system: false,
          id: "mizewzkd",
          name: "course",
          type: "relation",
          required: true,
          presentable: false,
          unique: false,
          options: {
            collectionId: "7jo5p6lzwwht0s5",
            cascadeDelete: false,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        // {
        //   system: false,
        //   id: "ahegeyjp",
        //   name: "progress",
        //   type: "relation",
        //   required: true,
        //   presentable: false,
        //   unique: false,
        //   options: {
        //     collectionId: "wvwoh0upoquadzw",
        //     cascadeDelete: false,
        //     minSelect: null,
        //     maxSelect: 1,
        //     displayFields: null,
        //   },
        // },
        {
          system: false,
          id: "drvyxmlj",
          name: "assignee",
          type: "relation",
          required: true,
          presentable: false,
          unique: false,
          options: {
            collectionId: "_pb_users_auth_",
            cascadeDelete: true,
            minSelect: null,
            maxSelect: 1,
            displayFields: null,
          },
        },
        {
          system: false,
          id: "bpwngbyf",
          name: "certificate",
          type: "file",
          required: true,
          presentable: false,
          unique: false,
          options: {
            maxSelect: 1,
            maxSize: 2147483648,
            mimeTypes: ["application/pdf"],
            thumbs: [],
            protected: false,
          },
        },
      ],
      indexes: [],
      listRule:
        '@request.auth.id != "" && course.assignees.id ?= @request.auth.id',
      viewRule:
        '@request.auth.id != "" && course.assignees.id ?= @request.auth.id',
      createRule: null,
      updateRule:
        '@request.auth.id != "" && course.assignees.id ?= @request.auth.id',
      deleteRule: null,
      options: {},
    });

    return Dao(db).saveCollection(collection);
  },
  (db) => {
    const dao = new Dao(db);
    const collection = dao.findCollectionByNameOrId("fsgdhocigluuank");

    return dao.deleteCollection(collection);
  },
);
