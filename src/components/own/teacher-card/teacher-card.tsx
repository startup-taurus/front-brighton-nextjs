import React, { useContext, useEffect, useState } from 'react';
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

const TeacherCard = ({ teacher }: TeacherCardProps) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { canPermission, permissionSet } = usePermission();

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
        <div className='d-flex flex-column flex-sm-row align-items-center gap-3 '>
          <div className='flex-shrink-0'>
            {teacher.image ? (
              <Image
                src={`${UrlImage}/${teacher.image}`}
                alt={teacher.name}
                width={80}
                height={80}
                className='rounded-circle object-fit-cover'
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
          <div className='text-center text-sm-start'>
            <h5 className='fw-bold mb-1'>{teacher.name}</h5>
            <p className='text-muted '>{teacher.role}</p>
            <div className='d-flex flex-wrap gap-3 justify-content-center justify-content-sm-start'>
              <div className='d-flex align-items-center gap-2'>
                <Image
                  src={`${ImgPath}/own/bag-icon.png`}
                  alt='students icon'
                  width={20}
                  height={20}
                />
                <div>
                  <div className='fw-bold'>
                    {professorData?.data?.total_students || studentsCount}
                  </div>
                  <small className='text-muted'>Students</small>
                </div>
              </div>
              <div className='d-flex align-items-center gap-2'>
                <Image
                  src={`${ImgPath}/own/hat-icon.png`}
                  alt='courses icon'
                  width={20}
                  height={20}
                />
                <div>
                  <div className='fw-bold'>
                    {professorData?.data?.total_courses || coursesCount}
                  </div>
                  <small className='text-muted'>Courses</small>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className='mt-auto d-flex justify-content-end pt-3 border-top'>
          <Button
            color='warning'
            size='sm'
            onClick={handleViewDashboard}
          >
            View Dashboard
          </Button>
        </div>
      </CardBody>
    </Card>
  );
};

export default TeacherCard;
