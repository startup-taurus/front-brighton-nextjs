import React, { ReactElement, useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import useSWR from 'swr';

import CourseLayout from '@/components/own/course-layout/course-layout';
import AttendanceTable from '@/components/own/table-attendance/table-attendance';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import {
  getCourseById,
  getCourseWithStudents,
} from '../../../../helper/api-data/course';
import { getAttendance } from '../../../../helper/api-data/attendance';
import AttendanceHelpBox from '@/components/own/attendance-help-box/attendance-help-box';
import { getCourseScheduleDates } from '../../../../helper/api-data/course-schedule';
import { decrypt } from 'utils/encryption';

const tabsName = 'ATTENDANCE';

const TeachersAttendance: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [studentId, setStudentId] = useState<string | number | null>(null);

  useEffect(() => {
    const encrypted = localStorage.getItem('studentDetailId');
    const savedStudentId = encrypted ? Number(decrypt(encrypted)) : 0;
    if (savedStudentId) {
      setStudentId(savedStudentId);
    }
  }, []);

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId)
  );
  const courseAttendance = useSWR(
    courseId ? `/attendance/get-by-course/${courseId}` : null,
    () => getAttendance(courseId)
  );

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString())
  );

  const schedule = useSWR(
    courseId ? `/course-schedule/get-syllabus-by-course/${courseId}` : null,
    () => getCourseScheduleDates(courseId!.toString())
  );

  if (!courseDetail?.data?.data) return null;

  const { course_number } = courseDetail?.data?.data;
  const studentsAttendance = courseAttendance?.data?.data;
  const students = courseStudents?.data?.data?.students;
  const courseSchedule = schedule?.data?.data;

  const shouldRenderStudentAttendance =
    studentsAttendance && students && courseSchedule;

  return (
    <Card
      tag='section'
      className='attendance'
    >
      <CardBody>
        <NavigationBackButton professorId={router.query.professorId} />
        <TabsTeachers
          numberOfClass={course_number}
          tabsName={tabsName}
        />
        {shouldRenderStudentAttendance && (
          <AttendanceTable
            courseSchedule={courseSchedule}
            studentsAttendance={studentsAttendance}
            students={students}
          />
        )}
        <AttendanceHelpBox />
      </CardBody>
    </Card>
  );
};

TeachersAttendance.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersAttendance;
