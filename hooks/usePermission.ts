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
  const [userRole, setUserRole] = useState<string | null>(null);
  const [permissionSet, setPermissionSet] = useState<Set<string> | null>(null);

  useEffect(() => {
    if (!isBrowser()) return;

    try {
      const cookieToken = Cookies.get('token');
      
      if (cookieToken) {
        const user = JSON.parse(cookieToken);
        if (user && user.role) {
          setUserRole(user.role);
          return;
        }
      }

      const userStr = localStorage.getItem('token');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      if (user && user.role) {
        setUserRole(user.role);
      }
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  }, []);

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
  }, [backendPermissions]);

  const can = (permission: string): boolean => {
    if (permissionSet) return permissionSet.has(permission);
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const canAny = (permissions: string[]): boolean => {
    if (permissionSet) return permissions.some((p) => permissionSet.has(p));
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissions);
  };

  const canAll = (permissions: string[]): boolean => {
    if (permissionSet) return permissions.every((p) => permissionSet.has(p));
    if (!userRole) return false;
    return hasAllPermissions(userRole, permissions);
  };

  return {
    userRole,
    permissionSet,
    can,
    canAny,
    canAll,
  };
};

export default usePermission;
