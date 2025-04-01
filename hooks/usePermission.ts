import { useEffect, useState } from 'react';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../utils/permissions';

const usePermission = () => {
  const [userRole, setUserRole] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const userStr = localStorage.getItem('token');
      if (!userStr) return;

      const user = JSON.parse(userStr);
      setUserRole(user.role);
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
