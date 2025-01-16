import Image from "next/image";
import Link from "next/link";
import FeatherIconCom from "CommonElements/Icons/FeatherIconCom";
import React, { useContext } from "react";
import { Admin, EmayWalter, ImgPath, UrlImage } from "utils/Constant";
import { profileListData } from "Data/HeaderData";
import { Logout } from "../../../../utils/Constant/index";
import { useRouter } from "next/router";
import Cookies from "js-cookie";
import { UserContext } from "../../../../helper/User";
import * as process from "process";

const Profile = () => {
  const { user, logout } = useContext(UserContext);
  const router = useRouter();

  const handleLogOut = () => {
    logout();
  };
  return (
    <li className="profile-nav onhover-dropdown pe-0 py-0">
      <div className="media profile-media">
        <Image
          className="b-r-10"
          src={
            user.image
              ? `${UrlImage}/${user.image}`
              : "/assets/images/user/user.png"
          }
          alt=""
          width={35}
          height={35}
        />

        <div className="media-body">
          <span>{user.name}</span>
          <p className="mb-0 font-roboto">
            {user.role} <i className="middle fa fa-angle-down" />
          </p>
        </div>
      </div>
      <ul className="profile-dropdown onhover-show-div">
        {/*{profileListData &&*/}
        {/*  profileListData.map((item, index) => (*/}
        {/*    <li key={index}>*/}
        {/*      <Link href={item.path}>*/}
        {/*        <FeatherIconCom iconName={item.icon} />*/}
        {/*        <span>{item.text} </span>*/}
        {/*      </Link>*/}
        {/*    </li>*/}
        {/*  ))}*/}
        <li onClick={handleLogOut}>
          <a>
            <FeatherIconCom iconName={"LogIn"} />
            <span>{Logout}</span>
          </a>
        </li>
      </ul>
    </li>
  );
};

export default Profile;
