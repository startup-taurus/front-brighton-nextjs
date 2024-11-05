import EventCalendar from "@/components/Dashboard/SchoolManagenement/EventCalendar";
import NoticeBoard from "@/components/Dashboard/SchoolManagenement/NoticeBoard";
import SchoolData from "@/components/Dashboard/SchoolManagenement/SchoolData";
import StudentLeader from "@/components/Dashboard/SchoolManagenement/StudentLeader";
import TodayTask from "@/components/Dashboard/SchoolManagenement/TodayTask";
import Breadcrumbs from "CommonElements/Breadcrumbs";
import dynamic from "next/dynamic";
import { Col, Container, Row } from "reactstrap";
import { SchoolManage, SchoolManagementHeading } from "utils/Constant";

const SchoolManagement = () => {
  const AcademicPerformance = dynamic(
    () =>
      import("@/components/Dashboard/SchoolManagenement/AcademicPerformance"),
    { ssr: false },
  );
  const SchoolPerformance = dynamic(
    () => import("@/components/Dashboard/SchoolManagenement/SchoolPerformance"),
    { ssr: false },
  );
  const SchoolIncome = dynamic(
    () => import("@/components/Dashboard/SchoolManagenement/SchoolIncome"),
    { ssr: false },
  );

  return (
    <div className="page-body">
      <Breadcrumbs
        title={SchoolManage}
        mainTitle={SchoolManagementHeading}
        parent="Dashboard"
      />
      <Container fluid={true}>
        <Row>
          <Col xxl={12} className="box-col-12">
            <Row>
              <AcademicPerformance />
              <SchoolPerformance />
              <SchoolData />
              <SchoolIncome />
              <EventCalendar />
              <TodayTask />
            </Row>
          </Col>
          <Col xxl={12} className="d-xxl-block d-none box-col-none">
            <Row>
              <NoticeBoard />
              <StudentLeader />
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SchoolManagement;
