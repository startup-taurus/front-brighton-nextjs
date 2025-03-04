import React, { ChangeEvent, ReactElement, useState } from "react";
import { Card, CardBody, Col, Input, Row } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";

import CourseLayout from "@/components/own/course-layout/course-layout";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { useRouter } from "next/router";
import useSWR from "swr";
import {
  getCourseById,
  getCourseWithStudents,
  getGradingItems,
  getGradingPercentageBySyllabus,
} from "../../../../helper/api-data/course";
import { getAttendanceByCourseAndStudent } from "../../../../helper/api-data/attendance";
import { getGradesByCourseAndStudent } from "../../../../helper/api-data/student-grades";
import StudentReportTable from "@/components/own/tables/student-report-table";
import Image from "next/image";
import { ImgPath } from "../../../../utils/Constant";
import { getFinalPercentageBySyllabusId } from "../../../../helper/api-data/syllabus";

const tabsName = "STUDENT REPORT";

const StudentReport: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedStudent, setSelectedStudent] = useState("");

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString()),
  );

  const studentAttendance = useSWR(
    courseId && selectedStudentId
      ? `/attendance/get-attendance-by-student/course/${courseId}/student/${selectedStudentId}`
      : null,
    () =>
      getAttendanceByCourseAndStudent(courseId!.toString(), selectedStudentId),
  );

  const gradesByStudent = useSWR(
    courseId && selectedStudentId
      ? `/student-grades/get-grades-by-course-and-student/${courseId}/${selectedStudentId}`
      : null,
    () => getGradesByCourseAndStudent(courseId!.toString(), selectedStudentId),
  );

  const gradingItems = useSWR(
    courseId ? `/course/get-grading-items/${courseId}` : null,
    () => getGradingItems(courseId),
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

  const notesPercentages = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/syllabus/get-percentages-by-syllabus/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getFinalPercentageBySyllabusId(
        courseDetail?.data?.data?.syllabus_id!.toString(),
      ),
  );

  const changeSelectedStudent = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedStudentId(value);
    const student = courseStudents?.data?.data?.students?.find(
      (s: any) => s.id == value,
    );

    setSelectedStudent(student);
  };

  const shouldRenderStudentReport =
    courseStudents?.data?.data &&
    gradingPercentage?.data?.data &&
    gradingItems?.data?.data &&
    gradesByStudent?.data?.data &&
    courseDetail?.data?.data &&
    notesPercentages?.data?.data &&
    selectedStudentId;

  return (
    <Card tag="section">
      <CardBody>
        {courseDetail?.data?.data && (
          <TabsTeachers
            numberOfClass={courseDetail?.data?.data?.course_number}
            tabsName={tabsName}
          />
        )}

        <div className="report-container">
          <Row>
            <Col xs={12} sm={12} md={12} lg={8}>
              <div className="student-selector">
                <p className="field-description">STUDENT</p>

                <Input
                  type="select"
                  name="student"
                  id="studentFilter"
                  className="report-student-filter"
                  defaultValue={selectedStudentId}
                  onChange={changeSelectedStudent}
                >
                  <option value="">Select the student</option>
                  {courseStudents?.data?.data?.students?.map((student: any) => (
                    <option
                      value={student?.id}
                      key={`student-report-${student?.id}`}
                    >
                      {student?.name}
                    </option>
                  ))}
                </Input>
                <Image
                  className="warning-logo"
                  src={`${ImgPath}/course/warning-icon.png`}
                  alt="logo"
                  width={50}
                  height={70}
                />
              </div>
            </Col>

            {shouldRenderStudentReport && (
              <StudentReportTable
                courseDetail={courseDetail?.data?.data}
                students={courseStudents?.data?.data?.students}
                studentAttendance={studentAttendance?.data?.data}
                gradingPercentage={gradingPercentage?.data?.data}
                gradingItems={gradingItems?.data?.data}
                gradesByStudent={gradesByStudent?.data?.data}
                notesPercentages={notesPercentages?.data?.data}
                selectedStudentId={selectedStudentId}
                setSelectedStudentId={selectedStudentId}
                selectedStudent={selectedStudent}
              />
            )}
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

StudentReport.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default StudentReport;
