import { getFetcher, postFetcher } from "../api";

export const getAttendance = (courseId: string) => {
  return getFetcher(`/attendance/get-by-course/${courseId}`, false);
};

export const createAttendance = (data: any) => {
  return postFetcher(`/attendance/create`, data);
};
