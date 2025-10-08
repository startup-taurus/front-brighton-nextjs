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
};
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
export const DATA_TYPE = {
  STRING: 'string',
  TRUE: 'true',
  FALSE: 'false',
  OBJECT: 'object',
};

export const STUDENT_REPORT_CONSTANTS = {
  COLUMNS: {
    NO: 'NO.',
    CRITERION: 'CRITERION',
    LEVEL: 'LEVEL',
    SCORE: 'SCORE',
    GRADE: 'GRADE',
    EXAM_PAPER: 'EXAM PAPER',
    EXAM: 'EXAM',
  },
  EXAM_SKILLS: {
    READING_AND_WRITING: 'READING AND WRITING',
    READING_WRITING_ALT: 'READING & WRITING',
    LISTENING: 'LISTENING',
    SPEAKING: 'SPEAKING',
    READING: 'READING',
    WRITING: 'WRITING',
  },
  PROGRAMS: {
    GENERAL_ENGLISH: 'General English',
    YOUNG_LEARNERS: 'Young Learners',
  },
  STATUS: {
    NOT_REPORTED: 'Not Reported',
    NOT_RESULTED: 'NOT RESULTED',
  },
  DEFAULT_VALUES: {
    ZERO: '0',
    ZERO_DECIMAL: '0.00',
  },
  CSS_CLASSES: {
    HIGHLIGHTED_COL: 'highlighted-col text-center',
    MT_4: 'mt-4',
    ATTENDANCE_RESUME: 'attendance-resume',
    FIELD_DESCRIPTION: 'field-description',
    FIELD_VALUE: 'field-value',
    FLEX_COLUMN_MD_ROW: 'd-flex flex-column flex-md-row justify-content-between',
    DOWNLOAD_CONTAINER: 'd-flex download-container gap-2 flex-column flex-md-row',
    ALIGN_ITEMS_CENTER: 'd-flex align-items-center gap-2',
    CHART_CONTAINER: 'chart-container',
    WIDTH_100: '100%',
  },
  MESSAGES: {
    GENERATING: 'Generating...',
    DOWNLOAD_CERTIFICATE: 'Download Certificate',
    DOWNLOAD_REPORT: 'Download Report',
    CERTIFICATE_SUCCESS: 'Certificate downloaded successfully',
    REPORT_SUCCESS: 'Report downloaded successfully',
    CERTIFICATE_ERROR: 'Error generating certificate',
    REPORT_ERROR: 'Error generating report',
    NO_DATA_ERROR: 'No hay datos del estudiante o curso disponibles',
    ATTENDANCE: 'ATTENDANCE',
    GPA: 'GPA',
  },
  AGE_GROUP: {
    ADULT: 'adult',
  },
  EXAM_TYPES: {
    GENERAL: 'General',
  },
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