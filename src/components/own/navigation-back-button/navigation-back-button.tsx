import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { useRouter } from 'next/router';
import { FaArrowLeft } from 'react-icons/fa';
import { decrypt } from 'utils/encryption';

interface NavigationBackButtonProps {
  professorId?: string | string[];
}

const NavigationBackButton = ({ professorId }: NavigationBackButtonProps) => {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | number | null>(null);

  useEffect(() => {
    const encrypted = localStorage.getItem('studentDetailId');
    const savedStudentId = encrypted ? Number(decrypt(encrypted)) : 0;
    if (savedStudentId) {
      setStudentId(savedStudentId);
    }
  }, []);

  const handleBackNavigation = () => {
    if (studentId) {
      router.push('/admin/students');
      localStorage.removeItem('studentDetailId');
    } else if (professorId) {
      router.push({
        pathname: '/teachers',
        query: { professorId },
      });
    } else {
      router.push('/teacher');
    }
  };

  return (
    <Button
      color='primary'
      size='sm'
      onClick={handleBackNavigation}
      className='position-fixed d-flex align-items-center back-button'
    >
      <FaArrowLeft className='me-1' />
      {studentId ? 'Back to Students Table' : 'Return to teacher'}
    </Button>
  );
};

export default NavigationBackButton;
