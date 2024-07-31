import PocketBase from "pocketbase";
import { writable } from "svelte/store";
import { showAlert } from "./store";

const getUrl = () => {
  return import.meta.env.DEV ? import.meta.env.VITE_DEV_PB_URL : import.meta.env.VITE_PROD_PB_URL;
}

const url = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL : getUrl();

export const pb = new PocketBase(
  url
);

export const currentUser = writable(pb.authStore.model);
export const courses = writable([]);
export const lessons = writable([]);
export const progress = writable([]);
export const resources = writable([]);
export const lesson_faqs = writable([]);
export const lesson_resources = writable([]);
export const course_progressions = writable([]);

pb.authStore.onChange(() => {
  currentUser.set(pb.authStore.model);
});

// function to fetch all the records from PocketBase
export const fetchRecords = async () => {
  try {
    const courseRecords = await pb.collection("courses").getFullList({
      sort: "created",
    });

    const lessonRecords = await pb.collection("lessons").getFullList({
      sort: "created",
    });

    const progressRecords = await pb.collection("progress").getFullList({
      sort: "created",
    });

    const resourceRecords = await pb.collection("resources").getFullList({
      sort: "created",
    });

    const lessonFaqsRecords = await pb.collection("lesson_faqs").getFullList({
      sort: "created",
    });

    const courseProgressionRecords = await pb.collection("course_progressions").getFullList({
      sort: "created",
    });

    const lessonResourcesRecords = await pb
      .collection("lesson_resources")
      .getFullList({
        sort: "created",
      });

    courses.set(courseRecords);
    lessons.set(lessonRecords);
    progress.set(progressRecords);
    resources.set(resourceRecords);
    lesson_faqs.set(lessonFaqsRecords);
    lesson_resources.set(lessonResourcesRecords);
    course_progressions.set(courseProgressionRecords);
  } catch (error) {
    showAlert("Failed to load data. Please try again", "fail");
  }
};

// function to update the progress status for a user
export const updateProgressStatus = async (progressRecordId, newStatus) => {
  try {
    const data = {
      status: newStatus,
    };
    const progressRecord = await pb
      .collection("progress")
      .update(progressRecordId, data);
    return progressRecord;
  } catch (error) {
    showAlert("Failed to update course status. Please try again", "fail");
  }
};

// function to update the lesson progression for a user
export const updateCourseProgression = async (courseProgressionId, lessonTitle) => {
  try {
    const data = {
      title: lessonTitle,
    };
    const courseProgressionRecord = await pb
      .collection("course_progressions")
      .update(courseProgressionId, data);
    return courseProgressionRecord;
  } catch (error) {
    showAlert("Failed to update course progression. Please try again", "fail");
  }
}
