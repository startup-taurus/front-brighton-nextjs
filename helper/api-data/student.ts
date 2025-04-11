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

export const requestTransferAndProgress = (
  studentIds: number[],
  courseId: string | null,
  levelId: string | null
) => {
  // Validar que al menos uno de los parámetros sea proporcionado
  if (!courseId && !levelId) {
    return Promise.reject({
      statusCode: 400,
      message:
        'Please provide either a course or a level to transfer students.',
    });
  }

  return postFetcher('/student/request-transfer', {
    studentIds,
    courseId,
    levelId,
  })
    .then((response) => {
      return response;
    })
    .catch((error) => {
      console.error('Error requesting transfer for students:', error);
      return {
        statusCode: 500,
        message: 'Error requesting transfer for students',
      };
    });
};

export const transferAndProgressStudents = (
  studentIds: number[],
  courseId: string | null,
  levelId: string | null
) => {
  // Validar que al menos uno de los parámetros sea proporcionado
  if (!courseId && !levelId) {
    return Promise.reject({
      statusCode: 400,
      message:
        'Please provide either a course or a level to transfer students.',
    });
  }

  return postFetcher('/student/transfer-and-progress', {
    studentIds,
    courseId,
    levelId,
  })
    .then((response) => {
      return response; // Devuelve la respuesta exitosa
    })
    .catch((error) => {
      console.error('Error transferring or progressing students:', error);
      return {
        statusCode: 500,
        message: 'Error transferring or progressing students',
      };
    });
};

export const getStudentsByLevel = (level: string) => {
  return getFetcher(`/student/get-by-level/${level}`, false);
};

export const countPendingStudentsByLevel = (level: string) => {
  return getFetcher(`/student/count-pending-by-level/${level}`, false);
};

export const getStudentTransfers = (studentId: number) => {
  return getFetcher(`/student-transfer-data/student/${studentId}`, false);
};

export const getPendingStudentTransfers = () => {
  return getFetcher(`/student-transfer-data/pending`, false);
};
