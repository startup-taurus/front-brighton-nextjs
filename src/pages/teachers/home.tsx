import { Card } from "reactstrap";
import TeachersHeader from "@/components/own/header-teachers/teachers-header";
import TableStudents from "@/components/own/table-students/table-students";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";

const numberOfClass = "F-16°";
const nameTeacher = "KAORI FUKASAWA";
const numberOfStudents = "7";
const nameCourse = "A1.2 MOVERS - MON & WEB 4-6 PM";

const TeachersHome = () => {
  return (
    <div className="page-body pt-2">
      <TeacherNavMenu />
      <Card className="mt-2">
        <TeachersHeader
          numberOfClass={numberOfClass}
          nameCourse={nameCourse}
          nameTeacher={nameTeacher}
          numberOfStudents={numberOfStudents}
        />

        <TableStudents></TableStudents>
      </Card>
    </div>
  );
};
export default TeachersHome;
