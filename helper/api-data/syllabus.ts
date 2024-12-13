import { getFetcher, postFetcher, putFetcher } from "../api";
export const getAllSyllabus = (page: number, limit: number) => {
  return getFetcher(`/syllabus/get-all?page=${page}&limit=${limit}`, false);
};

export const getActiveSyllabus = (page: number, limit: number) => {
  return getFetcher(`/syllabus/get-active?page=${page}&limit=${limit}`, false);
};

export const getSyllabusById = (id: string) => {
  return getFetcher(`/syllabus/get-syllabus/${id}`, false);
};

export const createSyllabus = (data: any) => {
  return postFetcher("/syllabus/create", data);
};

export const updateSyllabus = (syllabusId: number, data: any) => {
  return putFetcher(`/syllabus/update/${syllabusId}`, data);
};
