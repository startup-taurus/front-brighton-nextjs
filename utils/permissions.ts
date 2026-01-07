export const PERMISSIONS = {
  // Dashboard permissions
  VIEW_DASHBOARD: 'view_dashboard',
  VIEW_DASHBOARD_TOTAL_TEACHERS: 'view_dashboard_total_teachers',
  VIEW_DASHBOARD_TOTAL_STUDENTS: 'view_dashboard_total_students',
  VIEW_DASHBOARD_TOTAL_COURSES: 'view_dashboard_total_courses',
  VIEW_DASHBOARD_COURSES_TO_BE_COMPLETED: 'view_dashboard_courses_to_be_completed',
  VIEW_DASHBOARD_COURSES_STARTING_SOON: 'view_dashboard_courses_starting_soon',
  VIEW_DASHBOARD_CALENDAR: 'view_dashboard_calendar',
  VIEW_DASHBOARD_PROFESSORS_SUMMARY: 'view_dashboard_professors_summary',
  VIEW_DASHBOARD_LAST_STUDENT_TRANSFER: 'view_dashboard_last_student_transfer',
  VIEW_DASHBOARD_CONSECUTIVE_ABSENCES_REPORT: 'view_dashboard_consecutive_absences_report',

  // Student management permissions
  VIEW_STUDENTS: 'view_students',
  CREATE_STUDENT: 'create_student',
  EDIT_STUDENT: 'edit_student',
  DELETE_STUDENT: 'delete_student',
  TRANSFER_STUDENT: 'transfer_student',
  TOGGLE_STUDENT_STATUS: 'toggle_student_status',

  // Teacher management permissions
  VIEW_TEACHERS: 'view_teachers',
  CREATE_TEACHER: 'create_teacher',
  EDIT_TEACHER: 'edit_teacher',
  DELETE_TEACHER: 'delete_teacher',
  TOGGLE_TEACHER_STATUS: 'toggle_teacher_status',

  // Transfer Students
  VIEW_TRANSFER_STUDENTS: 'view_transfer_students',
  APPROVE_TRANSFER: 'approve_transfer',
  REJECT_TRANSFER: 'reject_transfer',
  // Course management permissions
  VIEW_COURSES: 'view_courses',
  CREATE_COURSE: 'create_course',
  EDIT_COURSE: 'edit_course',
  DELETE_COURSE: 'delete_course',
  TRANSFER_COURSE: 'transfer_course',
  TOGGLE_COURSE_STATUS: 'toggle_course_status',
  VIEW_CANCELLED_LESSONS: 'view_cancelled_lessons',
  CREATE_CANCELLED_LESSON: 'create_cancelled_lesson',
  EDIT_CANCELLED_LESSON: 'edit_cancelled_lesson',
  DELETE_CANCELLED_LESSON: 'delete_cancelled_lesson',

  // Syllabus permissions
  VIEW_SYLLABUS: 'view_syllabus',
  CREATE_SYLLABUS: 'create_syllabus',
  EDIT_SYLLABUS: 'edit_syllabus',
  DUPLICATE_SYLLABUS: 'duplicate_syllabus',

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
  ACTIVATE_USER: 'activate_user',
  TOGGLE_USER_STATUS: 'toggle_user_status',

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
    PERMISSIONS.TOGGLE_STUDENT_STATUS,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.CREATE_TEACHER,
    PERMISSIONS.EDIT_TEACHER,
    PERMISSIONS.DELETE_TEACHER,
    PERMISSIONS.TOGGLE_TEACHER_STATUS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.DELETE_COURSE,
    PERMISSIONS.TOGGLE_COURSE_STATUS,
    PERMISSIONS.VIEW_SYLLABUS,
    PERMISSIONS.CREATE_SYLLABUS,
    PERMISSIONS.EDIT_SYLLABUS,
    PERMISSIONS.DUPLICATE_SYLLABUS,
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
    PERMISSIONS.TOGGLE_USER_STATUS,
    PERMISSIONS.VIEW_PAYMENTS,
    PERMISSIONS.PROCESS_PAYMENT,
    PERMISSIONS.VIEW_FINANCIAL_REPORTS,
    PERMISSIONS.VIEW_STUDENT_REPORTS,
    PERMISSIONS.CREATE_STUDENT_REPORT,
    PERMISSIONS.EDIT_STUDENT_REPORT,
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_TEACHERS,
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_STUDENTS,
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_COURSES,
    PERMISSIONS.VIEW_DASHBOARD_COURSES_TO_BE_COMPLETED,
    PERMISSIONS.VIEW_DASHBOARD_COURSES_STARTING_SOON,
    PERMISSIONS.VIEW_DASHBOARD_CALENDAR,
    PERMISSIONS.VIEW_DASHBOARD_PROFESSORS_SUMMARY,
    PERMISSIONS.VIEW_DASHBOARD_LAST_STUDENT_TRANSFER,
    PERMISSIONS.VIEW_DASHBOARD_CONSECUTIVE_ABSENCES_REPORT,
    PERMISSIONS.VIEW_TRANSFER_STUDENTS,
    PERMISSIONS.APPROVE_TRANSFER,
    PERMISSIONS.REJECT_TRANSFER,
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
    PERMISSIONS.TOGGLE_STUDENT_STATUS,
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.TOGGLE_TEACHER_STATUS,
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.TOGGLE_COURSE_STATUS,
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

export const PERMISSION_MODULES: Record<string, string[]> = {
  Dashboard: [
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_TEACHERS,
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_STUDENTS,
    PERMISSIONS.VIEW_DASHBOARD_TOTAL_COURSES,
    PERMISSIONS.VIEW_DASHBOARD_COURSES_TO_BE_COMPLETED,
    PERMISSIONS.VIEW_DASHBOARD_COURSES_STARTING_SOON,
    PERMISSIONS.VIEW_DASHBOARD_CALENDAR,
    PERMISSIONS.VIEW_DASHBOARD_PROFESSORS_SUMMARY,
    PERMISSIONS.VIEW_DASHBOARD_LAST_STUDENT_TRANSFER,
    PERMISSIONS.VIEW_DASHBOARD_CONSECUTIVE_ABSENCES_REPORT,
  ],
  Students: [
    PERMISSIONS.VIEW_STUDENTS,
    PERMISSIONS.CREATE_STUDENT,
    PERMISSIONS.EDIT_STUDENT,
    PERMISSIONS.DELETE_STUDENT,
    PERMISSIONS.TOGGLE_STUDENT_STATUS,
    // Optional: actions like transfer within students module
  ],
  Courses: [
    PERMISSIONS.VIEW_COURSES,
    PERMISSIONS.CREATE_COURSE,
    PERMISSIONS.EDIT_COURSE,
    PERMISSIONS.TRANSFER_COURSE,
    PERMISSIONS.TOGGLE_COURSE_STATUS,
  ],
  Professors: [
    PERMISSIONS.VIEW_TEACHERS,
    PERMISSIONS.CREATE_TEACHER,
    PERMISSIONS.EDIT_TEACHER,
    PERMISSIONS.TOGGLE_TEACHER_STATUS,
  ],
  Attendance: [
    PERMISSIONS.VIEW_ATTENDANCE,
    PERMISSIONS.MARK_ATTENDANCE,
  ],
  Gradebook: [
    PERMISSIONS.VIEW_GRADEBOOK,
    PERMISSIONS.ADD_GRADES,
    PERMISSIONS.EDIT_GRADES,
  ],
  Holidays: [
    PERMISSIONS.VIEW_HOLIDAYS,
    PERMISSIONS.CREATE_HOLIDAY,
    PERMISSIONS.EDIT_HOLIDAY,
    PERMISSIONS.VIEW_CANCELLED_LESSONS,
    PERMISSIONS.CREATE_CANCELLED_LESSON,
    PERMISSIONS.DELETE_CANCELLED_LESSON,
  ],
  TransferStudents: [
    PERMISSIONS.VIEW_TRANSFER_STUDENTS,
    PERMISSIONS.TRANSFER_STUDENT,
    PERMISSIONS.APPROVE_TRANSFER,
    PERMISSIONS.REJECT_TRANSFER,
  ],
  Users: [
    PERMISSIONS.VIEW_USERS,
    PERMISSIONS.CREATE_USER,
    PERMISSIONS.EDIT_USER,
    PERMISSIONS.TOGGLE_USER_STATUS,
  ],
};

export const ACTION_PERMISSIONS: Record<string, Record<string, string>> = {
  Courses: {
    view: PERMISSIONS.VIEW_COURSES,
    edit: PERMISSIONS.EDIT_COURSE,
    delete: PERMISSIONS.DELETE_COURSE,
    attendance: PERMISSIONS.VIEW_ATTENDANCE,
    gradebook: PERMISSIONS.VIEW_GRADEBOOK,
    transfer: PERMISSIONS.TRANSFER_COURSE,
    transfer_course: PERMISSIONS.TRANSFER_COURSE,
    block: PERMISSIONS.TOGGLE_COURSE_STATUS,
  },
  Students: {
    view: PERMISSIONS.VIEW_STUDENTS,
    edit: PERMISSIONS.EDIT_STUDENT,
    delete: PERMISSIONS.DELETE_STUDENT,
    transfer: PERMISSIONS.VIEW_STUDENTS,
    block: PERMISSIONS.TOGGLE_STUDENT_STATUS,
  },
  Professors: {
    view: PERMISSIONS.VIEW_TEACHERS,
    edit: PERMISSIONS.EDIT_TEACHER,
    delete: PERMISSIONS.DELETE_TEACHER,
    block: PERMISSIONS.TOGGLE_TEACHER_STATUS,
  },
  Syllabus: {
    view: PERMISSIONS.VIEW_SYLLABUS,
    edit: PERMISSIONS.EDIT_SYLLABUS,
    copy: PERMISSIONS.DUPLICATE_SYLLABUS,
  },
  Users: {
    view: PERMISSIONS.VIEW_USERS,
    edit: PERMISSIONS.EDIT_USER,
    delete: PERMISSIONS.DELETE_USER,
    activate: PERMISSIONS.ACTIVATE_USER,
    block: PERMISSIONS.TOGGLE_USER_STATUS,
  },
  TransferStudents: {
    view: PERMISSIONS.VIEW_TRANSFER_STUDENTS,
    transfer: PERMISSIONS.APPROVE_TRANSFER,
    block: PERMISSIONS.REJECT_TRANSFER,
  },
};

export const ACTION_TYPES = {
  VIEW: 'view',
  ATTENDANCE: 'attendance',
  GRADEBOOK: 'gradebook',
  ACTIVATE: 'activate',
  BLOCK: 'block',
  EDIT: 'edit',
  COPY: 'copy',
  TRANSFER: 'transfer',
  TRANSFER_COURSE: 'transfer_course',
  DELETE: 'delete',
} as const;

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
// End of helpers
