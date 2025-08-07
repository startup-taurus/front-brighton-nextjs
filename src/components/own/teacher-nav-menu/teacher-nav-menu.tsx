import React, { useContext, useEffect, useState } from 'react';
import { Card, Nav, NavItem, NavLink } from 'reactstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import { UserContext } from '../../../../helper/User';
import { USER_TYPES } from '../../../../utils/constants';
import useSWR from 'swr';
import { getCourseWithStudents } from '../../../../helper/api-data/course';

const BASE_NAV_ITEMS = [
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

// Pestañas específicas para clases privadas
const PRIVATE_CLASS_NAV_ITEMS = [
  { id: 'home', name: '🏠 HOME', link: '/course/${id}/home' },
  { id: 'report', name: '📊 REPORT', link: '/course/${id}/report' },
];

interface TeacherNavMenuProps {
  fromProfessorId?: string | string[];
}

const TeacherNavMenu = ({ fromProfessorId }: TeacherNavMenuProps) => {
  const router = useRouter();
  const courseId = router.query.id ?? 0;
  const professorId = router.query.professorId || fromProfessorId;
  const pathSegments = router.asPath.split('/');
  const lastSegment = pathSegments.pop() ?? '';
  const [baseSegment] = lastSegment.split('?');
  const { user } = useContext(UserContext);

  const [active, setActive] = useState('');

  // Obtener información del curso para verificar si es privado
  const courseDetail = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString())
  );

  // Verificar si el usuario es coordinador o administrador
  const isCoordinatorOrAdmin = user?.role === USER_TYPES.COORDINATOR || 
                               user?.role === USER_TYPES.ADMIN || 
                               user?.role === USER_TYPES.RECEPTIONIST ||
                               user?.role === USER_TYPES.FINANCIAL;

  // Verificar si es una clase privada
  const courseData = courseDetail?.data?.data;
  const isPrivateClass = courseData?.course_type === 'private' || 
                         courseData?.course_type === 'private - online' ||
                         courseData?.course_name?.includes('PRIV');

  // Crear array de navegación dinámico
  const NAV_ITEMS = React.useMemo(() => {
    // Si es una clase privada y el usuario es coordinador/admin, mostrar solo HOME y REPORT
    if (isPrivateClass && isCoordinatorOrAdmin) {
      return PRIVATE_CLASS_NAV_ITEMS;
    }
    
    // Para clases regulares, mostrar todas las pestañas
    return BASE_NAV_ITEMS;
  }, [isCoordinatorOrAdmin, isPrivateClass]);

  useEffect(() => {
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
  }, [baseSegment, courseId, router.asPath, NAV_ITEMS]);

  return (
    <>
      {professorId && <NavigationBackButton professorId={professorId} />}

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
