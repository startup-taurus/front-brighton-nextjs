'use client';

import { ChangeEvent, FormEvent, useContext, useState } from 'react';
import { Button, FormGroup, Input, Label } from 'reactstrap';
import {
  EmailAddress,
  EnterEmailPasswordLogin,
  ForgotPassword,
  Password,
  RememberPassword,
  SignIn,
  SignInAccount,
} from 'utils/Constant';

import Cookies from 'js-cookie';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';
import CommonLogo from './CommonLogo';
import { useRouter } from 'next/router';
import { postLogin } from 'helper/api-data/user';
import { UserContext } from 'helper/User';
import { USER_ROLES, USER_TYPES } from '../../../../../utils/constants';
import { encrypt } from 'utils/encryption';
export interface commonFormPropsType {
  alignLogo?: string;
}
const CommonForm = ({ alignLogo }: commonFormPropsType) => {
  const { login } = useContext(UserContext);

  const [showPassWord, setShowPassWord] = useState(false);
  const [formValues, setFormValues] = useState({
    username: '',
    password: '',
  });
  const [isLoading, setIsLoading] = useState(false);

  const { username, password } = formValues;
  const router = useRouter();
  const handleUserValue = (event: ChangeEvent<HTMLInputElement>) => {
    setFormValues({ ...formValues, [event.target.name]: event.target.value });
  };
  const formSubmitHandle = async (event: FormEvent) => {
    event.preventDefault();
    const trimmedUsername = username.trim();
    if (!trimmedUsername.toLowerCase().endsWith('brighton')) {
      Swal.fire({
        title: 'Invalid Username Format',
        text: 'Username must end with "Brighton". Please append "Brighton" to your username.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
      return;
    }

    if (trimmedUsername.length < 8) {
      Swal.fire({
        title: 'Username Too Short',
        text: 'Username must be at least 8 characters long.',
        icon: 'error',
        confirmButtonText: 'Ok',
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await postLogin({ username: trimmedUsername, password });

      if (response?.status === 'success') {
        if (response.data?.status === 'inactive') {
          Swal.fire({
            title: 'User Deactivated',
            text: 'Your account has been deactivated. Please contact the administrator for more information.',
            icon: 'error',
            confirmButtonText: 'Ok',
          });
          setIsLoading(false);
          return;
        }

        Cookies.set('token', JSON.stringify(response?.data));
        const encryptedId = encrypt(String(response?.data?.id));
        Cookies.set('user_id', encryptedId);
        localStorage.setItem('user_id', encryptedId);
        login(response.data);

        const roleRedirectMap = {
          [USER_TYPES.ADMIN]: '/dashboard',
          [USER_TYPES.PROFESSOR]: '/teachers',
          [USER_TYPES.STUDENT]: '/dashboard/student',
          [USER_TYPES.FINANCIAL]: '/dashboard/financial',
          [USER_TYPES.COORDINATOR]: '/dashboard',
          [USER_TYPES.RECEPTIONIST]: '/dashboard',
        };

        const redirectPath = roleRedirectMap[response.data.role] || '/login';
        router.push(redirectPath);
        toast.success('Login Success');
      } else {
        const errorMessage = response?.message || 'Login failed';
        if (errorMessage.includes('Password incorrect') && errorMessage.includes('Failed attempts')) {
          const failedAttemptsMatch = errorMessage.match(/Failed attempts: (\d+)\/5/);
          const remainingAttemptsMatch = errorMessage.match(/Remaining attempts: (\d+)/);
          
          const failedAttempts = failedAttemptsMatch ? failedAttemptsMatch[1] : '0';
          const remainingAttempts = remainingAttemptsMatch ? remainingAttemptsMatch[1] : '0';
          
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
                <p style="font-size: 12px; color: #999; margin-top: 10px;">This message will close automatically in 4 seconds...</p>
              </div>
            `,
            icon: 'error',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } else if (errorMessage.includes('Account has been locked')) {
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
        } else {
          Swal.fire({
            title: 'Login Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
        }
      }
    } catch (error: any) {
      
      if (error?.response?.status === 400 && error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes('Password incorrect') && errorMessage.includes('Failed attempts')) {
          const failedAttemptsMatch = errorMessage.match(/Failed attempts: (\d+)\/5/);
          const remainingAttemptsMatch = errorMessage.match(/Remaining attempts: (\d+)/);
          
          const failedAttempts = failedAttemptsMatch ? failedAttemptsMatch[1] : '0';
          const remainingAttempts = remainingAttemptsMatch ? remainingAttemptsMatch[1] : '0';
          
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
                <p style="font-size: 12px; color: #999; margin-top: 10px;">This message will close automatically in 4 seconds...</p>
              </div>
            `,
            icon: 'error',
            showConfirmButton: false,
            timer: 4000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } else if (errorMessage.includes('Account has been locked')) {
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
        } else {
          Swal.fire({
            title: 'Login Error',
            text: errorMessage,
            icon: 'error',
            confirmButtonText: 'Ok',
          });
        }
      } else if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message || '';
        
        if (errorMessage.includes('Account has been locked') || errorMessage.includes('locked due to')) {
          Swal.fire({
            title: '🔒 Account Locked',
            html: `
              <div style="text-align: center;">
                <p style="font-size: 16px; margin-bottom: 15px;">Your account has been locked due to multiple failed login attempts.</p>
                <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 15px 0;">
                  <p style="margin: 0; color: #721c24;"><strong>Please contact support to unlock your account.</strong></p>
                </div>
                <p style="font-size: 12px; color: #999; margin-top: 10px;">This message will close automatically in 6 seconds...</p>
              </div>
            `,
            icon: 'error',
            showConfirmButton: false,
            timer: 6000,
            timerProgressBar: true,
            allowOutsideClick: false,
            allowEscapeKey: false,
          });
        } else {
          Swal.fire({
            title: 'Access Denied',
            text: errorMessage || 'You do not have permission to access this resource.',
            icon: 'error',
            confirmButtonText: 'Ok',
          });
        }
      } else if (error?.response?.status === 404) {
        Swal.fire({
          title: 'User Not Found',
          text: 'The username or email you entered does not exist. Please check your credentials and try again.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      } else {
        Swal.fire({
          title: 'Login Failed',
          text: 'An unexpected error occurred. Please try again later.',
          icon: 'error',
          confirmButtonText: 'Ok',
        });
      }
    }
    
    setIsLoading(false);
  };
  return (
    <div className='login-card login-dark'>
      <div>
        <div>
          <CommonLogo alignLogo={alignLogo} />
        </div>
        <div className='login-main'>
          <form
            className='theme-form'
            onSubmit={formSubmitHandle}
          >
            <h4>{SignInAccount}</h4>
            <p>{EnterEmailPasswordLogin}</p>
            <FormGroup>
              <Label className='col-form-label'>{EmailAddress}</Label>
              <Input
                type='text'
                required
                onChange={handleUserValue}
                placeholder='Email or Username'
                value={username}
                name='username'
              />
            </FormGroup>
            <FormGroup>
              <Label className='col-form-label'>{Password}</Label>
              <div className='form-input position-relative'>
                <Input
                  type={showPassWord ? 'text' : 'password'}
                  placeholder='*********'
                  onChange={handleUserValue}
                  value={password}
                  name='password'
                />
                <div className='show-hide'>
                  <span
                    onClick={() => setShowPassWord(!showPassWord)}
                    className={!showPassWord ? 'show' : ''}
                  />
                </div>
              </div>
            </FormGroup>
            <FormGroup className='mb-0 position-relative'>
              <div className='text-end mt-3'>
                <Button
                  color='primary'
                  className='btn-block w-100'
                  type='submit'
                  disabled={isLoading}
                >
                  {SignIn}
                </Button>
              </div>
            </FormGroup>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CommonForm;
