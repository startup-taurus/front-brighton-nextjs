export interface CheckDuplicateByRoleRequest {
  email: string;
  cedula: string;
  role: string;
  username: string;
  excludeUserId?: number;
}

export interface CheckDuplicateUserRequest {
  email: string;
  username: string;
  excludeUserId?: number;
}

export interface CheckDuplicateByStudentRequest {
  email: string;
  cedula: string;
  excludeUserId?: number;
}

export interface DuplicateValidationResponse {
  isValid: boolean;
  message: string;
  duplicateEmail: boolean;
  duplicateCedula: boolean;
  duplicateUsername: boolean;
}