import { getFetcher } from "../api";

export const getProfessorCourses = (userId: number) => {
  return getFetcher(`/professor/${userId}/courses`, false);
};
