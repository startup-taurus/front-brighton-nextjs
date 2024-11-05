import React from "react";
import Image from "next/image";
import { ImgPath, WeAreComingSoon } from "../../../../utils/Constant";
import CountdownData from "@/components/Others/comingSoon/common/CountdownData";

const ComingSoon = () => {
  return (
    <div className="comingsoon">
      <div className="comingsoon-inner text-center">
        <Image
          width={63}
          height={65}
          src={`${ImgPath}/logo/logo.png`}
          alt="coming soon"
        />
        <h5>{WeAreComingSoon}</h5>
        <div className="countdown" id="clockdiv">
          <CountdownData />
        </div>
      </div>
    </div>
  );
};

export default ComingSoon;
