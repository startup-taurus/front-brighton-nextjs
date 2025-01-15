import useSWR from "swr";

import CourseLayout from "@/components/own/course-layout/course-layout";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import React, { ReactElement } from "react";
import { Card, CardBody } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";
import { useRouter } from "next/router";
import {
  getCourseById,
  getCourseWithStudents,
  getGradingItems,
  getGradingPercentageBySyllabus,
} from "../../../../helper/api-data/course";
import GradebookTable from "@/components/own/tables/gradebook-table";
import { getGradesByCourse } from "../../../../helper/api-data/student-grades";

const tabsName = "GRADEBOOK";

const Gradebook: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );

  const gradingItems = useSWR(
    courseId ? `/course/get-grading-items/${courseId}` : null,
    () => getGradingItems(courseId),
  );

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString()),
  );

  const gradesByCourse = useSWR(
    courseId ? `/student-grades/get-grades-by-course/${courseId}` : null,
    () => getGradesByCourse(courseId!.toString()),
  );

  const gradingPercentage = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/student-grades/get-grades-by-course/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getGradingPercentageBySyllabus(
        courseDetail?.data?.data?.syllabus_id!.toString(),
      ),
  );

  return (
    <Card tag="section" className="gradebook">
      <CardBody>
        <TabsTeachers
          numberOfClass={courseDetail?.data?.data?.course_number ?? ""}
          tabsName={tabsName}
        />
        {gradingItems?.data?.data &&
          courseStudents?.data?.data?.students &&
          gradingPercentage?.data?.data &&
          courseDetail?.data?.data && (
            <GradebookTable
              students={courseStudents?.data?.data?.students}
              gradingItems={gradingItems?.data?.data}
              studentsGrades={gradesByCourse?.data?.data}
              gradingPercentages={gradingPercentage?.data?.data}
              syllabusId={courseDetail?.data?.data?.syllabus_id}
            />
          )}
      </CardBody>
    </Card>
  );
};

Gradebook.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Gradebook;
