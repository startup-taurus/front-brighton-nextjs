import Swal from 'sweetalert2';
export const showUserDeactivatedAlert = () =>
  Swal.fire({
    title: 'User Deactivated',
    text: 'Your account has been deactivated. Please contact the administrator for more information.',
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showInvalidUsernameFormatCF = () =>
  Swal.fire({
    title: 'Invalid Username Format',
    text: 'If you are using a username, it must end with "Brighton".',
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showUsernameTooShortCF = () =>
  Swal.fire({
    title: 'Username Too Short',
    text: 'Username must be at least 8 characters long.',
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showIncorrectPasswordAutoClose = (failedAttempts: string | number, remainingAttempts: string | number) =>
  Swal.fire({
    title: '🔐 Incorrect Password',
    html: `
      <div style="text-align: center;">
        <p style="font-size: 16px; margin-bottom: 15px;">The password you entered is incorrect.</p>
        <div style="background: #ffe6e6; border: 1px solid #ff9999; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="margin: 5px 0; color: #cc0000;"><strong>Failed Attempts:</strong> ${failedAttempts}/5</p>
          <p style="margin: 5px 0; color: #cc0000;"><strong>Remaining Attempts:</strong> ${remainingAttempts}</p>
        </div>
        <p style="font-size: 14px; color: #6c757d;">Your account will be locked after 5 failed attempts.</p>
      </div>
    `,
    icon: 'error',
    confirmButtonText: 'OK',
    allowOutsideClick: false,
    allowEscapeKey: false,
  });

export const showAccountLockedSupport = () =>
  Swal.fire({
    title: '🔒 Account Locked',
    html: `
      <div style="text-align: center;">
        <p style="font-size: 16px; margin-bottom: 15px;">Your account has been locked due to multiple failed login attempts.</p>
        <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 15px 0;">
          <p style="margin: 0; color: #721c24;"><strong>Please contact support to unlock your account.</strong></p>
        </div>
      </div>
    `,
    icon: 'error',
    confirmButtonText: 'Contact Support',
    confirmButtonColor: '#dc3545',
  });

export const showLoginErrorAlert = (message: string) =>
  Swal.fire({
    title: 'Login Error',
    text: message,
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showAccessDeniedAlert = (message?: string) =>
  Swal.fire({
    title: 'Access Denied',
    text: message || 'You do not have permission to access this resource.',
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showUserNotFoundAlert = () =>
  Swal.fire({
    title: 'User Not Found',
    text: 'The username or email you entered does not exist. Please check your credentials and try again.',
    icon: 'error',
    confirmButtonText: 'Ok',
  });

export const showLoginFailedAlert = () =>
  Swal.fire({
    title: 'Login Failed',
    text: 'An unexpected error occurred. Please try again later.',
    icon: 'error',
    confirmButtonText: 'Ok',
  });