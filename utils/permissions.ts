export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',

  // Student management permissions
  VIEW_STUDENTS: 'view_students',
  CREATE_STUDENT: 'create_student',
  EDIT_STUDENT: 'edit_student',
  DELETE_STUDENT: 'delete_student',

  // Teacher management permissions
  VIEW_TEACHERS: 'view_teachers',
  CREATE_TEACHER: 'create_teacher',
  EDIT_TEACHER: 'edit_teacher',
  DELETE_TEACHER: 'delete_teacher',

  // Course management permissions
  VIEW_COURSES: 'view_courses',
  CREATE_COURSE: 'create_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',

  // Syllabus permissions
  VIEW_SYLLABUS: 'view_syllabus',
  CREATE_SYLLABUS: 'create_syllabus',
  EDIT_SYLLABUS: 'edit_syllabus',
  DELETE_SYLLABUS: 'delete_syllabus',

  // Attendance permissions
  VIEW_ATTENDANCE: 'view_attendance',
  MARK_ATTENDANCE: 'mark_attendance',
  EDIT_ATTENDANCE: 'edit_attendance',

  // Gradebook permissions
  VIEW_GRADEBOOK: 'view_gradebook',
  ADD_GRADES: 'add_grades',
  EDIT_GRADES: 'edit_grades',

  // Holiday management permissions
  VIEW_HOLIDAYS: 'view_holidays',
  CREATE_HOLIDAY: 'create_holiday',
  EDIT_HOLIDAY: 'edit_holiday',
  DELETE_HOLIDAY: 'delete_holiday',

  // User management permissions
  VIEW_USERS: 'view_users',
  CREATE_USER: 'create_user',
  EDIT_USER: 'edit_user',
  DELETE_USER: 'delete_user',

  // Financial permissions
  VIEW_PAYMENTS: 'view_payments',
  PROCESS_PAYMENT: 'process_payment',
  VIEW_FINANCIAL_REPORTS: 'view_financial_reports',

  // Student report permissions
  VIEW_STUDENT_REPORTS: 'view_student_reports',
  CREATE_STUDENT_REPORT: 'create_student_report',
  EDIT_STUDENT_REPORT: 'edit_student_report',
};

// Define role-based permissions mapping
export const ROLE_PERMISSIONS = {
  // Admin has access to everything
  admin_staff: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.CREATE_TEACHER,
    PERMISSIONS.EDIT_TEACHER,
    PERMISSIONS.DELETE_TEACHER,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.DELETE_COURSE,
    PERMISSIONS.VIEW_SYLLABUS,
    PERMISSIONS.CREATE_SYLLABUS,
    PERMISSIONS.EDIT_SYLLABUS,
    PERMISSIONS.DELETE_SYLLABUS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.VIEW_GRADEBOOK,
    PERMISSIONS.ADD_GRADES,
    PERMISSIONS.EDIT_GRADES,
    PERMISSIONS.VIEW_HOLIDAYS,
    PERMISSIONS.CREATE_HOLIDAY,
    PERMISSIONS.EDIT_HOLIDAY,
    PERMISSIONS.DELETE_HOLIDAY,
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.DELETE_USER,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_STUDENT_REPORTS,
    PERMISSIONS.CREATE_STUDENT_REPORT,
    PERMISSIONS.EDIT_STUDENT_REPORT,
  ],

  // Professor permissions
  professor: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_SYLLABUS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
    PERMISSIONS.EDIT_ATTENDANCE,
    PERMISSIONS.VIEW_GRADEBOOK,
    PERMISSIONS.ADD_GRADES,
    PERMISSIONS.EDIT_GRADES,
    PERMISSIONS.VIEW_HOLIDAYS,
    PERMISSIONS.VIEW_STUDENT_REPORTS,
    PERMISSIONS.CREATE_STUDENT_REPORT,
    PERMISSIONS.EDIT_STUDENT_REPORT,
  ],

  // Student permissions
  student: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_SYLLABUS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_GRADEBOOK,
    PERMISSIONS.VIEW_HOLIDAYS,
    PERMISSIONS.VIEW_STUDENT_REPORTS,
  ],

  // Financial staff permissions
  financial: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
  ],

  // Coordinator permissions
  coordinator: [
    PERMISSIONS.VIEW_DASHBOARD,
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.VIEW_SYLLABUS,
    PERMISSIONS.CREATE_SYLLABUS,
    PERMISSIONS.EDIT_SYLLABUS,
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.VIEW_GRADEBOOK,
    PERMISSIONS.VIEW_HOLIDAYS,
    PERMISSIONS.CREATE_HOLIDAY,
    PERMISSIONS.EDIT_HOLIDAY,
    PERMISSIONS.VIEW_STUDENT_REPORTS,
  ],
};

export const hasPermission = (
  userRole: string,
  permission: string
): boolean => {
  if (!userRole || !permission) return false;

  const rolePermissions =
    ROLE_PERMISSIONS[userRole as keyof typeof ROLE_PERMISSIONS];
  if (!rolePermissions) return false;

  return rolePermissions.includes(permission);
};

export const hasAnyPermission = (
  userRole: string,
  permissions: string[]
): boolean => {
  if (!userRole || !permissions || permissions.length === 0) return false;

  return permissions.some((permission) => hasPermission(userRole, permission));
};

export const hasAllPermissions = (
  userRole: string,
  permissions: string[]
): boolean => {
  if (!userRole || !permissions || permissions.length === 0) return false;

  return permissions.every((permission) => hasPermission(userRole, permission));
};

// Example of how the frontend would use this to make a request to the backend
export const checkPermissionFromBackend = async (
  permission: string
): Promise<boolean> => {
  try {
    const userStr = localStorage.getItem('token');
    if (!userStr) return false;

    const user = JSON.parse(userStr);

    return hasPermission(user.role, permission);

    // Example of how an API call would look:
    // const response = await fetch('/api/check-permission', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${user.token}`
    //   },
    //   body: JSON.stringify({ permission })
    // });
    //
    // const data = await response.json();
    // return data.hasPermission;
  } catch (error) {
    console.error('Error checking permission:', error);
    return false;
  }
};
