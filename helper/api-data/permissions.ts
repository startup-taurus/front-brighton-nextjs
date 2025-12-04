import { getFetcher } from '../api';
import { patchFetcher } from '../api';
import { postFetcher } from '../api';

export const getRoles = () => {
  return getFetcher('/permissions/roles', false); 
};

export const getMyPermissions = () => {
  return getFetcher('/permissions/me', false);
};

export const getPermissionsByRole = (role: string) => {
  return getFetcher(`/permissions/by-role/${role}`, false);
};

export const updatePermissionsByRole = (role: string, permissions: string[]) => {
  return patchFetcher(`/permissions/by-role/${role}`, { permissions });
};

export const syncPermissionsCatalog = () => {
  return postFetcher(`/permissions/sync`, {});
};