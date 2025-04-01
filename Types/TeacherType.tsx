export interface Teacher {
  id: number;
  name: string;
  image: string;
  role: string;
  students: number;
  courses: number;
  user?: {
    id: number;
  };
}

export interface TeacherCardProps {
  teacher: Teacher;
}
