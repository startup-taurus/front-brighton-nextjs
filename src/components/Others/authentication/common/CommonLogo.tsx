import Image from "next/image";
import Link from "next/link";
import React from "react";
import { ImgPath } from "utils/Constant";
interface propsType {
  alignLogo?: string;
}
const CommonLogo = ({ alignLogo }: propsType) => {
  return (
    <Link className={`logo ${alignLogo ? alignLogo : ""} `} href="/teachers">
      <Image
        width={130}
        height={44}
        className="img-fluid for-light"
        src={`${ImgPath}/logo.png`}
        alt="looginpage"
      />
      <Image
        width={130}
        height={44}
        className="img-fluid for-dark"
        src={`${ImgPath}/logo.png`}
        alt="looginpage"
      />
    </Link>
  );
};

export default CommonLogo;
