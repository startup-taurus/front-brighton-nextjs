'use client';
import React, { useContext, useEffect } from 'react';
import { useRouter } from 'next/router';
import { UserContext } from '../../../helper/User';
import { USER_TYPES } from 'utils/constants';
import TeacherDashboard from '@/components/own/teacher-dashboard';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const { access_denied } = router.query;

  const professorId = router.query.professorId
    ? Number(router.query.professorId)
    : user?.id;

  const isCoordinator =
    user?.role === USER_TYPES.COORDINATOR && !!router.query.professorId;

  const isReceptionist =
    user?.role === USER_TYPES.RECEPTIONIST && !!router.query.professorId;

  useEffect(() => {
    if (access_denied) {
      let message = "You don't have access to this section";
      
      switch (access_denied) {
        case 'admin':
          message = "You don't have access to the administration section";
          break;
        case 'coordinator':
          message = "You don't have access to the coordinator section";
          break;
        case 'professor':
          message = "You don't have access to view other professor's information";
          break;
      }

      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: message,
        confirmButtonText: 'Understood'
      }).then(() => {
        const { access_denied, ...cleanQuery } = router.query;
        router.replace({
          pathname: router.pathname,
          query: cleanQuery
        }, undefined, { shallow: true });
      });
    }
  }, [access_denied, router]);

  return (
    <TeacherDashboard
      professorId={professorId}
      isCoordinator={isCoordinator}
      isReceptionist={isReceptionist}
    />
  );
};

export default Dashboard;
