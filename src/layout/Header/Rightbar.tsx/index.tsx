import React, { useContext } from 'react';
import { Col } from 'reactstrap';
import Profile from './Profile';
import Notificationbar from './Notificationbar';
import { USER_TYPES } from 'utils/constants';
import { UserContext } from '../../../../helper/User';

const Rightbar = () => {
  const { user } = useContext(UserContext);
  const userRole = user?.role;

  return (
    <Col
      xxl={7}
      xl={6}
      md={7}
      sm={8}
      xs={8}
      className='nav-right pull-right right-header p-0 ms-auto'
    >
      <ul className='nav-menus flex-row'>
        {userRole != USER_TYPES.RECEPTIONIST &&
          userRole != USER_TYPES.PROFESSOR && (
            <Notificationbar></Notificationbar>
          )}

        <Profile />
      </ul>
    </Col>
  );
};

export default Rightbar;
