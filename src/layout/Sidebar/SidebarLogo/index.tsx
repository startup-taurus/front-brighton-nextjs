import Image from "next/image";
import Link from "next/link";
import FeatherIconCom from "../../../../CommonElements/Icons/FeatherIconCom";
import layoutContext from "helper/Layout";
import { useContext } from "react";
import { UserContext } from "../../../../helper/User";

const SidebarLogo = () => {
  const { setSideBarToggle, sideBarToggle } = useContext(layoutContext);
  const { user } = useContext(UserContext);

  const mainLink = user?.role === "admin_staff" ? "/dashboard" : "/teachers";

  return (
    <div className="logo-wrapper">
      <Link href={mainLink}>
        <Image
          className="for-light"
          src={"/assets/images/logo/large-logo.png"}
          alt="icon"
          width={135}
          height={40}
        />
      </Link>
      <div
        className="back-btn"
        onClick={() => setSideBarToggle(!sideBarToggle)}
      >
        <i className="fa fa-angle-left" />
      </div>
      {/*<div*/}
      {/*  className="toggle-sidebar"*/}
      {/*  onClick={() => setSideBarToggle(!sideBarToggle)}*/}
      {/*>*/}
      {/*  <FeatherIconCom*/}
      {/*    iconName={"Grid"}*/}
      {/*    className="status_toggle middle sidebar-toggle"*/}
      {/*  />*/}
      {/*</div>*/}
    </div>
  );
};

export default SidebarLogo;
