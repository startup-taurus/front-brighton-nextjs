import { Card } from "reactstrap";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

const TabsTeachers = ({ numberOfClass, tabsName }: any) => {
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
        <div className="header-body pad px-4 pb-3">
          <div className="row align-items-center">
            <div className="col-4 col-md-3 ">
              <div className="teacher-title small">{tabsName}</div>
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
    </Card>
  );
};
export default TabsTeachers;
