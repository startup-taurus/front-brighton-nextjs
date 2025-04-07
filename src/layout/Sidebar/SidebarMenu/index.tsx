import { Fragment, useContext, useState } from 'react';
import Menulist from './Menulist';
import { sidebarMenuType } from 'Types/LayoutDataType';
import { useTranslation } from 'react-i18next';
import { Pinned } from 'utils/Constant';
import layoutContext from 'helper/Layout';
import { ArrowLeft, ArrowRight } from 'react-feather';
import ConfigDB from 'config/ThemeConfig';
import CustomizerContext from 'helper/Customizer';
import { useRouter } from 'next/router';

const SidebarMenu = ({ menuList }: { menuList: sidebarMenuType[] }) => {
  const { pinedMenu } = useContext(layoutContext);
  const { layoutName } = useContext(CustomizerContext);
  const wrapper = ConfigDB.data.settings.layout_class;
  const [margin, setMargin] = useState(0);
  const [leftArrow, setLeftArrow] = useState(true);
  const [rightArrow, setRightArrow] = useState(false);
  const router = useRouter();
  const pathname = router.asPath;
  const [active, setActive] = useState(pathname || '');
  const [prev, setPrev] = useState<number | undefined>();
  const [activeLink, setActiveLink] = useState<string | undefined>(
    active.split('/')[active.split('/').length - 1]
  );

  const handleActive = (title: string, level: number) => {
    if (active.includes(title)) {
      const parts = active.split('/');
      parts.splice(level, parts.length - level);
      setActive(parts.join('/'));
      setPrev(level);
    } else {
      setPrev(level);
      setActive(active.concat(`/${title}`));
    }
  };

  const scrollToRight = () => {
    if (margin === 0) {
      setMargin(-1000);
      setLeftArrow(false);
    } else if (margin === -1000) {
      setMargin(-2000);
    } else if (margin === -2000) {
      setMargin(-3000);
      setRightArrow(true);
    }
  };

  const scrollToLeft = () => {
    if (margin === -1000) {
      setMargin(0);
      setLeftArrow(true);
      setRightArrow(false);
    } else if (margin === -2000) {
      setMargin(-1000);
    } else if (margin === -3000) {
      setMargin(-2000);
      setRightArrow(false);
    }
  };

  const shouldHideMenu = (mainMenu: sidebarMenuType) => {
    return mainMenu.Items.map((data) => data.title).every((title) =>
      pinedMenu.includes(title || '')
    );
  };

  const { t } = useTranslation();

  return (
    <nav className='sidebar-main'>
      {(wrapper === 'horizontal-wrapper' ||
        layoutName === 'losangeles' ||
        layoutName === 'singapore') && (
        <div
          className={`left-arrow ${leftArrow ? 'disabled' : ''}`}
          id='left-arrow'
          onClick={scrollToLeft}
        >
          <ArrowLeft />
        </div>
      )}

      <div
        id='sidebar-menu'
        style={
          wrapper === 'horizontal-wrapper' ||
          layoutName === 'losangeles' ||
          layoutName === 'singapore'
            ? { marginLeft: `${margin}px` }
            : { margin: '0px' }
        }
      >
        <ul
          className='sidebar-links custom-scrollbar'
          id='simple-bar'
        >
          <div className='simplebar-wrapper'>
            <div className='simplebar-mask'>
              <div className='simplebar-offset'>
                <div className='simplebar-content-wrapper'>
                  <div className='simplebar-content'>
                    <li className='back-btn'>
                      <div className='mobile-back text-end'>
                        <span>Back</span>
                        <i
                          className='fa fa-angle-right ps-2'
                          aria-hidden='true'
                        ></i>
                      </div>
                    </li>
                    <li
                      className={`pin-title sidebar-main-title ${
                        pinedMenu.length > 1 ? 'show' : ''
                      }`}
                    >
                      <div>
                        <h6>{Pinned}</h6>
                      </div>
                    </li>

                    {menuList.map((mainMenu, i) => (
                      <Fragment key={i}>
                        <li
                          className={`sidebar-main-title ${
                            shouldHideMenu(mainMenu) ? 'd-none' : ''
                          }`}
                        >
                          <div>
                            <h6 className='lan-1'>{t(`${mainMenu.title}`)}</h6>
                          </div>
                        </li>
                        <Menulist
                          setActive={setActive}
                          setActiveLink={setActiveLink}
                          activeLink={activeLink}
                          handleActive={handleActive}
                          active={active}
                          MENUITEMS={mainMenu.Items}
                          level={0}
                        />
                      </Fragment>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </ul>
      </div>

      {(wrapper === 'horizontal-wrapper' ||
        layoutName === 'losangeles' ||
        layoutName === 'singapore') && (
        <div
          className={`right-arrow ${rightArrow ? 'disabled' : ''}`}
          onClick={scrollToRight}
        >
          <ArrowRight />
        </div>
      )}
    </nav>
  );
};

export default SidebarMenu;
