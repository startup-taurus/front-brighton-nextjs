'use client';
import Footer from 'CommonElements/Footer';
import CustomizerContext from 'helper/Customizer';
import layoutContext, { searchableMenuType } from 'helper/Layout';
import Head from 'next/head';
import { ReactNode, useContext, useEffect, useState, useMemo } from 'react';
import { sidebarItemType } from 'Types/LayoutDataType';
import NoSsr from 'utils/NoSsr';
import Header from './Header';
import Sidebar from './Sidebar';
import {
  TeacherMenuList,
  CoordinatorMenuList,
  AdminMenuList,
} from './Sidebar/menu';
import Taptop from './Taptop';
import { UserContext } from '../../helper/User';
import Loader from '@/layout/loader';
import { USER_TYPES } from 'utils/constants';

interface layoutProps {
  children: ReactNode;
}

const Layout = ({ children }: layoutProps) => {
  const { layout, setLayout } = useContext(CustomizerContext);
  const { user } = useContext(UserContext);
  const {
    sideBarToggle,
    setSideBarToggle,
    setSearchableMenu,
    setBookmarkList,
  } = useContext(layoutContext);

  const compactSidebar = () => {
    if (layout === 'compact-wrapper') {
      if (window.innerWidth <= 1006) {
        setSideBarToggle(true);
      } else {
        setSideBarToggle(false);
      }
    } else if (layout === 'horizontal-wrapper') {
      if (window.innerWidth <= 1006) {
        setSideBarToggle(true);
        setLayout('compact-wrapper');
      } else {
        setSideBarToggle(false);
        setLayout('horizontal-wrapper');
      }
    }
  };

  useEffect(() => {
    compactSidebar();
    window.addEventListener('resize', compactSidebar);
    return () => window.removeEventListener('resize', compactSidebar);
  }, [layout]);

  const menuList = useMemo(() => {
    switch (user?.role) {
      case USER_TYPES.COORDINATOR:
        return CoordinatorMenuList;
      case USER_TYPES.ADMIN:
        return AdminMenuList;
      case USER_TYPES.PROFESSOR:
      default:
        return TeacherMenuList;
    }
  }, [user?.role]);

  useEffect(() => {
    const suggestionArray: searchableMenuType[] = [];
    const bookmarkArray: searchableMenuType[] = [];
    let num = 0;

    const getAllLink = (item: sidebarItemType, icon: ReactNode) => {
      if (item.children) {
        item.children.map((ele: sidebarItemType) => {
          getAllLink(ele, icon);
        });
      } else {
        num = num + 1;
        suggestionArray.push({
          icon: icon,
          title: item.title || '',
          path: item.path || '',
          bookmarked: item.bookmark || false,
          id: num,
        });
        if (item.bookmark) {
          bookmarkArray.push({
            icon: icon,
            title: item.title || '',
            path: item.path || '',
            bookmarked: item.bookmark,
            id: num,
          });
        }
      }
    };

    menuList.forEach((item) => {
      item.Items?.map((child) => {
        getAllLink(child, child.icon);
      });
    });
    setSearchableMenu(suggestionArray);
    setBookmarkList(bookmarkArray);
  }, [menuList]);

  return (
    <NoSsr>
      <Head>
        <title>Brighton School</title>
      </Head>
      {/* <Loader /> */}
      <div
        className={`page-wrapper  ${user?.role === USER_TYPES.ADMIN || user?.role === USER_TYPES.COORDINATOR ? 'compact-wrapper' : 'horizontal-wrapper'}`}
      >
        <Header />
        <div className='page-body-wrapper'>
          <Sidebar menuList={menuList} />
          {children}
          <Footer />
        </div>
      </div>
      {/* <ThemeCustomizer /> */}
      <Taptop />
    </NoSsr>
  );
};

export default Layout;
