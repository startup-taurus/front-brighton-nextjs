import { COURSE_TYPES, PRIVATE_COURSE_TYPES } from './constants';

export const getClassroomLabel = (row: any) => {
  const type = String(row?.course_type || '').toLowerCase();
  if (type === COURSE_TYPES.ONLINE) return COURSE_TYPES.ONLINE;
  if (type === PRIVATE_COURSE_TYPES.PRIVATE) return PRIVATE_COURSE_TYPES.PRIVATE;
  if (type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) return PRIVATE_COURSE_TYPES.PRIVATE_ONLINE;
  const classroom = String(row?.classroom || '');
  return classroom ? classroom.toUpperCase() : '';
};
