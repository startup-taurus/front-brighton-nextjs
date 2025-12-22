'use client';
import Link from 'next/link';
import { sidebarMenuType } from 'Types/LayoutDataType';
import { useContext } from 'react';
import Image from 'next/image';
import SidebarLogo from './SidebarLogo';
import SidebarMenu from './SidebarMenu';
import ConfigDB from 'config/ThemeConfig';
import CustomizerContext from 'helper/Customizer';
import layoutContext from 'helper/Layout';
import { UserContext } from '../../../helper/User';
import { ImgPath } from 'utils/Constant';
import usePermission from '../../../hooks/usePermission';
import { PERMISSIONS } from 'utils/permissions';

const Sidebar = ({ menuList }: { menuList: sidebarMenuType[] }) => {
  const { sidebarIconType } = useContext(CustomizerContext);
  const { sideBarToggle } = useContext(layoutContext);
  const { user } = useContext(UserContext);
  const { canPermission } = usePermission();

  const mainLink = canPermission(PERMISSIONS.VIEW_DASHBOARD) ? '/dashboard' : '/teachers';
  const IconType = sidebarIconType || ConfigDB.data.settings.sidebar.iconType;

  return (
    <div
      className={`sidebar-wrapper ${sideBarToggle ? 'close_icon' : ''}`}
      sidebar-layout={IconType}
    >
      <div>
        <SidebarLogo />
        <div className='logo-icon-wrapper'>
          <Link href={mainLink}>
            2555
            <Image
              width={35}
              height={35}
              className='img-fluid'
              src={`${ImgPath}/logo/logo-icon.png`}
              alt=''
            />
          </Link>
        </div>
        <SidebarMenu menuList={menuList} />
      </div>
    </div>
  );
};

export default Sidebar;
