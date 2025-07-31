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
  start_date: string;
  end_date: string;
  schedule_days: string[];
  start_time: string;
  end_time: string;
  professor_name: string;
  level_name: string;
}