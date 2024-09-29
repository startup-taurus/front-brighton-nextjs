import { Card } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import LogoHeader from "@/components/own/logo-header/logo-header";
import React from "react";
import SectionTitle from "@/components/own/section-title/section-title";

const TabsTeachers = ({ numberOfClass, tabsName }: any) => {
  return (
    <div className="header-card-container mb-4">
      <div className="header-content mb-2">
        <LogoHeader />
        <div className="course-details-box">
          <Image
            src={`${ImgPath}/logo/right.png`}
            alt="right"
            width={30}
            height={50}
          />
          <span>{numberOfClass}</span>
          <Image
            src={`${ImgPath}/logo/left.png`}
            alt="left"
            width={30}
            height={50}
          />
        </div>
      </div>
      <SectionTitle title={tabsName} />
    </div>
  );
};
export default TabsTeachers;
