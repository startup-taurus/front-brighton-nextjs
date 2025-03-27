import { getFetcher, postFetcher, putFetcher } from '../api';

export const getProfessorCourses = (userId: number) => {
  return getFetcher(`/professor/${userId}/courses`, false);
};

export const getAllProfessors = (
  page: number,
  limit: number,
  filters?: any
) => {
  return getFetcher(
    `/professor/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};

export const getActiveProfessors = (
  page: number,
  limit: number,
  searchTerm = ''
) => {
  return getFetcher(
    `/professor/get-active?page=${page}&limit=${limit}&search=${searchTerm}`,
    false
  );
};

export const getProfessorsCoursesAndStudents = () => {
  return getFetcher(`/professor/get-courses-and-students`, false);
};

export const createProfessor = (data: any) => {
  return postFetcher(`/professor/create`, data);
};

export const updateProfessor = (professorId: number, data: any) => {
  return putFetcher(`/professor/update/${professorId}`, data);
};

export const updateStatusProfessor = (professorId: number, status: string) => {
  return putFetcher(`/professor/update-status/${professorId}`, { status });
};
