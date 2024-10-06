import CourseLayout from "@/components/own/course-layout/course-layout";
import TeachersHeader from "@/components/own/header-teachers/teachers-header";
import TableStudents from "@/components/own/table-students/table-students";
import { ReactElement } from "react";
import { Card } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";

const numberOfClass = "F-16°";
const nameTeacher = "KAORI FUKASAWA";
const numberOfStudents = "7";
const nameCourse = "A1.2 MOVERS - MON & WEB 4-6 PM";

const CourseHome: NextPageWithLayout = () => {
  return (
    <Card className="mt-2">
      <TeachersHeader
        numberOfClass={numberOfClass}
        nameCourse={nameCourse}
        nameTeacher={nameTeacher}
        numberOfStudents={numberOfStudents}
      />

      <TableStudents></TableStudents>
    </Card>
  );
};

CourseHome.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseHome;
