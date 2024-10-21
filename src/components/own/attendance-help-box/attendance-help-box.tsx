import React from "react";
import Image from "next/image";
import { ImgPath } from "../../../../utils/Constant";

const AttendanceHelpBox = () => {
  return (
    <div className="attendance-help">
      <div className="attendance-help-inner">
        <Image
          src={`${ImgPath}/course/warning-icon.png`}
          alt="logo"
          width={50}
          height={70}
        />
        <div className="help-description">
          <p className="help-description-text">
            <span>P</span> Present
          </p>
          <p className="help-description-text">
            <span>F</span> Absent
          </p>
          <p className="help-description-text">
            <span>A</span> Late
          </p>
          <p className="help-description-text">
            <span>R</span> Recovered
          </p>
        </div>
      </div>
    </div>
  );
};

export default AttendanceHelpBox;
