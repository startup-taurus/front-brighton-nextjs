import CourseLayout from "@/components/own/course-layout/course-layout";
import AttendanceTable from "@/components/own/table-attendence/table-attendence";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { ReactElement } from "react";
import { Card, CardBody } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";

const tabsName = "ATTENDANCE";
const numberOfClass = "F-16°";

const TeachersAttendance: NextPageWithLayout = () => {
  return (
    <Card tag="section">
      <CardBody>
        <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
        <AttendanceTable />
      </CardBody>
    </Card>
  );
};

TeachersAttendance.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersAttendance;
