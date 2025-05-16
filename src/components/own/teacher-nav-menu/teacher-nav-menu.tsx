import React, { useEffect, useState } from 'react';
import { Card, Nav, NavItem, NavLink } from 'reactstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
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
  // Extraer el segmento de la ruta para determinar la pestaña activa
  const pathSegments = router.asPath.split('/');
  const lastSegment = pathSegments.pop() ?? '';
  const [baseSegment] = lastSegment.split('?');

  const [active, setActive] = useState('');

  // Ya no necesitamos esta función porque la lógica está en el componente NavigationBackButton

  useEffect(() => {
    // Identificar la pestaña activa basada en el segmento de la URL
    const currentPath = router.asPath;
    const activeItem = NAV_ITEMS.find((item) => {
      const itemPath = item.link.replace('${id}', courseId.toString());
      return currentPath.includes(itemPath.split('/').pop() || '');
    });

    if (activeItem) {
      setActive(activeItem.id);
    } else {
      setActive(baseSegment);
    }
  }, [baseSegment, courseId, router.asPath]);

  return (
    <>
      {professorId && (
        <NavigationBackButton professorId={professorId} />
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
                  query: professorId ? { professorId } : undefined,
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
