import Cookies from 'js-cookie';
import { useRouter } from 'next/router';
import { ReactNode, useEffect, useState } from 'react';
import { initialUserState, UserContext } from './';
import { NextResponse } from 'next/server';
import { TEACHER_PATHS, USER_TYPES } from '../../utils/constants';

interface contextType {
  children: ReactNode;
}
const UserProvider = ({ children }: contextType) => {
  const [user, setUser] = useState<any>(initialUserState);
  const router = useRouter();

  const login = (user: any) => {
    setUser(user);
  };

  const logout = () => {
    setUser({});
    Cookies.remove('token');
    router.push('/authentication/login');
  };

  const value = {
    user,
    login,
    logout,
  };

  useEffect(() => {
    const user = JSON.parse(Cookies.get('token') ?? '{}');
    setUser(user);
  }, []);

  useEffect(() => {
    const user = JSON.parse(Cookies.get('token') ?? '{}');

    const path = router.pathname.split('/')[1];
    const isUserLogged = Object.keys(user).length > 1;

    const pathTeacherRegex = new RegExp(
      `^(${TEACHER_PATHS.map((path) => path.replace(/:\w+/g, '\\w+')).join(
        '|'
      )})\/?$`
    );
    if (path === 'students-registration') {
    } else if (!isUserLogged && path !== 'authentication') {
      router.push('/authentication/login');
    } else if (
      path === 'authentication' &&
      isUserLogged &&
      user?.role === USER_TYPES.PROFESSOR
    ) {
      router.push('/teachers');
    } else if (
      path === 'authentication' &&
      isUserLogged &&
      user?.role === USER_TYPES.ADMIN
    ) {
      router.push('/dashboard');
    } else if (
      pathTeacherRegex.test(router.pathname) &&
      router.pathname !== '/teachers' &&
      isUserLogged &&
      user?.role !== USER_TYPES.PROFESSOR
    ) {
      router.push('/dashboard');
    } else if (
      new RegExp(`^(/dashboard|/admin(\/.*)?)$`).test(path) &&
      isUserLogged &&
      user?.role !== USER_TYPES.ADMIN &&
      user?.role !== USER_TYPES.COORDINATOR &&
      user?.role !== USER_TYPES.FINANCIAL &&
      user?.role !== USER_TYPES.RECEPTIONIST
    ) {
      router.push('/teachers');
    }
  }, [router.pathname]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
};

export default UserProvider;
