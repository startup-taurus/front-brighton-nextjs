import CourseLayout from "@/components/own/course-layout/course-layout";
import AttendanceTable from "@/components/own/table-attendance/table-attendance";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";
import { ReactElement } from "react";
import { Card, CardBody } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";

const tabsName = "STUDENT REPORT";
const numberOfClass = "F-16°";

const Gradebook: NextPageWithLayout = () => {
  return (
    <Card tag="section">
      <CardBody>
        <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
        {/*<AttendanceTable />*/}
      </CardBody>
    </Card>
  );
};

Gradebook.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Gradebook;
