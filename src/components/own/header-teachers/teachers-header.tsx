import { Card, CardBody } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import LogoHeader from "@/components/own/logo-header/logo-header";
import React from "react";

const TeachersHeader = ({
  numberOfClass,
  nameCourse,
  nameTeacher,
  numberOfStudents,
}: any) => {
  return (
    <>
      <div className="header-card-container">
        <CardBody className="header-content pb-0">
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
        </CardBody>

        <div className="header-body">
          <Image
            src="/assets/images/header-teacher.png"
            alt="Background header"
            layout="responsive"
            width={1920}
            height={500}
            objectFit="cover"
            className="background-header-image"
          />
          <div className="teacher-title home-title">{nameCourse}</div>
          <div className="teacher-details-box">
            <div className="teacher-students-info">
              <div className="info-title">
                <span>TEACHER:</span>
              </div>
              <div className="info-title">
                <span>STUDENTS:</span>
              </div>
            </div>
            <div className="teacher-students-data">
              <div className="info-description">
                <span>{nameTeacher}</span>
              </div>
              <div className="info-description d-flex align-items-center">
                <Image
                  className="img-sm"
                  src={`${ImgPath}/course/persons.png`}
                  alt="logo"
                  layout="responsive"
                  height={10}
                  width={20}
                />
                <span className="ps-3 pe-2">{numberOfStudents}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};
export default TeachersHeader;
