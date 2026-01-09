export const ERROR_MESSAGE = 'Oops! Something went wrong!';
export const SUCCESS_MESSAGE = 'Success!';

export const LOGIN_ERROR_TYPES = {
  INCORRECT_PASSWORD: 'incorrect-password',
  LOCKED: 'locked',
  ACCESS_DENIED: 'access-denied',
  NOT_FOUND: 'not-found',
  GENERIC: 'generic',
} as const;

export type LoginErrorType = typeof LOGIN_ERROR_TYPES[keyof typeof LOGIN_ERROR_TYPES];

export const LOGIN_MESSAGES = {
  INCORRECT_PASSWORD: 'Password incorrect',
  FAILED_ATTEMPTS: 'Failed attempts',
  USER_NOT_FOUND: 'User not found',
  ACCOUNT_LOCKED: 'Account has been locked',
  LOCKED_DUE_TO: 'locked due to',
  NOT_AUTHORIZED_TOKEN_NOT_SENT: 'Not authorized, token not sent',
  LOGIN_FAILED: 'Login Failed',
  LOGIN_SUCCESS: 'Login succes',
  SUCCESS: 'success',
  INACTIVE: 'inactive',
  REMAINING_ATTEMPTS: 'remaining attempts',
};
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

export const FILTER_KEYS = {
  ROLE: 'role',
  STATUS: 'status',
} as const;

export const STATUS_FILTER_COURSE = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' },
  { label: 'Transferred', value: 'transferred' },
  { label: 'Completed', value: 'completed' },
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
  { label: 'PRIVATE', value: 'private' },

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

export const APP_PATHS = {
  DASHBOARD: '/dashboard',
  TEACHERS: '/teachers',
} as const;
export const ROLES_PERMISSIONS_TEXTS = {
  CREATE_ROLE_AND_PERMISSIONS: 'create role and permissions',
} as const;

export const COURSE_TAB_NAMES = {
  ATTENDANCE: 'ATTENDANCE',
  HOLIDAYS: 'HOLIDAYS',
  GRADEBOOK: 'GRADEBOOK',
  STUDENT_REPORT: 'STUDENT REPORT',
} as const;

export const PERMISSION_TOOLTIPS = {
  NO_PERMISSION_DELETE: 'No permission to delete',
  DELETE_CANCELLED_LESSON: 'Delete cancelled lesson'
} as const;

export const EXAMS_TYPE = {
  STARTERS: 'STARTERS',
  MOVERS: 'MOVERS',
  FLYERS: 'FLYERS',
  KEY: 'KEY',
  PRELIM: 'PRELIM.',
  FIRST: 'FIRST',
};

export const EXAM_TYPE_OPTIONS = [
  { value: EXAMS_TYPE.STARTERS, label: 'STARTERS (PRE-A1 KIDS) - 3 Modules' },
  { value: EXAMS_TYPE.MOVERS, label: 'MOVERS (A1 KIDS/ADULTS) - 3 Modules' },
  { value: EXAMS_TYPE.FLYERS, label: 'FLYERS (A2 KIDS) - 3 Modules' },
  { value: EXAMS_TYPE.KEY, label: 'KEY (A2 KIDS/ADULTS) - 3 Modules' },
  { value: EXAMS_TYPE.PRELIM, label: 'PRELIMINARY (B1 KIDS/ADULTS) - 4 Modules' },
  { value: EXAMS_TYPE.FIRST, label: 'FIRST (B2 ADULTS) - 4 Modules' },
];

export const STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  TRANSFERRED: 'transferred',
  COMPLETED: 'completed'
};

export const COURSE_CLIENT_PAGINATION_STATUSES = [STATUS.COMPLETED, STATUS.INACTIVE, STATUS.ACTIVE] as const;
export const GROUP_MINIMUM = 2;

export const EXAM_MODULES = {
  THREE_MODULES: {
    READING_WRITING: 'reading-and-writing',
    LISTENING: 'listening-yle',
    SPEAKING: 'speaking-yle'
  },
  FOUR_MODULES: {
    READING: 'reading',
    LISTENING: 'listening',
    WRITING: 'writing',
    SPEAKING: 'speaking'
  }
};

export const PRIVATE_COURSE_TYPES = {
  PRIVATE: 'private',
  PRIVATE_ONLINE: 'private - online'  
};

export const COURSE_TYPES = {
  ONLINE: 'online',
  ON_SITE: 'on-site',
  PRIVATE: 'private',
  PRIVATE_ONLINE: 'private - online'
};
export const DATA_TYPE = {
  STRING: 'string',
  TRUE: 'true',
  FALSE: 'false',
  OBJECT: 'object',
};


export const PDF_GENERATOR_CONSTANTS = {
  CERTIFICATE_POSITIONS: {
    STUDENT_NAME: { y: 320, fontSize: 56 },
    PASS_LINE_1: { y: 267, fontSize: 16 },
    PASS_LINE_2: { y: 244, fontSize: 16 },
    DATE: { y: 218, fontSize: 16 }
  },
  REPORT_POSITIONS: {
    DATE: { x: 41, y: 690, fontSize: 11 },
    OVERVIEW_START_Y: 626,
    LINE_HEIGHT: 17,
    LEFT_MARGIN: 41,
    RIGHT_MARGIN: 41,
    ASSIGNMENTS_SECTION: {
      ROW_1: { y: 525 },
      ROW_2: { y: 507 },
      TOTAL: { y: 489 }
    },
    EXAM_SECTION: {
      START_Y: 458,
      ROW_HEIGHT: 18
    },
    COLUMNS: {
      NUMBER: { x: 107 },
      CRITERION: { x: 128 },
      LEVEL: { x: 297 },
      SCORE: { x: 356 },
      STATUS: { x: 406 },
      TOTAL: { x: 407 }
    },
    FINAL_GRADE: { x: 170, y: 333, fontSize: 11 }
  },
  COLORS: {
    BLACK: [0, 0, 0],
    GRAY_35: [0.35, 0.35, 0.35],
    GRAY_50: [0.5, 0.5, 0.5]
  },
  API_ENDPOINTS: {
    CERTIFICATE: '/api/certificate/Certificate.pdf',
    REPORT: '/api/certificate/Report1.pdf',
    FONTS: {
      BRITTANY: '/api/certificate/assets/fonts/BrittanySignature.ttf',
      POPPINS: '/api/certificate/assets/fonts/Poppins-Regular.ttf',
      BOSTON_ANGEL: '/api/certificate/assets/fonts/BostonAngelBold.otf'
    }
  },
  YLE_EXAMS: ['STARTERS', 'MOVERS', 'FLYERS', 'KEY'],
  LEVEL_MAPPING: {
    'A1.1': 'A1', 'A1.2': 'A1', 'A2.1': 'A2', 'A2.2': 'A2',
    'B1.1': 'B1', 'B1.2': 'B1', 'B2.1': 'B2', 'B2.2': 'B2',
    'PRE-A1': 'PRE-A1', 'A1': 'A1', 'A2': 'A2', 'B1': 'B1', 'B2': 'B2',
    'A1 Beginner': 'A1',
    'A2 Elementary': 'A2', 
    'B1 Pre-Intermediate': 'B1',
    'B1+ Intermediate': 'B1+',
    'B1+': 'B1+',
    'B2 Upper Intermediate': 'B2',
    'B2 First Preparation': 'B2',
    'Pre-A1 Starter': 'PRE-A1'
  },
  MONTHS: [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]
};

export const CONFLICT_TYPES = {
  SCHEDULE: 'schedule',
  CLASSROOM: 'classroom',
  DUPLICATE: 'duplicate'
} as const;
export type ConflictType = typeof CONFLICT_TYPES[keyof typeof CONFLICT_TYPES];

export const DEFAULT_LABELS = {
  NO_NAME: 'No name',
  NO_ROLE: 'No role',
  NA: 'N/A',
  NOT_AVAILABLE: 'Not available',
  HOURS_NOT_AVAILABLE: 'Hours not available',
} as const;
