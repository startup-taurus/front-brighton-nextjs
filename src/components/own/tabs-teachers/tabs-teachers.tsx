import { Card } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

const TabsTeachers = ({ numberOfClass, tabsName }: any) => {
  return (
    <div className="header-card-container mb-4">
      <div className="header-content mb-2">
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
      <div className="header-body pad">
        <div className="row align-items-center">
          <div className="col-4 col-md-3 ">
            <h1 className="teacher-title small">{tabsName}</h1>
          </div>
          <div className="col-8 col-md-9">
            <Image
              className="for-light img-sm"
              src={`${ImgPath}/course/bars.png`}
              alt="logo"
              layout="responsive"
              width={100}
              height={100}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
export default TabsTeachers;
