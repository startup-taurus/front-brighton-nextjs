import useSWR from "swr";
import { Card, CardBody, Col } from "reactstrap";
import { getDashboardData } from "helper/api-data/user";
import DashboardHead from "../../DashboardCommon/DashboardHead";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

const SchoolData = () => {
  const { data: schoolCardData } = useSWR([`/get-dashboard-data/get-all`], () =>
    getDashboardData()
  );

  return (
    <>
      {schoolCardData.data.map((data: any, index: number) => (
        <Col
          md={4}
          className={data.smallScreenClass ? "col-sm-6" : ""}
          key={index}
        >
          <Card className="widget-hover overflow-hidden">
            <DashboardHead
              title={data.header}
              headClass="card-no-border pb-2"
            />
            <CardBody className="pt-0 count-student">
              <div className="school-wrapper">
                <div className="school-header">
                  <h4 className={`txt-${data?.amountClass}`}>{data.amount}</h4>
                  <div className="d-flex gap-1 align-items-center flex-wrap pt-xxl-0 pt-2">
                    <i className="icon-arrow-up f-light" />
                    <span className="f-w-500 f-light">{data.growth}</span>
                    <p className="text-muted">than last month</p>
                  </div>
                </div>
                <div className="school-body">
                  <Image
                    height={59}
                    width={70}
                    src={`${ImgPath}/dashboard-7/${data.imageName}`}
                    alt="total teachers"
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}
    </>
  );
};

export default SchoolData;
