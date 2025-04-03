import React, { ReactNode } from 'react';
import {
  hasPermission,
  hasAnyPermission,
  hasAllPermissions,
} from '../../utils/permissions';
import { isBrowser } from 'utils/utils';

interface PermissionGuardProps {
  permission?: string;
  anyPermissions?: string[];
  allPermissions?: string[];
  children: ReactNode;
  fallback?: ReactNode;
}

const PermissionGuard: React.FC<PermissionGuardProps> = ({
  permission,
  anyPermissions,
  allPermissions,
  children,
  fallback = null,
}) => {
  const getUserRole = (): string | null => {
    if (!isBrowser) return null;

    try {
      const userStr = localStorage.getItem('token');
      if (!userStr) return null;

      const user = JSON.parse(userStr);
      return user.role;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  };

  const userRole = getUserRole();

  if (!userRole) return fallback;

  let hasAccess = false;

  if (permission) {
    hasAccess = hasPermission(userRole, permission);
  } else if (anyPermissions && anyPermissions.length > 0) {
    hasAccess = hasAnyPermission(userRole, anyPermissions);
  } else if (allPermissions && allPermissions.length > 0) {
    hasAccess = hasAllPermissions(userRole, allPermissions);
  }

  return hasAccess ? <>{children}</> : <>{fallback}</>;
};

export default PermissionGuard;
