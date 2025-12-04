import { getFetcher } from '../api';
import { patchFetcher } from '../api';
import { putFetcher } from '../api';
import { postFetcher } from '../api';

export const getRoles = () => {
  return getFetcher('/roles', false);
};

export const updateRoleMeta = (role: string, data: { name?: string; status?: string | number }) => {
  return putFetcher(`/roles/${role}`, data);
};

export const patchRoleMeta = (role: string, data: { name?: string; status?: string | number }) => {
  return patchFetcher(`/roles/${role}`, data);
};

export const createRole = (data: { name: string; status?: string | number }) => {
  return postFetcher(`/roles`, data);
};