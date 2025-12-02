import { getFetcher, postFetcher, putFetcher, patchFetcher, deleteFetcher } from '../api';

export const getCourseById = (courseId: string) => {
  return getFetcher(`/course/get-one/${courseId}`, false);
};
export const getCourseWithStudents = (courseId: string) => {
  return getFetcher(`/course/get-students/${courseId}`, false);
};

export const getGradingItems = (courseId: string) => {
  return getFetcher(`/course/get-grading-items/${courseId}`, false);
};

export const getGradingPercentageBySyllabus = (syllabusId: string) => {
  return getFetcher(
    `/course/get-grading-percentage-by-syllabus/${syllabusId}`,
    false
  );
};

export const getActiveCourses = (
  page: number,
  limit: number,
  searchTerm = ''
) => {
  return getFetcher(
    `/course/get-active?page=${page}&limit=${limit}&search=${searchTerm}`,
    false
  );
};

export const getAllCourses = () => {
  return getFetcher(`/course/get-all`, false);
};

export const getCoursesForCalendar = () => {
  return getFetcher('/course/get-calendar', false);
};

export const getCourseWithProfessors = (
  page: number,
  limit: number,
  filters: any
) => {
  return getFetcher(
    `/course/get-all-with-professors?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};

export const getAcademicPerformance = () => {
  return getFetcher(`/course/get-academic-performance`, false);
};

export const createCourse = (data: any) => {
  return postFetcher(`/course/create`, data);
};

export const updateCourse = (curseId: number, data: any) => {
  return putFetcher(`/course/update/${curseId}`, data);
};

export const updateStatusCourse = (courseId: number, status: string) => {
  return putFetcher(`/course/update-status/${courseId}`, { status });
};

export const upsertCourseAssignmentItem = (courseId: string, payload: { itemId?: number | string, name: string }) => {
  return putFetcher(`/course/${courseId}/assignment`, payload);
};

export const deleteCourseAssignmentItem = (
  courseId: string,
  itemId: number | string
) => {
  return deleteFetcher(`/course/${courseId}/assignment/${itemId}`);
};
