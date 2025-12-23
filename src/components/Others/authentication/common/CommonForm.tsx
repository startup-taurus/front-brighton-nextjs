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
import { LOGIN_MESSAGES, USER_ROLES, USER_TYPES } from '../../../../../utils/constants';
import { encrypt } from 'utils/encryption';
import { showAccessDeniedAlert, showAccountLockedSupport, showIncorrectPasswordAutoClose, showInvalidUsernameFormatCF, showLoginErrorAlert, showLoginFailedAlert, showUserDeactivatedAlert, showUsernameTooShortCF, showUserNotFoundAlert } from '../../../../../utils/alertAuth';
import { validateEmailFormat } from 'utils/utils';
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
    const isEmailInput = validateEmailFormat(trimmedUsername).isValid;
    if (!isEmailInput && !trimmedUsername.toLowerCase().endsWith('brighton')) {
      showInvalidUsernameFormatCF();
      return;
    }

    if (!isEmailInput && trimmedUsername.length < 8) {
      showUsernameTooShortCF();
      return;
    }
    setIsLoading(true);
    
    try {
      const response = await postLogin({ username: trimmedUsername, password });
      if (response?.status === LOGIN_MESSAGES.SUCCESS) {
        if (response.data?.status === LOGIN_MESSAGES.INACTIVE) {
          showUserDeactivatedAlert();
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
        toast.success(LOGIN_MESSAGES.LOGIN_SUCCESS);
      } else {
        const errorMessage = response?.message || LOGIN_MESSAGES.LOGIN_FAILED;
        if (errorMessage.includes(LOGIN_MESSAGES.INCORRECT_PASSWORD) && errorMessage.includes(LOGIN_MESSAGES.FAILED_ATTEMPTS)) {
          const failedAttemptsMatch = errorMessage.match(/Failed attempts: (\d+)\/5/);
          const remainingAttemptsMatch = errorMessage.match(/Remaining attempts: (\d+)/);
          
          const failedAttempts = failedAttemptsMatch ? failedAttemptsMatch[1] : '0';
          const remainingAttempts = remainingAttemptsMatch ? remainingAttemptsMatch[1] : '0';
          
          showIncorrectPasswordAutoClose(failedAttempts, remainingAttempts);
        } else if (errorMessage.includes(LOGIN_MESSAGES.ACCOUNT_LOCKED)) {
          showAccountLockedSupport();
        } else {
          showLoginErrorAlert(errorMessage);
        }
      }
    } catch (error: any) {
      
      if (error?.response?.status === 400 && error?.response?.data?.message) {
        const errorMessage = error.response.data.message;
        
        if (errorMessage.includes(LOGIN_MESSAGES.INCORRECT_PASSWORD) && errorMessage.includes(LOGIN_MESSAGES.FAILED_ATTEMPTS)) {
          const failedAttemptsMatch = errorMessage.match(/Failed attempts: (\d+)\/5/);
          const remainingAttemptsMatch = errorMessage.match(/Remaining attempts: (\d+)/);
          
          const failedAttempts = failedAttemptsMatch ? failedAttemptsMatch[1] : '0';
          const remainingAttempts = remainingAttemptsMatch ? remainingAttemptsMatch[1] : '0';
          
          showIncorrectPasswordAutoClose(failedAttempts, remainingAttempts);
        } else if (errorMessage.includes(LOGIN_MESSAGES.ACCOUNT_LOCKED)) {
          showAccountLockedSupport();
        } else {
          showLoginErrorAlert(errorMessage);
        }
      } else if (error?.response?.status === 403) {
        const errorMessage = error?.response?.data?.message || '';
        
        if (errorMessage.includes(LOGIN_MESSAGES.ACCOUNT_LOCKED) || errorMessage.includes(LOGIN_MESSAGES.LOCKED_DUE_TO)) {
          showAccountLockedSupport();
        } else {
          showAccessDeniedAlert(errorMessage);
        }
      } else if (error?.response?.status === 404) {
        showUserNotFoundAlert();
      } else {
        showLoginFailedAlert();
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
