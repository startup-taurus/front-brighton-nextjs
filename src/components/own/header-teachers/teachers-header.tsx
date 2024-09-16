import { Card } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

const TeachersHeader = ({
  numberOfClass,
  nameCourse,
  nameTeacher,
  numberOfStudents,
}: any) => {
  return (
    <Card className="mt-2">
      <div className="header-card-container">
        <div className="header-content">
          <div className="logo-wrapper">
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
    </Card>
  );
};
export default TeachersHeader;
