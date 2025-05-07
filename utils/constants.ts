export const ERROR_MESSAGE = 'Oops! Something went wrong!';
export const SUCCESS_MESSAGE = 'Success!';

export const USER_TYPES = {
  ADMIN: 'admin_staff',
  PROFESSOR: 'professor',
  STUDENT: 'student',
  FINANCIAL: 'financial',
  COORDINATOR: 'coordinator',
  RECEPTIONIST: 'receptionist',
};

export const STATUS_FILTER = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
];

export const LEVEL_FILTER = [
  { label: 'Graduate', value: 'Graduate' },
  { label: 'Undergraduate', value: 'Undergraduate' },
];

export const PROMOTION_FILTER = [
  { label: 'Navidad', value: 'Navidad' },
  { label: '2x1', value: '2x1' },
];

export const COURSE_TYPE_FILTER = [
  { label: 'ON-SITE', value: 'on-site' },
  { label: 'PRIVATE - ONLINE', value: 'private - online' },
  { label: 'ONLINE', value: 'online' },
];

export const STATUS_LEVEL_CHANGE = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' },
  { label: 'n/a', value: 'n/a' },
];

export const USER_ROLES = [
  { value: 'admin_staff', label: 'Admin' },
  { value: 'professor', label: 'Professor' },
  { value: 'student', label: 'Student' },
  { value: 'financial', label: 'Financial' },
  { value: 'coordinator', label: 'Coordinator' },
  { value: 'receptionist', label: 'Receptionist' },
];

export const COMPONENTS_GRADEBOOK = {
  ASSIGNMENTS: 'ASSIGNMENTS',
  PROGRESS_TESTS: 'PROGRESS TESTS',
  MOVERS_EXAM: 'MOVERS EXAM',
};

export const DEFAULT_BAR_CHART_DATA = {
  labels: [],
  datasets: [
    {
      label: 'SKILLS',
      backgroundColor: 'rgba(255, 167 ,0, 1)',
      highlightFill: 'rgba(255, 151 , 0, 1)',
      borderWidth: 2,
      data: [],
    },
  ],
};

export const LEVELS_FOR_KIDS = [
  { label: 'Pre-A1 Starter', value: '7' },
  { label: 'A1.1 Movers', value: '8' },
  { label: 'A1.2 Movers', value: '12' },
  { label: 'A2.1 Flyers', value: '13' },
  { label: 'A2.2 Flyers', value: '9' },
  { label: 'B1.1 PreIntermediate', value: '10' },
  { label: 'B1.2 Pre-Intermediate', value: '11' },
  { label: 'Private Classes', value: '14' },
];

export const LEVELS_FOR_ADULTS = [
  { label: 'Pre-A1 Starter', value: '7' },
  { label: 'A1 Beginner', value: '1' },
  { label: 'A2 Elementary', value: '2' },
  { label: 'B1 Pre-Intermediate', value: '3' },
  { label: 'B1+ Intermediate', value: '4' },
  { label: 'B2 Upper Intermediate', value: '5' },
  { label: 'B2 First Preparation', value: '6' },
  { label: 'Private Classes', value: '14' },
];

export const SCHEDULE_DATES = [
  { label: 'Monday & Wednesday 9:00-11:00', value: 'Mon-Wed 9:00-11:00' },
  { label: 'Monday & Wednesday 15:00-17:00', value: 'Mon-Wed 15:00-17:00' },
  { label: 'Monday & Wednesday 17:00-19:00', value: 'Mon-Wed 17:00-19:00' },
  { label: 'Monday & Wednesday 19:00-21:00', value: 'Mon-Wed 19:00-21:00' },

  { label: 'Tuesday & Thursday 9:00-11:00', value: 'Tue-Thu 9:00-11:00' },
  { label: 'Tuesday & Thursday 15:00-17:00', value: 'Tue-Thu 15:00-17:00' },
  { label: 'Tuesday & Thursday 17:00-19:00', value: 'Tue-Thu 17:00-19:00' },
  { label: 'Tuesday & Thursday 19:00-21:00', value: 'Tue-Thu 19:00-21:00' },

  { label: 'Friday Intensive', value: 'Fri intensive' },

  { label: 'Saturday 9:00-13:00', value: 'Sat 9:00-13:00' },
  { label: 'Saturday 14:00-18:00', value: 'Sat 14:00-18:00' },
];
export const TEACHER_PATHS = [
  '/teachers',
  '/teachers/',
  '/teachers/faq',
  '/course/:id/home',
  '/course/:id/attendance',
  '/course/:id/holidays',
  '/course/:id/gradebook',
  '/course/:id/student-report',
  '/course/:id/faq',
];

export const EXAMS_TYPE = {
  MOVERS: 'MOVERS',
  PRELIM: 'PRELIM.',
};

export const GROUP_MINIMUM = 2;
