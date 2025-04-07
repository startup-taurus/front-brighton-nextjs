import { getFetcher, postFetcher, putFetcher } from '../api';
export const getAllStudent = (
  page: number,
  limit: number,
  filters?: string
) => {
  return getFetcher(
    `/student/get-all?page=${page}&limit=${limit}${filters ? `&${filters}` : ''}`,
    false
  );
};
export const getDistinctLevel = (page: number, limit: number) => {
  return getFetcher(
    `/student/get-distinct-levels?page=${page}&limit=${limit}`,
    false
  );
};

export const createStudent = (data: any) => {
  return postFetcher('/student/create', data);
};

export const updateStudent = (studentId: number, data: any) => {
  return putFetcher(`/student/update/${studentId}`, data);
};

export const updateStatusStudent = (studentId: number, status: string) => {
  return putFetcher(`/student/update-status/${studentId}`, { status });
};

export const updateStudentLevelChangeStatus = (
  studentId: number,
  status: 'pending' | 'approved' | 'rejected'
) => {
  return putFetcher(`/student/update-level-change-status/${studentId}`, {
    status_level_change: status,
  });
};

export const transferStudents = (studentIds: number[], courseId: string) => {
  // Usar el endpoint de actualización en lugar del endpoint de transferencia
  // Para cada estudiante, hacemos una petición de actualización
  const promises = studentIds.map((studentId) => {
    return putFetcher(`/student/update/${studentId}`, { courseId });
  });

  // Devolver una promesa que se resuelve cuando todas las actualizaciones se completan
  return Promise.all(promises)
    .then((results) => {
      // Devolver un formato similar al anterior para mantener compatibilidad
      return {
        statusCode: 200,
        message: 'Students transferred successfully',
      };
    })
    .catch((error) => {
      console.error('Error transferring students:', error);
      return {
        statusCode: 500,
        message: 'Error transferring students',
      };
    });
};

export const getStudentsByLevel = (level: string) => {
  return getFetcher(`/student/get-by-level/${level}`, false);
};

export const countPendingStudentsByLevel = (level: string) => {
  return getFetcher(`/student/count-pending-by-level/${level}`, false);
};
