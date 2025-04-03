import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { hasPermission } from '../../utils/permissions';
import { PERMISSIONS } from '../../utils/permissions';
import { isBrowser } from 'utils/utils';

interface NavItem {
  title: string;
  path: string;
  icon?: string;
  permission: string;
  children?: NavItem[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: 'home',
    permission: PERMISSIONS.VIEW_DASHBOARD,
  },
  {
    title: 'Students',
    path: '/admin/students',
    icon: 'users',
    permission: PERMISSIONS.VIEW_STUDENTS,
    children: [
      {
        title: 'All Students',
        path: '/admin/students',
        permission: PERMISSIONS.VIEW_STUDENTS,
      },
      {
        title: 'Add Student',
        path: '/admin/students/add',
        permission: PERMISSIONS.CREATE_STUDENT,
      },
    ],
  },
  {
    title: 'Teachers',
    path: '/admin/teachers',
    icon: 'user',
    permission: PERMISSIONS.VIEW_TEACHERS,
    children: [
      {
        title: 'All Teachers',
        path: '/admin/teachers',
        permission: PERMISSIONS.VIEW_TEACHERS,
      },
      {
        title: 'Add Teacher',
        path: '/admin/teachers/add',
        permission: PERMISSIONS.CREATE_TEACHER,
      },
    ],
  },
  {
    title: 'Courses',
    path: '/admin/courses',
    icon: 'book',
    permission: PERMISSIONS.VIEW_COURSES,
    children: [
      {
        title: 'All Courses',
        path: '/admin/courses',
        permission: PERMISSIONS.VIEW_COURSES,
      },
      {
        title: 'Add Course',
        path: '/admin/courses/add',
        permission: PERMISSIONS.CREATE_COURSE,
      },
    ],
  },
  {
    title: 'Syllabus',
    path: '/admin/syllabus',
    icon: 'file-text',
    permission: PERMISSIONS.VIEW_SYLLABUS,
  },
  {
    title: 'Holidays',
    path: '/admin/holidays',
    icon: 'calendar',
    permission: PERMISSIONS.VIEW_HOLIDAYS,
  },
  {
    title: 'Users',
    path: '/admin/users',
    icon: 'users',
    permission: PERMISSIONS.VIEW_USERS,
  },
  {
    title: 'Financial',
    path: '/admin/financial',
    icon: 'dollar-sign',
    permission: PERMISSIONS.VIEW_PAYMENTS,
    children: [
      {
        title: 'Payments',
        path: '/admin/financial/payments',
        permission: PERMISSIONS.VIEW_PAYMENTS,
      },
      {
        title: 'Reports',
        path: '/admin/financial/reports',
        permission: PERMISSIONS.VIEW_FINANCIAL_REPORTS,
      },
    ],
  },
];

interface PermissionBasedNavigationProps {
  className?: string;
}

const PermissionBasedNavigation: React.FC<PermissionBasedNavigationProps> = ({
  className = '',
}) => {
  const router = useRouter();

  const getUserRole = (): string | null => {
    if (!isBrowser()) return null;

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

  if (!userRole) return null;

  const filteredNavItems = navigationItems.filter((item) => {
    return hasPermission(userRole, item.permission);
  });

  return (
    <div className={`permission-based-navigation ${className}`}>
      <ul className='nav-menu'>
        {filteredNavItems.map((item, index) => {
          const isActive =
            router.pathname === item.path ||
            (item.children &&
              item.children.some((child) => router.pathname === child.path));

          return (
            <li
              key={index}
              className={`nav-item ${isActive ? 'active' : ''}`}
            >
              <Link href={item.path}>
                <a className='nav-link'>
                  {item.icon && <i className={`feather icon-${item.icon}`}></i>}
                  <span>{item.title}</span>
                </a>
              </Link>

              {item.children && item.children.length > 0 && (
                <ul className='sub-menu'>
                  {item.children
                    .filter((child) =>
                      hasPermission(userRole, child.permission)
                    )
                    .map((child, childIndex) => (
                      <li
                        key={childIndex}
                        className={
                          router.pathname === child.path ? 'active' : ''
                        }
                      >
                        <Link href={child.path}>
                          <a>{child.title}</a>
                        </Link>
                      </li>
                    ))}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default PermissionBasedNavigation;
