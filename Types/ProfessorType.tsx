export interface ProfessorData {
  id: string | number;
  professorName: string;
  totalCourses: number;
  totalStudents: number;
}

export interface StudentTransferData {
  id: number;
  selected_course_id: number;
  selected_level_id: number;
  status_level_change: string;
  description: string;
  is_group: boolean;
  created_at: string;
  updated_at: string;
  created_by_id: number;
  selected_course: {
    id: number;
    course_name: string;
  };
  selected_level: {
    id: number;
    full_level: string;
  };
  created_by: {
    id: number;
    name: string;
    email: string;
  };
  student_transfers: Array<{
    student_id: number;
    transfer_data_id: number;
    student: {
      id: number;
      cedula: string;
      status: string;
      level_id: number;
      user: {
        id: number;
        name: string;
        email: string;
      };
      level: {
        id: number;
        full_level: string;
      };
    };
  }>;
}
