'use client';
import React, { useContext } from 'react';
import { Card, CardBody } from 'reactstrap';
import SectionTitle from '@/components/own/section-title/section-title';
import TeacherProfile from '@/components/own/teacher-profile/teacher-profile';
import { UrlImage } from 'utils/Constant';
import CoursesList from '@/components/own/courses-list/courses-list';
import QuickLinksList from '@/components/own/quick-links-list/quick-links-list';
import ScheduleCalendar from '@/components/own/schedule-calendar/schedule-calendar';
import useSWR from 'swr';
import { getProfessorActiveCoursesForCalendar, getProfessorCourses } from 'helper/api-data/professor';
import { getFetcher } from 'helper/api';
import { UserContext } from 'helper/User';

const QUICK_LINKS = [
  {
    title: 'Personal Best',
    link: 'https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F',
    icon: '📚',
  },
  {
    title: 'Study Guides',
    link: 'https://drive.google.com/drive/folders/1uA2VgHN_SZUz8dqwtohTiAJ-qx18phuc',
    icon: '🎒',
  },
  {
    title: 'Final Projects',
    link: 'https://drive.google.com/drive/folders/1uLk_oPsPtNhJ0UJAbC51_48r5Y19E6Qx',
    icon: '🎓',
  },
  {
    title: 'Final Exams',
    link: 'https://drive.google.com/drive/folders/1NYeWSHLyHa-K1qvOST0dIq-ihoEKLLIO',
    icon: '📝',
  },
  {
    title: 'Rulebooks',
    link: 'https://drive.google.com/drive/folders/1D7UJ5u8r9KHkSZq1KG9nhp5uOfP5SyB1',
    icon: '📔',
  },
];

interface TeacherDashboardProps {
  professorId: number;
  isCoordinator?: boolean;
  isReceptionist?: boolean;
}

const TeacherDashboard = ({
  professorId,
  isCoordinator = false,
  isReceptionist = false,
}: TeacherDashboardProps) => {
  const { user } = useContext(UserContext);

  const userData = useSWR(
    isCoordinator || isReceptionist ? `/user/get-one/${professorId}` : null,
    () => getFetcher(`/user/get-one/${professorId}`, false)
  );

  const courses = useSWR(
    professorId ? `/professor/${professorId}/courses` : null,
    () => getProfessorCourses(professorId)
  );

  const calendarCourses = useSWR(
    professorId ? `/professor/${professorId}/courses/calendar` : null,
    () => getProfessorActiveCoursesForCalendar(professorId)
  );

  if (!courses?.data?.data?.courses) return null;

  const displayUser =
    isCoordinator || isReceptionist ? userData?.data?.data || {} : user;

  // Fallback seguro: si el endpoint de calendario viene vacío, usamos cursos normales filtrando finalizados
  const rawCalendarCourses = calendarCourses?.data?.data?.courses || [];
  const fallbackCourses = courses?.data?.data?.courses || [];
  const today = new Date(); today.setHours(0, 0, 0, 0);

  const onlyActive = (list: any[]) =>
    list.filter((c: any) => {
      const end = c?.end_date ? new Date(c.end_date) : null;
      const endedByDate = end ? (end.setHours(0,0,0,0), end < today) : false;
      const endedByFlag = Boolean(c?.options?.isAlreadyEnd || c?.options?.isAreadyEnd);
      return !(endedByDate || endedByFlag);
    });

  const calendarSource =
    rawCalendarCourses.length > 0 ? rawCalendarCourses : onlyActive(fallbackCourses);

  return (
    <div className='page-body pt-2'>
      <Card>
        <CardBody>
          <SectionTitle title='Dashboard' />
          <TeacherProfile
            profileData={{
              profileImage: displayUser?.image
                ? `${UrlImage}/${displayUser.image}`
                : '/assets/images/user/user.png',
              firstName: displayUser?.name?.split(' ')[0] || '',
              lastName: displayUser?.name?.split(' ')[1] || '',
              position: displayUser?.role || '',
              studentQty: courses?.data?.data?.total_students,
              coursesQty: courses?.data?.data?.total_courses,
            }}
          />
          <div className='divider'></div>
          <div className='d-flex flex-column flex-lg-row justify-content-between pb-5'>
            <CoursesList
              title='Courses'
              coursesList={courses?.data?.data?.courses}
            />
            <QuickLinksList
              title='Quick Links'
              quickLinks={QUICK_LINKS}
              otherLinks={[
                {
                  title: 'Monthly reports',
                  link: displayUser?.report_link || null,
                  icon: '📁',
                },
              ]}
            />
          </div>
          <div className='divider'></div>
          <ScheduleCalendar courses={calendarSource} />
        </CardBody>
      </Card>
    </div>
  );
};

export default TeacherDashboard;
