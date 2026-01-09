import { getFetcher, putFetcher } from "../api";

export const getCourseScheduleDates = (courseId: string) => {
  return getFetcher(
    `/course-schedule/get-syllabus-by-course/${courseId}`,
    false,
  );
};

export const updateLessonTaught = (lessonId: number, data: any) => {
  return putFetcher(
    `/course-schedule/update-course-schedule/${lessonId}`,
    data,
  );
};
