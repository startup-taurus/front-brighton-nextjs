import CourseLayout from "@/components/own/course-layout/course-layout";
import TeachersHeader from "@/components/own/header-teachers/teachers-header";
import TableStudents from "@/components/own/table-students/table-students";
import { ReactElement } from "react";
import { Card } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";
import { getCourseWithStudents } from "../../../../helper/api-data/course";
import { useRouter } from "next/router";
import useSWR from "swr";

const numberOfClass = "F-16°";
const nameTeacher = "KAORI FUKASAWA";
const numberOfStudents = "7";
const nameCourse = "A1.2 MOVERS - MON & WEB 4-6 PM";

const CourseHome: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id;

  const courseDetail = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString()),
  );

  if (!courseDetail?.data?.data) return null;
  const { course_name, course_number, professor, students, total_students } =
    courseDetail?.data?.data;

  return (
    <Card className="mt-2">
      <TeachersHeader
        numberOfClass={total_students}
        nameCourse={course_name}
        nameTeacher={professor?.name}
        numberOfStudents={course_number}
      />

      <TableStudents students={students}></TableStudents>
    </Card>
  );
};

CourseHome.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default CourseHome;
