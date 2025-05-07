'use client';
import React, { useContext } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../../../helper/User';
import { USER_TYPES } from 'utils/constants';
import TeacherDashboard from '@/components/own/teacher-dashboard';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();

  const professorId = router.query.professorId
    ? Number(router.query.professorId)
    : user?.id;

  const isCoordinator =
    user?.role === USER_TYPES.COORDINATOR && !!router.query.professorId;

    const isReceptionist =
      user?.role === USER_TYPES.RECEPTIONIST &&!!router.query.professorId;

  return (
    <TeacherDashboard
      professorId={professorId}
      isCoordinator={isCoordinator}
      isReceptionist={isReceptionist}
    />
  );
};

export default Dashboard;
