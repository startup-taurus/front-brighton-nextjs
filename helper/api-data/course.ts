import { getFetcher, postFetcher } from "../api";

export const getCourseById = (courseId: string) => {
  return getFetcher(`/course/get-one/${courseId}`, false);
};
export const getCourseWithStudents = (courseId: string) => {
  return getFetcher(`/course/get-students/${courseId}`, false);
};

export const getActiveCourses = (page: number, limit: number,  searchTerm = "") => {
  return getFetcher(`/course/get-active?page=${page}&limit=${limit}&search=${searchTerm}`, false);
};

