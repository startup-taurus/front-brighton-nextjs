import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../utils/permissions';
import useSWR from 'swr';
import { getMyPermissions } from '../helper/api-data/permissions';
import { isBrowser } from 'utils/utils';

const usePermission = () => {
  const getStoredRole = (): string | null => {
    if (!isBrowser()) return null;
    try {
      const cookieToken = Cookies.get('token');
      if (cookieToken) {
        const user = JSON.parse(cookieToken);
        if (user && user.role) {
          return user.role;
        }
      }
      const userStr = localStorage.getItem('token');
      if (!userStr) return null;
      const user = JSON.parse(userStr);
      if (user && user.role) {
        return user.role;
      }
    } catch (error) {
      return null;
    }
    return null;
  };

  const [userRole] = useState<string | null>(() => getStoredRole());
  const [permissionSet, setPermissionSet] = useState<Set<string> | null>(null);
 

  const { data: backendPermissions } = useSWR(
    userRole ? ['/permissions/me'] : null,
    () => getMyPermissions(),
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      revalidateOnMount: true,
      shouldRetryOnError: false,
    }
  );

  useEffect(() => {
    if (!backendPermissions?.data) return;
    const list = Array.isArray(backendPermissions.data)
      ? backendPermissions.data
      : backendPermissions.data.permissions || [];
    setPermissionSet(new Set(list));
    try {
      if (isBrowser()) {
        localStorage.setItem('permissions', JSON.stringify(list));
      }
    } catch {}
  }, [backendPermissions]);

  const canPermission = (permission: string): boolean => {
    if (!permissionSet) return false;
    return permissionSet.has(permission);
  };

  const canAny = (permissions: string[]): boolean => {
    if (!permissionSet) return false;
    return permissions.some((requiredPermission) => permissionSet.has(requiredPermission));
  };

  const canAll = (permissions: string[]): boolean => {
    if (!permissionSet) return false;
    return permissions.every((requiredPermission) => permissionSet.has(requiredPermission));
  };

  return {
    userRole,
    permissionSet,
    canPermission,
    canAny,
    canAll,
  };
};

export default usePermission;
