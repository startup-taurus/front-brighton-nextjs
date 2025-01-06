export const ERROR_MESSAGE = "Oops! Something went wrong!";
export const SUCCESS_MESSAGE = "Success!";

export const USER_TYPES = {
  ADMIN: "admin_staff",
  PROFESSOR: "professor",
};

export const STATUS_FILTER = [
  { label: "Active", value: "active" },
  { label: "Inactive", value: "inactive" },
];

export const LEVEL_FILTER = [
  { label: "Graduate", value: "Graduate" },
  { label: "Undergraduate", value: "Undergraduate" },
];

export const PROMOTION_FILTER = [
  { label: "Navidad", value: "Navidad" },
  { label: "2x1", value: "2x1" },
];

export const COURSE_TYPE_FILTER = [
  { label: "ON-SITE", value: "on-site" },
  { label: "PRIVATE - ONLINE", value: "private - online" },
  { label: "ONLINE", value: "online" },
];

export const USER_ROLES = [
  { value: "admin_staff", label: "Admin" },
  { value: "teacher", label: "Teacher" },
  { value: "student", label: "Student" },
  { value: "financial", label: "Financial" },
];

export const COMPONENTS_GRADEBOOK = {
  ASSIGNMENTS: "ASSIGNMENTS",
  PROGRESS_TESTS: "PROGRESS TESTS",
  MOVERS_EXAM: "MOVERS EXAM",
};
