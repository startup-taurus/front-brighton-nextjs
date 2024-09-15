import AttendanceTable from "@/components/own/table-attendence/table-attendence";
import TableStudents from "@/components/own/table-students/table-students";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card } from "reactstrap";

const tabsName = "ATTENDANCE";
const numberOfClass = "F-16°";
const TeachersAttendance = () => {
  return (
    <div className="page-body pt-2">
      <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
      <Card>
         <AttendanceTable />
      </Card>
    </div>
  );
};

export default TeachersAttendance;
