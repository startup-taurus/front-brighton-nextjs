import { getFetcher } from "../api";

export const getCourseById = (courseId: string) => {
  return getFetcher(`/course/get-one/${courseId}`, false);
};
export const getCourseWithStudents = (courseId: string) => {
  return getFetcher(`/course/get-students/${courseId}`, false);
};
