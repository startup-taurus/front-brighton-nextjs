import useSWR from 'swr';

import CourseLayout from '@/components/own/course-layout/course-layout';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import React, { ReactElement, useContext, useEffect, useState } from 'react';
import { Card, CardBody } from 'reactstrap';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import {
  getCourseById,
  getCourseWithStudents,
  getGradingItems,
  getGradingPercentageBySyllabus,
} from '../../../../helper/api-data/course';
import GradebookTable from '@/components/own/tables/gradebook-table';
import { getGradesByCourse } from '../../../../helper/api-data/student-grades';
import { getFinalPercentageBySyllabusId } from '../../../../helper/api-data/syllabus';
import useFilteredGradingItems from '../../../../hooks/useFilteredGradingItems';
import { decrypt } from 'utils/encryption';
import { UserContext } from 'helper/User';
import { USER_TYPES, COURSE_TAB_NAMES, APP_PATHS } from 'utils/constants';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const Gradebook: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [studentId, setStudentId] = useState<string | number | null>(null);
  const { user } = useContext(UserContext);
  const isProfessor = user?.role === USER_TYPES.PROFESSOR;
  const { canPermission, userRole, permissionSet } = usePermission();
  const canViewGradebook = canPermission(PERMISSIONS.VIEW_GRADEBOOK);
  
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

  const gradingItems = useSWR(
    courseId ? `/course/get-grading-items/${courseId}` : null,
    () => getGradingItems(courseId)
  );

  const filteredGradingItems = useFilteredGradingItems(
    gradingItems?.data?.data
  );

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString())
  );

  const gradesByCourse = useSWR(
    courseId ? `/student-grades/get-grades-by-course/${courseId}` : null,
    () => getGradesByCourse(courseId!.toString())
  );

  const gradingPercentage = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/student-grades/get-grades-by-course/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getGradingPercentageBySyllabus(
        courseDetail?.data?.data?.syllabus_id!.toString()
      )
  );

  const notesPercentages = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/syllabus/get-percentages-by-syllabus/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getFinalPercentageBySyllabusId(
        courseDetail?.data?.data?.syllabus_id!.toString()
      )
  );


  useEffect(() => {
    if (permissionSet && !canViewGradebook) {
      router.replace(APP_PATHS.DASHBOARD);
    }
  }, [canViewGradebook, router, permissionSet]);

  if (!userRole && !permissionSet) return null;
  if (!canViewGradebook) return null;

  return (
    <Card tag='section' className='gradebook'>
      <CardBody>
        {!isProfessor && (
          <NavigationBackButton professorId={router.query.professorId} />
        )}
        <TabsTeachers
          numberOfClass={courseDetail?.data?.data?.course_number ?? ''}
          tabsName={COURSE_TAB_NAMES.GRADEBOOK}
        />

        {filteredGradingItems.length > 0 &&
          courseStudents?.data?.data?.students &&
          gradingPercentage?.data?.data &&
          courseDetail?.data?.data &&
          notesPercentages?.data?.data && (
            <GradebookTable
              students={courseStudents?.data?.data?.students}
              gradingItems={filteredGradingItems}
              studentsGrades={gradesByCourse?.data?.data}
              gradingPercentages={gradingPercentage?.data?.data}
              notesPercentages={notesPercentages?.data?.data}
              syllabusId={courseDetail?.data?.data?.syllabus_id}
              courseStatus={courseDetail?.data?.data?.status}
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
