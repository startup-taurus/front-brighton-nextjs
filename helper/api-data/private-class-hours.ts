import { getFetcher, postFetcher, putFetcher, deleteFetcher } from "../api";

export const getPrivateClassesByCourse = (courseId: string) => {
  return getFetcher(`/private-class-hours/course/${courseId}`, false);
};

export const getPrivateClassesByStudent = (studentId: string) => {
  return getFetcher(`/private-class-hours/student/${studentId}`, false);
};

export const createPrivateClass = (data: any) => {
  return postFetcher(`/private-class-hours/create`, data);
};

export const updatePrivateClass = (classId: string, data: any) => {
  return putFetcher(`/private-class-hours/update/${classId}`, data);
};

export const deletePrivateClass = (classId: string) => {
  return deleteFetcher(`/private-class-hours/delete/${classId}`);
};

export const createMultiplePrivateClasses = (courseId: string, entries: any[]) => {
  return postFetcher(`/private-class-hours/bulk-create/${courseId}`, { entries });
};

export const getPrivateClassStats = (courseId: string) => {
  return getFetcher(`/private-class-hours/stats/${courseId}`, false);
};