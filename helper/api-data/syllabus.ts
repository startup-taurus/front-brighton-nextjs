import { getFetcher, postFetcher, putFetcher } from '../api';

export const getAllSyllabus = (
  page: number,
  limit: number,
  filters?: any
) => {
  const filterParams = filters ? `&${Object.entries(filters).map(([k, v]) => `${k}=${encodeURIComponent(String(v))}`).join('&')}` : '';
  return getFetcher(
    `/syllabus/get-all?page=${page}&limit=${limit}${filterParams}`,
    false
  );
};

export const getSyllabusById = (id: number) => {
  return getFetcher(`/syllabus/${id}`, false);
};

export const createSyllabus = (data: any) => {
  return postFetcher('/syllabus/create', data);
};

export const updateSyllabus = (id: number, data: any) => {
  return putFetcher(`/syllabus/update/${id}`, data);
};
export const createAssignmentGradingItem = (data: any) => {
  return postFetcher("/syllabus/create-assignment-item", data);
};
export const updateAssignmentGradingItem = (data: any) => {
  return putFetcher(`/syllabus/update-assignment-item`, data);
};

export const getFinalPercentageBySyllabusId = (syllabusId: string) => {
  return getFetcher(`/syllabus/get-percentages-by-syllabus/${syllabusId}`, false);
};
