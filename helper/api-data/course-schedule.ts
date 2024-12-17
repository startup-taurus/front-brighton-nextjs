import { getFetcher, patchFetcher } from "../api";

export const getCourseScheduleDates = (courseId: string) => {
  return getFetcher(
    `/course-schedule/get-syllabus-by-course/${courseId}`,
    false,
  );
};

export const updateLessonTaught = (lessonId: number, data: any) => {
  return patchFetcher(
    `/course-schedule/update-course-schedule/${lessonId}`,
    data,
  );
};
