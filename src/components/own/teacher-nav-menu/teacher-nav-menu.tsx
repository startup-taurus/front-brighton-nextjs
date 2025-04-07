import React, { useEffect, useState } from 'react';
import { Card, Nav, NavItem, NavLink, Button } from 'reactstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { FaArrowLeft } from 'react-icons/fa';
import { left } from '@popperjs/core';

const NAV_ITEMS = [
  { id: 'home', name: '🏠 HOME', link: '/course/${id}/home' },
  { id: 'attendance', name: '📋 ATTENDANCE', link: '/course/${id}/attendance' },
  { id: 'gradebook', name: '📚 GRADEBOOK', link: '/course/${id}/gradebook' },
  { id: 'holidays', name: '‍🌴 HOLIDAYS', link: '/course/${id}/holidays' },
  {
    id: 'student-report',
    name: '👨‍🎓 STUDENT REPORT',
    link: '/course/${id}/student-report',
  },
  { id: 'faq', name: '❓ FAQ', link: '/course/${id}/faq' },
];

interface TeacherNavMenuProps {
  fromProfessorId?: string | string[];
}

const TeacherNavMenu = ({ fromProfessorId }: TeacherNavMenuProps) => {
  const router = useRouter();
  const courseId = router.query.id ?? 0;
  const professorId = router.query.professorId || fromProfessorId;
  const lastSegment = router.asPath.split('/').pop() ?? '';
  const [baseSegment] = lastSegment.split('?');

  const [active, setActive] = useState('');

  const handleBackToTeacher = () => {
    router.push({
      pathname: '/teachers',
      query: { professorId },
    });
  };

  useEffect(() => {
    setActive(baseSegment);
  }, [baseSegment]);

  return (
    <>
      {professorId && (
        <Button
          color='primary'
          size='sm'
          onClick={handleBackToTeacher}
          className='position-fixed  d-flex align-items-center'
          style={{ zIndex: 9999, top: '2.3%', left: '15%' }}
        >
          <FaArrowLeft className='me-1' />
          Return to teacher
        </Button>
      )}

      <Card className='px-4 py-2 mt-2'>
        <Nav
          fill
          pills
        >
          {NAV_ITEMS.map(({ name, link, id }, index) => (
            <NavItem key={`teacher-nav-${index}`}>
              <Link
                href={{
                  pathname: link.replace('${id}', courseId.toString()),
                  query: { professorId },
                }}
              >
                <NavLink
                  tag='span'
                  className={active === id ? 'active' : ''}
                >
                  {name}
                </NavLink>
              </Link>
            </NavItem>
          ))}
        </Nav>
      </Card>
    </>
  );
};

export default TeacherNavMenu;
