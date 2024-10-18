import CourseLayout from "@/components/own/course-layout/course-layout";
import AttendanceTable from "@/components/own/table-attendance/table-attendance";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { ReactElement, useEffect } from "react";
import { Card, CardBody } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";
import { useRouter } from "next/router";
import useSWR from "swr";
import {
  getCourseById,
  getCourseWithStudents,
} from "../../../../helper/api-data/course";
import { getAttendance } from "../../../../helper/api-data/attendance";

const tabsName = "ATTENDANCE";

const TeachersAttendance: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );
  const courseAttendance = useSWR(
    courseId ? `/attendance/get-by-course/${courseId}` : null,
    () => getAttendance(courseId),
  );

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString()),
  );

  if (
    !courseDetail?.data?.data ||
    !courseStudents?.data?.data ||
    !courseAttendance?.data?.data
  )
    return null;
  const { course_number, start_date, end_date, schedule } =
    courseDetail?.data?.data;
  const studentsAttendance = courseAttendance?.data?.data;
  const { students } = courseStudents?.data?.data;

  return (
    <Card tag="section">
      <CardBody>
        <TabsTeachers numberOfClass={course_number} tabsName={tabsName} />
        <AttendanceTable
          startDate={start_date}
          endDate={end_date}
          schedule={schedule}
          studentsAttendance={studentsAttendance}
          students={students}
        />
      </CardBody>
    </Card>
  );
};

TeachersAttendance.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersAttendance;
