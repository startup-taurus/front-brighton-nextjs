export interface CalendarEvent {
  id: string;
  title: string;
  start: Date;
  end: Date;
  resource?: any;
}

export interface Course {
  id: string;
  course_name: string;
  course_number: string;
  start_date: string;
  end_date: string;
  schedule_days: string[];
  start_time: string;
  end_time: string;
  professor_name: string;
  professor_image?: string;
  student_count: number;
  level_name: string;
}

export interface CourseDetailModalProps {
  isOpen: boolean;
  toggle: () => void;
  selectedCourse: Course & { student_count?: number; professor_id?: string } | null;
}