import { getFetcher } from '../api';
import { patchFetcher } from '../api';

export const getMyPermissions = () => {
  return getFetcher('/permissions/me', false);
};

export const getPermissionsByRole = (role: string) => {
  return getFetcher(`/permissions/by-role/${role}`, false);
};

export const updatePermissionsByRole = (role: string, permissions: string[]) => {
  return patchFetcher(`/permissions/by-role/${role}`, { permissions });
};
