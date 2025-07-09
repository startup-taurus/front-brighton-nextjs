import { getFetcher } from '../api';

export const getAllLevels = (
  page: number, 
  limit: number, 
  searchTerm = '', 
  all = false
) => {
  const allParam = all ? '&all=true' : '';
  return getFetcher(
    `/level/get-all?page=${page}&limit=${limit}${searchTerm ? `&search=${searchTerm}` : ''}${allParam}`,
    false
  );
};
