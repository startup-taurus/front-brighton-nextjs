import { getFetcher, postFetcher, putFetcher } from "../api";

export const getCancelledLessonsByCourse = (courseId: string) => {
  return getFetcher(`/cancelled-lesson/get-all-by-course/${courseId}`, false);
};

export const createCancelLesson = (data: any) => {
  return postFetcher(`/cancelled-lesson/create`, data);
};

export const updateCancelLesson = (id: number, data: any) => {
  return putFetcher(`/cancelled-lesson/update/${id}`, data);
};

export const deleteCancelledLesson = (row: any) => {
  return postFetcher(`/cancelled-lesson/delete`, row);
};
