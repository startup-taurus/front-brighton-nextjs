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

export interface StudentData {
  student: string;
  date: string;
  program: string;
  level: string;
  shortLevel: string;
  assignments: string;
  assignmentsTotal: string;
  assignmentsStatus: string;
  assignmentsIndividual?: string;
  assignmentsIndividualStatus?: string;
  progressTests?: string;
  progressTestsStatus?: string;
  exam: string;
  readingAndWriting: string;
  readingAndWritingStatus: string;
  listening: string;
  listeningStatus: string;
  speaking: string;
  speakingStatus: string;
  yleTotal: string;
  generalExamsTotal: string;
  gpa: string;
  final: string;
  listeningYLE?: string;
  speakingYLE?: string;
  listeningYLEStatus?: string;
  speakingYLEStatus?: string;
  reading?: string;
  writing?: string;
  readingStatus?: string;
  writingStatus?: string;
}