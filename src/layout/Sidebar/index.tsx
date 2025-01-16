"use client";
import React, { useContext } from "react";
import SidebarLogo from "./SidebarLogo";
import SidebarMenu from "./SidebarMenu";
import ConfigDB from "config/ThemeConfig";
import CustomizerContext from "helper/Customizer";
import layoutContext from "helper/Layout";
import Link from "next/link";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import { UserContext } from "../../../helper/User";

const Sidebar = () => {
  const { sidebarIconType } = useContext(CustomizerContext);
  const { sideBarToggle } = useContext(layoutContext);
  const { user } = useContext(UserContext);

  const mainLink = user?.role === "admin_staff" ? "/dashboard" : "/teachers";

  const IconType = sidebarIconType || ConfigDB.data.settings.sidebar.iconType;
  return (
    <div
      className={`sidebar-wrapper ${sideBarToggle ? "close_icon" : ""}`}
      sidebar-layout={IconType}
    >
      <div>
        <SidebarLogo />
        <div className="logo-icon-wrapper">
          <Link href={mainLink}>
            <Image
              width={35}
              height={35}
              className="img-fluid"
              src={`${ImgPath}/logo/logo-icon.png`}
              alt=""
            />
          </Link>
        </div>
        <SidebarMenu />
      </div>
    </div>
  );
};

export default Sidebar;
