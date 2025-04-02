'use client';
import Footer from 'CommonElements/Footer';
import { ReactNode } from 'react';
import TeacherNavMenu from '../teacher-nav-menu/teacher-nav-menu';
import Layout from '@/layout';
import { useRouter } from 'next/router';

interface layoutProps {
  children: ReactNode;
}

const CourseLayout = ({ children }: layoutProps) => {
  const router = useRouter();
  const professorId = router.query.professorId;

  return (
    <Layout>
      <div className='page-body pt-2'>
        <TeacherNavMenu fromProfessorId={professorId} />
        {children}
      </div>
    </Layout>
  );
};

export default CourseLayout;
