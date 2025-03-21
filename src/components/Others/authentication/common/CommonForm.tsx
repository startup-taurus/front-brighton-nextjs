'use client';

import Link from 'next/link';
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
import CommonLogo from './CommonLogo';
import { useRouter } from 'next/router';
import { postLogin } from 'helper/api-data/user';
import { UserContext } from 'helper/User';
import { USER_ROLES, USER_TYPES } from '../../../../../utils/constants';
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
    setIsLoading(true);
    const response = await postLogin({ username, password });

    if (response?.status === 'success') {
      Cookies.set('token', JSON.stringify(response?.data));
      login(response.data);

      if (response.data.role === USER_TYPES.ADMIN) {
        router.push('/dashboard');
      }

      if (response.data.role === USER_TYPES.PROFESSOR) {
        router.push('/teachers');
      }

      toast.success('Login Success');
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
                placeholder='Username'
                value={username}
                name='username'
                onChange={handleUserValue}
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
