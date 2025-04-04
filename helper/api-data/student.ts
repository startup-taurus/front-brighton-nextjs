import { getFetcher, postFetcher, putFetcher } from '../api';
export const getAllStudent = (
  page: number,
  limit: number,
  filters?: string
) => {
  return getFetcher(
    `/student/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};
export const getDistinctLevel = (
  page: number ,
  limit: number ,

) => {
  return getFetcher(
    `/student/get-distinct-levels?page=${page}&limit=${limit}`,
    false
  );
};

export const createStudent = (data: any) => {
  return postFetcher('/student/create', data);
};

export const updateStudent = (studentId: number, data: any) => {
  return putFetcher(`/student/update/${studentId}`, data);
};

export const updateStatusStudent = (studentId: number, status: string) => {
  return putFetcher(`/student/update-status/${studentId}`, { status });
};
