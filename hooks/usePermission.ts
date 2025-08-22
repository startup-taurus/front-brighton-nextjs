import { useEffect, useState } from 'react';
import Cookies from 'js-cookie';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../utils/permissions';
import { isBrowser } from 'utils/utils';

const usePermission = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

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

  const can = (permission: string): boolean => {
    if (!userRole) return false;
    return hasPermission(userRole, permission);
  };

  const canAny = (permissions: string[]): boolean => {
    if (!userRole) return false;
    return hasAnyPermission(userRole, permissions);
  };

  const canAll = (permissions: string[]): boolean => {
    if (!userRole) return false;
    return hasAllPermissions(userRole, permissions);
  };

  return {
    userRole,
    can,
    canAny,
    canAll,
  };
};

export default usePermission;
