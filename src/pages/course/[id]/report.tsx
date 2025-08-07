import React, { ReactElement, useContext } from 'react';
import { Card, CardBody } from 'reactstrap';
import { NextPageWithLayout } from '@/pages/_app';
import { useRouter } from 'next/router';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import useSWR from 'swr';
import CourseLayout from '@/components/own/course-layout/course-layout';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import { getCourseById } from '../../../../helper/api-data/course';
import { UserContext } from 'helper/User';
import { USER_TYPES } from 'utils/constants';

const tabsName = 'REPORT';

const TeachersReport: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const { user } = useContext(UserContext);
  const isProfessor = user?.role === USER_TYPES.PROFESSOR;

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId)
  );

  if (!courseDetail?.data?.data) return null;

  const { course_number } = courseDetail?.data?.data;

  const reportData = [
    {
      date: 'MONDAY, 5TH JULY',
      status: 'DONE',
      hrs: '1',
      topic: 'Greetings & Introductions'
    },
    {
      date: 'MONDAY, 6TH JULY',
      status: 'DONE',
      hrs: '1',
      topic: 'The Alphabet & Spelling Names'
    },
    {
      date: 'MONDAY, 7TH JULY',
      status: 'DONE',
      hrs: '1',
      topic: 'Daily Routines'
    },
    {
      date: 'MONDAY, 8TH JULY',
      status: 'DONE',
      hrs: '1',
      topic: 'Simple Verbs (Present Tense)'
    }
  ];

  const usedHours = reportData.reduce((total, item) => total + parseInt(item.hrs), 0);

  return (
    <Card
      tag='section'
      className='course-report'
    >
      <div className="decorative-background"></div>
      
      <CardBody>
        {!isProfessor && (
          <NavigationBackButton professorId={router.query.professorId} />
        )}
        <TabsTeachers
          numberOfClass={course_number}
          tabsName={tabsName}
        />
        
        <div className="report-content">
          <div className="report-table-container">
            <table className="report-table">
              <thead>
                <tr>
                  <th>DATE</th>
                  <th>STATUS</th>
                  <th>HRS.</th>
                  <th>TOPIC</th>
                </tr>
              </thead>
              <tbody>
                {reportData.map((item, index) => (
                  <tr key={index}>
                    <td>{item.date}</td>
                    <td>{item.status}</td>
                    <td>{item.hrs}</td>
                    <td>{item.topic}</td>
                  </tr>
                ))}
                {Array.from({ length: 10 }).map((_, index) => (
                  <tr key={`empty-${index}`}>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                    <td>&nbsp;</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="used-hours-badge">
            <div className="used-hours-header">USED HOURS</div>
            <div className="used-hours-value">{usedHours}.00</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

TeachersReport.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersReport;