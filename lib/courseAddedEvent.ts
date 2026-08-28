export const COURSE_ADDED_EVENT = "planner:course-added";

export function announceCourseAdded() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new Event(COURSE_ADDED_EVENT));
  }
}
