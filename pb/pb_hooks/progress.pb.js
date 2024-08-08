// create progress records for every assignee added when a course record is created
onRecordAfterCreateRequest((e) => {
  const record = e.record;
  const progressCollection = $app.dao().findCollectionByNameOrId("progress");
  const courseProgressionCollection = $app
    .dao()
    .findCollectionByNameOrId("course_progressions");
  const usersCollection = $app.dao().findCollectionByNameOrId("users");
  const assign_to_everyone = record.getBool("assign_to_everyone");
  let assignees = record.getStringSlice("assignees");

  if (assign_to_everyone) {
    const allUsers = $app.dao().findRecordsByExpr(usersCollection.name);
    assignees = allUsers.map((user) => user.id);
    record.set("assignees", assignees);
    $app.dao().saveRecord(record);
  }

  assignees.forEach((assignee) => {
    const progressRecord = new Record(progressCollection, {
      course: record.id,
      assignee: assignee,
      status: "Not Started",
    });
    $app.dao().saveRecord(progressRecord);

    const courseProgressionRecord = new Record(courseProgressionCollection, {
      course: record.id,
      assignee,
      title: "",
    });
    $app.dao().saveRecord(courseProgressionRecord);
  });
}, "courses");

// create/delete progress records for every assignee added/removed when a course record is updated
onRecordAfterUpdateRequest((e) => {
  const updatedRecord = e.record;
  const originalRecord = updatedRecord.originalCopy();
  const originalAssignees = originalRecord.getStringSlice("assignees");
  let updatedAssignees = updatedRecord.getStringSlice("assignees");
  const progressCollection = $app.dao().findCollectionByNameOrId("progress");
  const courseProgressionsCollection = $app
    .dao()
    .findCollectionByNameOrId("course_progressions");
  const usersCollection = $app.dao().findCollectionByNameOrId("users");
  const assign_to_everyone = updatedRecord.getBool("assign_to_everyone");

  if (assign_to_everyone) {
    const allUsers = $app.dao().findRecordsByExpr(usersCollection.name);
    updatedAssignees = allUsers.map((user) => user.id);
    updatedRecord.set("assignees", updatedAssignees);
    $app.dao().saveRecord(updatedRecord);
  }

  const newAssignees = updatedAssignees.filter(
    (assignee) => !originalAssignees.includes(assignee),
  );
  const removedAssignees = originalAssignees.filter(
    (assignee) => !updatedAssignees.includes(assignee),
  );

  newAssignees.forEach((assignee) => {
    const progressRecord = new Record(progressCollection, {
      course: updatedRecord.id,
      assignee: assignee,
      status: "Not Started",
    });
    $app.dao().saveRecord(progressRecord);

    const courseProgressionRecord = new Record(courseProgressionsCollection, {
      course: updatedRecord.id,
      assignee: assignee,
      title: "",
    });
    $app.dao().saveRecord(courseProgressionRecord);
  });

  removedAssignees.forEach((assignee) => {
    const progressRecords = $app.dao().findRecordsByExpr(
      progressCollection.name,
      $dbx.hashExp({
        assignee: `${assignee}`,
        course: `${updatedRecord.id}`,
      }),
    );
    progressRecords.forEach((progressRecord) => {
      $app.dao().deleteRecord(progressRecord);
    });

    const courseProgressionRecords = $app.dao().findRecordsByExpr(
      courseProgressionsCollection.name,
      $dbx.hashExp({
        assignee: `${assignee}`,
        course: `${updatedRecord.id}`,
      }),
    );
    courseProgressionRecords.forEach((courseProgression) => {
      $app.dao().deleteRecord(courseProgression);
    });
  });
}, "courses");

// remove assignees from course records when their corresponding progress records are deleted
onRecordAfterDeleteRequest((e) => {
  const deletedProgressRecord = e.record;
  const courseId = deletedProgressRecord.getString("course");

  if (courseId) {
    $app.dao().runInTransaction((txDao) => {
      const courseRecord = txDao.findRecordById("courses", courseId);

      if (courseRecord) {
        const assignees = courseRecord.getStringSlice("assignees");
        const assigneeToRemove = deletedProgressRecord.get("assignee");
        const updatedAssignees = assignees.filter(
          (assignee) => assignee !== assigneeToRemove,
        );

        courseRecord.set("assignees", updatedAssignees);
        txDao.saveRecord(courseRecord);
      }
    });
  }
}, "progress");

// reset the course and assignee fields to their original values when they get updated
onRecordAfterUpdateRequest((e) => {
  const updatedRecord = e.record;
  const originalRecord = updatedRecord.originalCopy();

  const assigneeId = updatedRecord.getString("assignee");
  const courseId = updatedRecord.getString("course");
  const originalAssigneeId = originalRecord.getString("assignee");
  const originalCourseId = originalRecord.getString("course");
  const status = updatedRecord.getString("status");

  if (assigneeId !== originalAssigneeId || courseId !== originalCourseId) {
    updatedRecord.set("course", originalCourseId);
    updatedRecord.set("assignee", originalAssigneeId);

    $app.dao().saveRecord(updatedRecord);
  }

  // Create the certificate
  if (status === "Completed") {
    const assigneeRecord = $app.dao().findRecordById("users", assigneeId);
    const fullName = assigneeRecord.getString("username");

    const courseRecord = $app.dao().findRecordById("courses", courseId);
    const courseName = courseRecord.getString("title");

    const pdfApiUrl = process.env.PDF_API_URL;

    try {
      let courseCertificateRecord = undefined;
      try {
        courseCertificateRecord = $app
          .dao()
          .findFirstRecordByFilter(
            "course_certificates",
            "assignee = {:assigneeId} && course = {:courseId}",
            { assigneeId, courseId },
          );
      } catch (_) {}
      const hasFile = courseCertificateRecord
        ? courseCertificateRecord.getString("certificate")
        : undefined;
      if (hasFile) {
        return;
      }

      const collection = $app
        .dao()
        .findCollectionByNameOrId("course_certificates");
      const record = new Record(collection);
      const form = new RecordUpsertForm($app, record);

      form.loadData({
        course: courseId,
        assignee: assigneeId,
      });

      const completionAt = new Date().toISOString();
      const pdfFile = $filesystem.fileFromUrl(
        `${pdfApiUrl}?fullName=${fullName}&courseName=${courseName}&completionAt=${completionAt}`,
      );

      const v4 = () => {
        // Public Domain/MIT
        var d = new Date().getTime(); //Timestamp
        var d2 =
          (typeof performance !== "undefined" &&
            performance.now &&
            performance.now() * 1000) ||
          0; //Time in microseconds since page-load or 0 if unsupported
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
          /[xy]/g,
          function (c) {
            var r = Math.random() * 16; //random number between 0 and 16
            if (d > 0) {
              //Use timestamp until depleted
              r = (d + r) % 16 | 0;
              d = Math.floor(d / 16);
            } else {
              //Use microseconds since page-load if supported
              r = (d2 + r) % 16 | 0;
              d2 = Math.floor(d2 / 16);
            }
            return (c === "x" ? r : (r & 0x3) | 0x8).toString(16);
          },
        );
      };

      const formattedDate = new Date(completionAt)
        .toLocaleDateString()
        .padStart(10, "0");
      const name =
        `${v4()}_certificate_${fullName}_${courseName}_${formattedDate}.pdf`
          .replace(/ /g, "_")
          .replace(/\//g, "-");
      pdfFile.name = name;
      form.addFiles("certificate", pdfFile);

      form.submit();
    } catch (err) {
      console.log(err);
    }
  }
}, "progress");

// add assignee to the corresponding course record when a progress record is created
onRecordAfterCreateRequest((e) => {
  const progressRecord = e.record;
  const assignee = progressRecord.getString("assignee");
  const courseId = progressRecord.getString("course");

  if (courseId) {
    const courseRecord = $app.dao().findRecordById("courses", courseId);

    if (courseRecord) {
      const assignees = courseRecord.getStringSlice("assignees");
      if (!assignees.includes(assignee)) {
        assignees.push(assignee);

        courseRecord.set("assignees", assignees);
        $app.dao().saveRecord(courseRecord);
      }
    }
  }
}, "progress");

// add new users to courses that are assigned to everyone and create progress records for them
onRecordAfterCreateRequest((e) => {
  const newUser = e.record;
  const progressCollection = $app.dao().findCollectionByNameOrId("progress");
  const courseProgressionsCollection = $app
    .dao()
    .findCollectionByNameOrId("course_progressions");
  const coursesCollection = $app.dao().findCollectionByNameOrId("courses");

  const assignedToEveryoneCourses = $app
    .dao()
    .findRecordsByExpr(
      coursesCollection.name,
      $dbx.hashExp({ assign_to_everyone: true }),
    );

  assignedToEveryoneCourses.forEach((course) => {
    const assignees = course.getStringSlice("assignees");
    if (!assignees.includes(newUser.id)) {
      assignees.push(newUser.id);
      course.set("assignees", assignees);
      $app.dao().saveRecord(course);

      const progressRecord = new Record(progressCollection, {
        course: course.id,
        assignee: newUser.id,
        status: "Not Started",
      });
      $app.dao().saveRecord(progressRecord);

      const courseProgressionRecord = new Record(courseProgressionsCollection, {
        course: course.id,
        assignee: newUser.id,
        title: "",
      });
      $app.dao().saveRecord(courseProgressionRecord);
    }
  });
}, "users");
