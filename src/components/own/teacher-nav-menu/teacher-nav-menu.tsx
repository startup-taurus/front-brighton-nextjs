import React, { useContext, useEffect, useState } from 'react';
import { Card, Nav, NavItem, NavLink } from 'reactstrap';
import { useRouter } from 'next/router';
import Link from 'next/link';
import NavigationBackButton from '@/components/own/navigation-back-button/navigation-back-button';
import { UserContext } from '../../../../helper/User';
import { USER_TYPES } from '../../../../utils/constants';
import useSWR from 'swr';
import { getCourseWithStudents } from '../../../../helper/api-data/course';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

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

  const courseDetail = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString())
  );
  const { can, permissionSet } = usePermission();

  const isCoordinatorOrAdmin = user?.role === USER_TYPES.COORDINATOR || 
                               user?.role === USER_TYPES.PROFESSOR || 
                               user?.role === USER_TYPES.RECEPTIONIST ||
                               user?.role === USER_TYPES.FINANCIAL;

  const courseData = courseDetail?.data?.data;
  const isPrivateClass = courseData?.course_type === 'private' || 
                     courseData?.course_type === 'private - online';

  const NAV_ITEMS = React.useMemo(() => {
    
    if (isPrivateClass && isCoordinatorOrAdmin) {
      return PRIVATE_CLASS_NAV_ITEMS;
    }
    
    const items = BASE_NAV_ITEMS;
    const filtered = items.filter((item) => {
      if (!permissionSet) {
        return item.id === 'home' || item.id === 'faq';
      }
      switch (item.id) {
        case 'attendance':
          return can(PERMISSIONS.VIEW_ATTENDANCE);
        case 'gradebook':
          return can(PERMISSIONS.VIEW_GRADEBOOK);
        case 'holidays':
          return can(PERMISSIONS.VIEW_HOLIDAYS);
        case 'student-report':
          return can(PERMISSIONS.VIEW_STUDENT_REPORTS);
        default:
          return true;
      }
    });
    return filtered;
  }, [isCoordinatorOrAdmin, isPrivateClass, courseData, permissionSet, can]);

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
