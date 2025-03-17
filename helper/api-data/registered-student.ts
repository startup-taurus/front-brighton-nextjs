import { deleteFetcher, getFetcher, postFetcher, putFetcher } from '../api';
export const getAllRegisteredStudents = (
  page: number,
  rowPerPage: number,
  filters?: string
) => {
  return getFetcher(
    `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    false
  );
};

export const createRegisteredStudent = (data: any) => {
  return postFetcher('/registered-student/create', data);
};

export const updateRegisteredStudent = (studentId: number, data: any) => {
  return putFetcher(`/registered-student/update/${studentId}`, data);
};

export const deleteRegisteredStudent = (studentId: number) => {
  return deleteFetcher(`/registered-student/delete/${studentId}`);
};
