import AttendanceTable from "@/components/own/table-attendence/table-attendence";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card, CardBody, Nav, NavItem, NavLink } from "reactstrap";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";

const tabsName = "ATTENDANCE";
const numberOfClass = "F-16°";
const TeachersAttendance = () => {
  return (
    <div className="page-body pt-2">
      <TeacherNavMenu />
      <Card>
        <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />

        <AttendanceTable />
      </Card>
    </div>
  );
};

export default TeachersAttendance;
