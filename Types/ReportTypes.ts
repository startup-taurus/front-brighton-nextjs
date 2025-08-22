export interface ReportEntry {
  id: number;
  lesson_date: string;
  lesson_status: string;
  hours: number;
  topic: string;
}

export interface NewEntry {
  date: string;
  status: string;
  hours: number;
  topic: string;
}

export interface EditData {
  lesson_status?: string;
  hours?: number;
  topic?: string;
}

export interface AbsenceReportData {
  course_code: string;
  course_name: string;
  student_name: string;
  consecutive_absences: number;
}