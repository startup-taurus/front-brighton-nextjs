import { getFetcher, patchFetcher, postFetcher, putFetcher } from "../api";

export const getCancelledLessonsByCourse = (courseId: string) => {
  return getFetcher(`/cancelled-lesson/get-all-by-course/${courseId}`, false);
};

export const createCancelLesson = (data: any) => {
  return postFetcher(`/cancelled-lesson/create`, data);
};

export const updateCancelLesson = (id: number, data: any) => {
  return patchFetcher(`/cancelled-lesson/update/${id}`, data);
};

export const deleteCancelledLesson = (id: number) => {
  return postFetcher(`/cancelled-lesson/delete/${id}`, {});
};
