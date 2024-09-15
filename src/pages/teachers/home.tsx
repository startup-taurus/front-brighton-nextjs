import TeachersHeader from "@/components/own/header-teachers/teachers-header";
import TableStudents from "@/components/own/table-students/table-students";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card } from "reactstrap";

const numberOfClass = "F-16°";
const nameTeacher = "KAORI FUKASAWA";
const numberOfStudents = "7";
const nameCourse = "A1.2 MOVERS - MON & WEB 4-6 PM";
const TeachersHome = () => {
  return (
    <div className="page-body pt-2">
      <TeachersHeader
        numberOfClass={numberOfClass}
        nameCourse={nameCourse}
        nameTeacher={nameTeacher}
        numberOfStudents={numberOfStudents}
      />
      <Card>
        <TableStudents></TableStudents>
      </Card>
    </div>
  );
};
export default TeachersHome;
