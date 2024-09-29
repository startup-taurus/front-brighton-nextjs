import React from "react";
import Image from "next/image";
import { ImgPath } from "../../../../utils/Constant";

const LogoHeader = () => {
  return (
    <div className="logo-wrapper mb-4">
      <Image
        className="for-light"
        src={`${ImgPath}/logo/logo.png`}
        alt="logo"
        width={60}
        height={60}
      />
      <Image
        className="img-fluid for-light"
        src={`${ImgPath}/logo/logo-brighton.png`}
        alt="logo"
        width={100}
        height={80}
      />
    </div>
  );
};

export default LogoHeader;
