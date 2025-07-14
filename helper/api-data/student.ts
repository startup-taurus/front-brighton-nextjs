import { getFetcher, postFetcher, putFetcher, deleteFetcher } from '../api';
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
  levelId: string | null,
  isGroup: boolean | false
) => {
  // In requestTransferAndProgress:
  if (!courseId && !levelId) {
    return Promise.reject({
      statusCode: 400,
      message: 'Please provide either a course or a level to transfer students.',
    });
  }

  return postFetcher('/student/request-transfer', {
    studentIds,
    courseId,
    levelId,
    isGroup,
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
  // In transferAndProgressStudents:
  if (!courseId && !levelId) {
    return Promise.reject({
      statusCode: 400,
      message: 'Please provide either a course or a level to transfer students.',
    });
  }

  return postFetcher('/student/transfer-and-progress', {
    studentIds,
    courseId,
    levelId,
  })
    .then((response) => {
      return response;
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
  return getFetcher(`/transfer-data/get-pending`, false);
};

export const deleteStudent = (studentId: number) => {
  return deleteFetcher(`/student/delete/${studentId}`);
};

export const getBestStudentsByCourse = (
  courseId?: number,
  levelId?: number,
  limit: number = 10
) => {
  let url = `/student/best-students?limit=${limit}`;
  if (courseId) url += `&course_id=${courseId}`;
  if (levelId) url += `&level_id=${levelId}`;
  return getFetcher(url, false);
};
