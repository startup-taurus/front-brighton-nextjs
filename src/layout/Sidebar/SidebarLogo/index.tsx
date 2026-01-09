import Image from 'next/image';
import Link from 'next/link';
import FeatherIconCom from '../../../../CommonElements/Icons/FeatherIconCom';
import layoutContext from 'helper/Layout';
import {useContext} from 'react';
import {UserContext} from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import {PERMISSIONS} from '../../../../utils/permissions';
import { APP_PATHS } from 'utils/constants';

const SidebarLogo = () => {
  const {setSideBarToggle, sideBarToggle} = useContext(layoutContext);
  const {user} = useContext(UserContext);
  const {canPermission} = usePermission();

  const mainLink = canPermission(PERMISSIONS.VIEW_DASHBOARD)
    ? APP_PATHS.DASHBOARD
    : APP_PATHS.TEACHERS;

  return (
    <div className='logo-wrapper'>
      <Link href={mainLink}>
        <Image
          className='for-light'
          src={'/assets/images/logo/large-logo.png'}
          alt='icon'
          width={135}
          height={40}
        />
      </Link>
      <div
        className='back-btn'
        onClick={() => setSideBarToggle(!sideBarToggle)}
      >
        <i className='fa fa-angle-left' />
      </div>
    </div>
  );
};

export default SidebarLogo;
