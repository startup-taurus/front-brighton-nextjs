import React, { useContext, useState } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/router';
import { Card, CardBody, Button } from 'reactstrap';
import { ImgPath, UrlImage } from 'utils/Constant';
import { UserContext } from 'helper/User';
import useSWR from 'swr';
import { getProfessorCourses } from 'helper/api-data/professor';
import { TeacherCardProps } from 'Types/TeacherType';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const teacherNameClampStyle: React.CSSProperties = {
  display: '-webkit-box',
  WebkitLineClamp: 2,
  WebkitBoxOrient: 'vertical',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
  lineHeight: 1.25,
  maxHeight: '2.5em',
  wordBreak: 'break-word',
};

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const router = useRouter();
  useContext(UserContext);
  const { canPermission, permissionSet } = usePermission();
  const [showInitialsAvatar, setShowInitialsAvatar] = useState(!teacher.image);

  const { data: professorData } = useSWR(
    teacher.user?.id ? `professor/${teacher.user.id}/courses` : null,
    () => (teacher.user?.id ? getProfessorCourses(teacher.user.id) : null)
  );

  const studentsCount =
    professorData?.data?.status === 'success'
      ? (professorData.data.data.total_students ?? teacher.students)
      : teacher.students;

  const coursesCount =
    professorData?.data?.status === 'success'
      ? (professorData.data.data.total_courses ?? teacher.courses)
      : teacher.courses;

  const handleViewDashboard = () => {
    const canViewTeachers = !!permissionSet && canPermission(PERMISSIONS.VIEW_TEACHERS);
    if (canViewTeachers && teacher.user?.id) {
      router.push({
        pathname: '/teachers',
        query: {
          professorId: teacher.user.id,
        },
      });
    }
  };

  return (
    <Card className='overflow-hidden mb-4 shadow-sm border-0 h-100 '>
      <CardBody className='p-4 d-flex flex-column '>
        <div className='d-flex flex-column align-items-center gap-3 h-100'>
          <div className='flex-shrink-0'>
            {!showInitialsAvatar ? (
              <Image
                src={`${UrlImage}/${teacher.image}`}
                alt={teacher.name}
                width={80}
                height={80}
                className='rounded-circle object-fit-cover d-block'
                onError={() => setShowInitialsAvatar(true)}
              />
            ) : (
              <div
                className='rounded-circle bg-light d-flex align-items-center justify-content-center text-uppercase fw-bold text-secondary'
                style={{ width: 80, height: 80 }}
              >
                {teacher.name
                  .split(' ')
                  .map((n) => n[0])
                  .join('')}
              </div>
            )}
          </div>

          <div className='text-center w-100 px-1' style={{ minWidth: 0 }}>
            <h5 className='fw-bold mb-1' title={teacher.name} style={teacherNameClampStyle}>
              {teacher.name}
            </h5>

            <p className='text-muted mb-0'>{teacher.role}</p>

            <div
              className='d-grid gap-2 mt-3 w-100'
              style={{ gridTemplateColumns: 'repeat(2, minmax(0, 1fr))' }}
            >
              <div className='d-flex align-items-center justify-content-center gap-2 w-100 overflow-hidden'>
                <Image
                  src={`${ImgPath}/own/bag-icon.png`}
                  alt='students icon'
                  width={20}
                  height={20}
                />
                <div className='overflow-hidden'>
                  <div className='fw-bold'>
                    {professorData?.data?.total_students || studentsCount}
                  </div>
                  <small className='text-muted d-block text-nowrap'>Students</small>
                </div>
              </div>

              <div className='d-flex align-items-center justify-content-center gap-2 w-100 overflow-hidden'>
                <Image
                  src={`${ImgPath}/own/hat-icon.png`}
                  alt='courses icon'
                  width={20}
                  height={20}
                />
                <div className='overflow-hidden'>
                  <div className='fw-bold'>
                    {professorData?.data?.total_courses || coursesCount}
                  </div>
                  <small className='text-muted d-block text-nowrap'>Courses</small>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className='mt-auto d-flex justify-content-end pt-3 border-top w-100'>
          <Button
            color='warning'
            size='sm'
            onClick={handleViewDashboard}
            className='w-100'
          >
            View Dashboard
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default TeacherCard;
