import { getFetcher, postFetcher, putFetcher } from '../api';

export const getAllSyllabus = (
  page: number,
  limit: number,
  filters?: string
) => {
  return getFetcher(
    `/syllabus/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
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
