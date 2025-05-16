import React, { useEffect, useState } from 'react';
import { Button } from 'reactstrap';
import { useRouter } from 'next/router';
import { FaArrowLeft } from 'react-icons/fa';

interface NavigationBackButtonProps {
  professorId?: string | string[];
}

const NavigationBackButton = ({ professorId }: NavigationBackButtonProps) => {
  const router = useRouter();
  const [studentId, setStudentId] = useState<string | null>(null);

  useEffect(() => {
    // Verificar si hay un ID de estudiante guardado en localStorage
    const savedStudentId = localStorage.getItem('studentDetailId');
    if (savedStudentId) {
      setStudentId(savedStudentId);
    }
  }, []);

  const handleBackNavigation = () => {
    if (studentId) {
      // Navegar de vuelta a la página donde se muestra el detalle del estudiante
      router.back();
      // Limpiar el ID del estudiante del localStorage después de usarlo
      localStorage.removeItem('studentDetailId');
    } else if (professorId) {
      // Navegar de vuelta a la página del profesor
      router.push({
        pathname: '/teachers',
        query: { professorId },
      });
    } else {
      // Caso por defecto: volver a la página del profesor
      router.push('/teacher');
    }
  };

  return (
    <Button
      color='primary'
      size='sm'
      onClick={handleBackNavigation}
      className='position-fixed d-flex align-items-center'
      style={{ zIndex: 9999, top: '2.3%', left: '15%' }}
    >
      <FaArrowLeft className='me-1' />
      {studentId ? 'Volver a Detalles del Estudiante' : 'Return to teacher'}
    </Button>
  );
};

export default NavigationBackButton;
