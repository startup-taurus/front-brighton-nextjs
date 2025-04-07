export interface Teacher {
  id: number;
  name: string;
  image: string;
  role: string;
  students: number;
  courses: number;
  status?: string;
  coursesList?: Array<{ code: string; name: string; schedule: string }>;
  user?: {
    id: number;
  };
}

export interface TeacherCardProps {
  teacher: Teacher;
}
