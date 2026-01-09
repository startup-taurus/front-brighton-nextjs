import { getFetcher, putFetcher } from "../api";

export const getGradesByCourse = (courseId: string) => {
  return getFetcher(`/student-grades/get-grades-by-course/${courseId}`, false);
};

export const getGradesByCourseAndStudent = (
  courseId: string,
  studentId: string,
) => {
  return getFetcher(
    `/student-grades/get-grades-by-course-and-student/${courseId}/${studentId}`,
    false,
  );
};

export const updateStudentGrade = (data: any) => {
  return putFetcher(`/student-grades/update`, data);
};
