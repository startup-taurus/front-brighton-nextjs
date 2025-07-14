import { getFetcher } from '../api';

export const getAllLevels = (page: number, limit: number, searchTerm = '') => {
  return getFetcher(
    `/level/get-all?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}`,
    false
  );
};
