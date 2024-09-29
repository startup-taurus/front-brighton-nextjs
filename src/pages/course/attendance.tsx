import CourseLayout from "@/components/own/course-layout/course-layout";
import AttendanceTable from "@/components/own/table-attendence/table-attendence";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";
import { ReactElement } from "react";
import { Card, CardBody } from "reactstrap";

const tabsName = "ATTENDANCE";
const numberOfClass = "F-16°";

const TeachersAttendance = () => {
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
