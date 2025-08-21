import { getFetcher, postFetcher } from "../api";

export const getAttendance = (courseId: string) => {
  return getFetcher(`/attendance/get-by-course/${courseId}`, false);
};

export const getAttendanceByCourseAndStudent = (
  courseId: string,
  studentId: string,
) => {
  return getFetcher(
    `/attendance/get-attendance-by-student/course/${courseId}/student/${studentId}`,
    false,
  );
};

export const createAttendance = (data: any) => {
  return postFetcher(`/attendance/create`, data);
};

export const getConsecutiveAbsencesReport = () => {
  return getFetcher(`/attendance/consecutive-absences-report`, true);
};
