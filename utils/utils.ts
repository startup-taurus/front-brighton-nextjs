import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  COMPONENTS_GRADEBOOK,
  ERROR_MESSAGE,
  EXAMS_TYPE,
  USER_TYPES,
  LOGIN_MESSAGES, 
  CONFLICT_TYPES,
  ConflictType,
} from "./constants";
import { NextRouter } from "next/router";
import {
  addDays,
  addWeeks,
  format,
  isBefore,
  parseISO,
  startOfWeek,
  setHours,
  setMinutes,
  setSeconds,
  isSameDay,
} from "date-fns";
import {
  ComponentsGradebook,
  GradingItem,
  GradingPercentage,
} from "../Types/GradingItem";
import Swal from "sweetalert2";
import { Role } from "./Constant";
import { CalendarEvent, Course } from "Types/CalendarTypes";

export const isBrowser = () => typeof window !== "undefined";

export const handleError = (
  e: any,
  hideError?: boolean,
  stopRedirect?: boolean
) => {
  if (e?.response?.status === 403 && isBrowser()) {
    const errorMessage = e?.response?.data?.message;
    if (
      errorMessage &&
      (errorMessage.includes(LOGIN_MESSAGES.ACCOUNT_LOCKED) ||
        errorMessage.includes(LOGIN_MESSAGES.LOCKED_DUE_TO))
    ) {
      throw e;
    }
    return e;
  }

  if (
    (e?.response?.data?.message == LOGIN_MESSAGES.NOT_AUTHORIZED_TOKEN_NOT_SENT ||
      e?.response?.status == 401) &&
    isBrowser() &&
    !stopRedirect
  ) {
    Cookies.remove("token");
    window.location.replace("/authentication/login");
  }

  const errorMessage = e?.response?.data?.message;
  if (
    errorMessage &&
    (
      errorMessage.includes(LOGIN_MESSAGES.INCORRECT_PASSWORD) ||
      errorMessage.includes(LOGIN_MESSAGES.FAILED_ATTEMPTS) ||
      errorMessage.includes(LOGIN_MESSAGES.USER_NOT_FOUND) ||
      errorMessage.includes(LOGIN_MESSAGES.ACCOUNT_LOCKED) ||
      errorMessage.includes(LOGIN_MESSAGES.LOCKED_DUE_TO)
    )
  ) {
    throw e;
  }

  if (!hideError) {
    toast.error(e?.response?.data?.message ?? ERROR_MESSAGE);
  }
  return e;
};

export const getToken = () => Cookies.get("token");

export const setQueryStringValue = (
  key: string,
  value: string | number,
  router: NextRouter
) => {
  const query = { ...router.query, [key]: value };

  router.push(
    {
      pathname: router.pathname,
      query,
    },
    undefined,
    { shallow: true }
  );
};

export const getFiltersString = (router: NextRouter) => {
  return Object.entries(router.query)
    .filter(([, value]) => value && value !== "all")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join("&");
};

export const getSimpleFiltersString = (filters: Object) => {
  return Object.entries(filters)
    .filter(([, value]) => value && value !== "all")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`
    )
    .join("&");
};

export const cleanAndFormatQuery = (values: any) => {
  return Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => value && value !== "all")
      .map((item) => item)
  );
};

export const clearQueryString = (router: NextRouter) => {
  router.push(
    {
      pathname: router.pathname,
    },
    undefined,
    { shallow: true }
  );
};

export const handleChangeFilter = (
  key: string,
  value: string | number,
  router: NextRouter
) => {
  setQueryStringValue(key, value, router);
};

export const textEllipsis = (
  str: string,
  maxLength: number,
  { side = "end", ellipsis = "..." } = {}
) => {
  if (str?.length > maxLength) {
    switch (side) {
      case "start":
        return ellipsis + str.slice(-(maxLength - ellipsis.length));
      case "end":
      default:
        return str.slice(0, maxLength - ellipsis.length) + ellipsis;
    }
  }
  return str;
};

const getDayNumber = (dayName: string) => {
  const days = [
    "Sunday",
    "Monday",
    "Tuesday",
    "Wednesday",
    "Thursday",
    "Friday",
    "Saturday",
  ];
  return days.indexOf(dayName);
};

export const getDayOfClassesOfWeek = (courses: any): any[] => {
  const today = new Date();
  const weekStart = startOfWeek(today, { weekStartsOn: 0 });
  const formattedCourse = courses.map((course: any) => {
    return course?.schedule?.map((item: any, idx: number) => {
      const dayNumber = getDayNumber(item.day);
      const date = addDays(weekStart, dayNumber);
      const startBound = course?.start_date
        ? new Date(typeof course.start_date === 'string' ? `${course.start_date}T00:00:00` : course.start_date)
        : null;
      const endBound = course?.end_date
        ? new Date(typeof course.end_date === 'string' ? `${course.end_date}T00:00:00` : course.end_date)
        : null;
      if (startBound && date < startBound) return null;
      if (endBound && date > endBound) return null;
      const startDateTime = `${format(date, 'yyyy-MM-dd')}T${item.startTime}:00`;
      const endDateTime = `${format(date, 'yyyy-MM-dd')}T${item.endTime}:00`;
      return {
        id: idx,
        title: course?.course_number,
        start: startDateTime,
        end: endDateTime,
        url: `course/${course.course_id}/home`,
      };
    }).filter(Boolean);
  });

  return formattedCourse.flat().map((event: any, index: number) => ({
    ...event,
    id: index,
  }));
};

export const getAllCourseDays = (
  startDate: any,
  endDate: any,
  schedule: any
) => {
  let currentDate = new Date(startDate);
  let daysOfClasses: any = [];
  while (isBefore(currentDate, new Date(endDate))) {
    schedule.forEach((weekDay: any) =>
      daysOfClasses.push(
        format(
          getDateByDateAndDayName(currentDate, weekDay.day),
          "EEE, MMM d, yy"
        )
      )
    );
    currentDate = addWeeks(currentDate, 1);
  }
  daysOfClasses.push(format(new Date(endDate), "EEE, MMM d, yy"));
  return daysOfClasses;
};
const getDateByDateAndDayName = (date: Date, day: string): Date => {
  const dayNumber = getDayNumber(day);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  return addDays(weekStart, dayNumber);
};

export const initializeAttendanceStructure = (
  courseSchedule: any,
  students: any,
  attendanceDate: any
) => {
  courseSchedule?.forEach((courseScheduleItem: any) => {
    attendanceDate[courseScheduleItem.id] = {};
    students?.forEach((student: any) => {
      attendanceDate[courseScheduleItem.id][student.id] = "";
    });
  });
};

export const formatDate = (date: string): string =>
  format(parseISO(date), "EEE, MMM d");

export const formatDateLocale = (date: string | Date, locale = 'en-US') => {
  if (!date) return '';
  const d = typeof date === 'string'
    ? new Date(date.includes('T') ? date : `${date}T00:00:00`)
    : date;
  if (isNaN(d.getTime())) return '';
  return d.toLocaleDateString(locale);
};

export const buildAttendanceStructure = (
  courseSchedule: any,
  students: any,
  studentsAttendance: any
) => {
  let attendanceDate: any = {};
  initializeAttendanceStructure(courseSchedule, students, attendanceDate);

  studentsAttendance?.forEach((studentAttendance: any) => {
    if (attendanceDate[studentAttendance?.id]) {
      attendanceDate[studentAttendance?.course_schedule_id]![
        studentAttendance?.student_id
      ] = studentAttendance?.status;
    }
  });

  return attendanceDate;
};

export const formatGradebookComponents = (data: any = []) => {
  const assignments = data.filter(
    (item: any) => item.category === COMPONENTS_GRADEBOOK.ASSIGNMENTS
  );

  const progressTest = data.filter(
    (item: any) => item.category === COMPONENTS_GRADEBOOK.PROGRESS_TESTS
  );

  const moversExam = data.filter(
    (item: any) => item.category === COMPONENTS_GRADEBOOK.MOVERS_EXAM
  );

  return {
    assignments: assignments,
    progressTest: progressTest,
    moversExam: moversExam,
  };
};

export const formatScheduleLinear = (schedules: any) =>
  schedules?.map((s: any) => `${s.days.join('-')} ${s.startTime}-${s.endTime}`).join(', ') || '';

export const dateRangesOverlap = (
  aStart: Date,
  aEnd: Date | null,
  bStart: Date,
  bEnd: Date | null
) => {
  const aEndTime = aEnd ? aEnd.getTime() : Infinity;
  const bEndTime = bEnd ? bEnd.getTime() : Infinity;
  return aStart.getTime() <= bEndTime && bStart.getTime() <= aEndTime;
};

export const scanScheduleConflicts = (
  list: any[],
  type: ConflictType,
  newDays: string,
  newTime: string,
  startEffective: Date,
  newEndDate: Date | null,
  newSchedule: string
): { hasConflict: boolean; type?: ConflictType; message?: string } => {
  for (const existing of list) {
    const [existingDays, existingTime] = existing.schedule.split(' ');
    const existingStartDate = new Date(existing.start_date);
    const finalEndDate = existing.last_class_date ? new Date(existing.last_class_date) : (existing.end_date ? new Date(existing.end_date) : null);
    if (finalEndDate && startEffective.getTime() > finalEndDate.getTime()) continue;
    const commonDays = existingDays.split('-').some((d: string) => newDays.split('-').includes(d));
    if (!commonDays) continue;
    if (!dateRangesOverlap(existingStartDate, finalEndDate, startEffective, newEndDate)) continue;
    const [existingStart, existingEnd] = existingTime.split('-');
    const [newStart, newEnd] = newTime.split('-');
    const timesOverlap = new Date(`2000-01-01T${newStart}:00`) < new Date(`2000-01-01T${existingEnd}:00`) &&
      new Date(`2000-01-01T${newEnd}:00`) > new Date(`2000-01-01T${existingStart}:00`);
    if (timesOverlap) {
      const exactMatch = existingDays === newDays && existingTime === newTime;
      return {
        hasConflict: true,
        type,
        message: exactMatch
          ? (type === CONFLICT_TYPES.CLASSROOM
              ? `This classroom ("${existing.classroom}") already has a course at the same schedule.<br>Existing: ${existing.course_name} (${existing.course_number}) — ${existing.schedule}<br>New: ${newSchedule}`
              : `This professor already has a course at the same schedule.<br>Existing: ${existing.course_name} (${existing.course_number}) — ${existing.schedule}<br>New: ${newSchedule}`)
          : (type === CONFLICT_TYPES.CLASSROOM
              ? `Classroom conflict: "${existing.classroom}" is already booked by "${existing.course_name}" (${existing.course_number}).<br>Existing: ${existing.schedule}<br>New: ${newSchedule}`
              : `Schedule conflict with "${existing.course_name}" (${existing.course_number}).<br>Existing: ${existing.schedule}<br>New: ${newSchedule}`)
      };
    }
  }
  return { hasConflict: false };
};

export const initializeGradebookStructure = (
  courseGrading: any,
  students: any,
  studentsGrades: any
) => {
  courseGrading?.forEach((courseGradingItem: any) => {
    studentsGrades[courseGradingItem.item_id] = {};
    students?.forEach((student: any) => {
      studentsGrades[courseGradingItem.item_id][student.id] = "";
    });
  });
};

export const buildGradebookStructure = (
  courseGrading: any,
  students: any,
  studentsGrades: any
) => {
  let gradingNotes: any = {};
  initializeGradebookStructure(courseGrading, students, gradingNotes);

  studentsGrades?.forEach((studentGrade: any) => {
    if (gradingNotes[studentGrade?.grading_item_id]) {
      gradingNotes[studentGrade?.grading_item_id]![studentGrade?.student_id] =
        studentGrade?.grade;
    }
  });

  return gradingNotes;
};

export const calculateRelativePercentage = (percentage: string) => {
  return Number(percentage) * 0.01;
};

export const calculateAverage = (
  grades: any[],
  notes: GradingItem[],
  studentId: string
) => {
  let sumResult = 0;
  let totalExpected = notes.length * 100;
  let averageResult = "0";

  notes.map((note) => {
    sumResult += !!grades[note.item_id][studentId]
      ? Number(grades[note.item_id][studentId])
      : 0;
  });

  averageResult = (sumResult / totalExpected * 100).toFixed(2) ?? 0;

  return averageResult;
};

export const calculateTotalAverage = (
  grades: any[],
  notes: ComponentsGradebook,
  studentId: string,
  gradingPercentages: GradingPercentage
) => {
  let result = 0;
  const assignments = calculateAverage(grades, notes.assignments, studentId);
  const progressTest = calculateAverage(grades, notes.progressTest, studentId);
  const moversExam = calculateAverage(grades, notes.moversExam, studentId);

  const totalPercentage = 
    Number(gradingPercentages.assig_percentage) +
    Number(gradingPercentages.test_percentage) +
    Number(gradingPercentages.exam_percentage);

  result =
    Number(assignments) *
      (Number(gradingPercentages.assig_percentage) / totalPercentage) +
    Number(progressTest) *
      (Number(gradingPercentages.test_percentage) / totalPercentage) +
    Number(moversExam) *
      (Number(gradingPercentages.exam_percentage) / totalPercentage);

  return Number(result).toFixed(2);
};

export const calculateClassTotalAverage = (
  grades: any[],
  componentsGradebook: any,
  gradingPercentages: GradingPercentage,
  students: any[]
) => {
  const gradesTotalSum = students?.reduce((acc, student) => {
    const totalAverage = calculateTotalAverage(
      grades,
      componentsGradebook,
      student.id,
      gradingPercentages
    );

    return acc + Number(totalAverage);
  }, 0);
  const totalClassAverage = gradesTotalSum / students.length;
  return !!totalClassAverage ? Number(totalClassAverage).toFixed(2) : "0";
};

export const calculateGrade = (score: number, notesPercentages: any[] = []) => {
  const percentage = Number(score) || 0;

  const gradingStatus = notesPercentages?.find((notePercentage: any) => {
    return (
      percentage >= Number(notePercentage.min) &&
      percentage <= Number(notePercentage.max)
    );
  });

  return gradingStatus?.name || "NOT REPORTED";
};

export const calculateFinalGradingStatus = (
  notesPercentages: any[],
  studentAverage: string | number
) => {
  const average = Number(studentAverage) || 0;
  return calculateGrade(average, notesPercentages);
};

export const determineResult = (totalAverage: number) => {
  if (totalAverage > 70) {
    return {
      resultClass: "result-pass",
      result: "PASS",
    };
  } else {
    return {
      resultClass: "result-failed",
      result: "FAIL",
    };
  }
};

export const formatStudentScoreAssignmentsGrades = (
  scoreGrades: any,
  courseLevel: string
): any[] => {
  const assignmentsScore = determineResult(scoreGrades?.assignments);
  const progressTestScore = determineResult(scoreGrades?.progressTest);

  return [
    {
      id: 1,
      criterion: COMPONENTS_GRADEBOOK.ASSIGNMENTS,
      level: courseLevel,
      score: scoreGrades?.assignments,
      grade: assignmentsScore?.result,
    },
    {
      id: 2,
      criterion: COMPONENTS_GRADEBOOK.PROGRESS_TESTS,
      level: courseLevel,
      score: scoreGrades?.progressTest,
      grade: progressTestScore?.result,
    },
  ];
};

export const formatStudentScoreExamGrades = (
  moversExamScore: any[] = [],
  courseLevel: string,
  studentId: string,
  grades: any,
  notesPercentages: any,
  examType?: string
) => {
  return moversExamScore?.map((moverExamScore, index) => {
    const rawScore = grades[moverExamScore.item_id][studentId];
    const score = rawScore ? Number(rawScore).toFixed(2) : "0.00";
    const grade = calculateGrade(Number(rawScore), notesPercentages);

    return {
      id: index,
      criterion: moverExamScore.item_name,
      level: examType || moverExamScore?.category,
      examType: examType,
      score,
      grade,
    };
  });
};

export const calculateAssignmentAverage = (
  scoreGrades: any,
  gradingPercentage: GradingPercentage
) => {
  let totalPercentage = 0;
  let average = 0;

  totalPercentage =
    Number(gradingPercentage.assig_percentage) +
    Number(gradingPercentage.test_percentage);

  average =
    scoreGrades.assignments *
      (Number(gradingPercentage.assig_percentage) / totalPercentage) +
    scoreGrades.progressTest *
      (Number(gradingPercentage.test_percentage) / totalPercentage);

  return Number(average).toFixed(2);
};

export const calculateStudentAverage = (
  scoreGrades: any,
  gradingPercentage: GradingPercentage
) => {
  let totalPercentage = 0;
  let average = 0;

  totalPercentage =
    Number(gradingPercentage.assig_percentage) +
    Number(gradingPercentage.test_percentage) +
    Number(gradingPercentage.exam_percentage);

  average =
    scoreGrades.assignments *
      (Number(gradingPercentage.assig_percentage) / totalPercentage) +
    scoreGrades.progressTest *
      (Number(gradingPercentage.test_percentage) / totalPercentage) +
    scoreGrades.moversExam *
      (Number(gradingPercentage.exam_percentage) / totalPercentage);

  return Number(average).toFixed(2);
};

export const calculateReportExamAverage = (
  moversExamScore: any[] = [],
  grades: any,
  studentId: string
) => {
  let moverExamSum = 0;
  let moversExamProm = 0;

  moverExamSum = moversExamScore.reduce((acc, moverExamScore) => {
    return acc + Number(grades[moverExamScore.item_id][studentId]);
  }, 0);

  moversExamProm = (moverExamSum / moversExamScore.length) * 1;

  return Number(moversExamProm).toFixed(2);
};

export const formatReportBarChartData = (
  moversExamScore: any[] = [],
  grades: any,
  studentId: string
) => {
  let labels: string[] = [];
  let data: number[] = [];

  moversExamScore.forEach((item) => {
    labels.push(item.item_name);
    const value = Number(grades[item.item_id][studentId]) * 1;
    data.push(Number(value.toFixed(2)));
  }, 0);

  return {
    labels,
    datasets: [
      {
        label: "SKILLS",
        backgroundColor: "rgba(255, 167 ,0, 1)",
        highlightFill: "rgba(255, 151 , 0, 1)",
        borderWidth: 2,
        data,
      },
    ],
  };
};

/**
 * Obtiene el siguiente nivel en la secuencia de progresión basado en el nivel actual
 * @param currentLevel - El nivel actual del estudiante (puede ser el nombre completo o abreviado)
 * @param isKid - Indica si el estudiante es niño o adulto
 * @returns El objeto con el siguiente nivel o null si no se encuentra
 */
export const getNextLevelFromProgression = (
  currentLevel: string,
  isKid: boolean = false
) => {
  const {
    ADULT_LEVEL_PROGRESSION,
    KIDS_LEVEL_PROGRESSION,
  } = require("./levelProgression");

  const progression = isKid ? KIDS_LEVEL_PROGRESSION : ADULT_LEVEL_PROGRESSION;

  const upperCurrentLevel = currentLevel.toUpperCase();

  let currentIndex = -1;

  currentIndex = progression.findIndex(
    (level: { full_level: string; short_level: string }) =>
      level.full_level.toUpperCase() === upperCurrentLevel ||
      level.short_level.toUpperCase() === upperCurrentLevel
  );

  if (currentIndex === -1) {
    currentIndex = progression.findIndex(
      (level: { full_level: string; short_level: string }) =>
        level.full_level.toUpperCase() === upperCurrentLevel ||
        level.short_level.toUpperCase() === upperCurrentLevel
    );
  }

  if (currentIndex === -1 || currentIndex === progression.length - 1) {
    return null;
  }

  return progression[currentIndex + 1];
};

export const getKidsLevelById = (levelId: string) => {
  const kidsLevelMapping: Record<string, string> = {
    "7": "Pre-A1 Starter",
    "8": "A1.1 Movers",
    "12": "A1.2 Movers",
    "13": "A2.1 Flyers",
    "9": "A2.2 Flyers",
    "10": "B1.1 Preintermediate",
    "11": "B1.2 Pre-Intermediate",
    "14": "Private Classes",
  };

  return kidsLevelMapping[levelId];
};

export const getAdultLevelById = (levelId: string) => {
  const adultLevelMapping: Record<string, string> = {
    "1": "A1 Beginner",
    "2": "A2 Elementary",
    "3": "B1 Pre-Intermediate",
    "4": "B1+ Intermediate",
    "5": "B2 Upper Intermediate",
    "6": "B2 First Preparation",
    "7": "Pre-A1 Starter",
    "14": "Private Classes",
  };

  return adultLevelMapping[levelId];
};

export const countAttendance = (dates: any = {}, studentId: any) => {
  const datesValues = Object.values(dates);
  let attendanceAverage = 0;
  const attendanceTotal = datesValues.reduce((acc: number, attendance: any) => {
    if (
      attendance[studentId] === "present" ||
      attendance[studentId] === "recovered"
    )
      return acc + 1;
    if (attendance[studentId] === "late") return acc + 0.5;
    return acc;
  }, 0);

  attendanceAverage = (attendanceTotal / datesValues.length) * 100;

  return {
    attendanceCount: attendanceTotal,
    attendancePercentage: Number(Number(attendanceAverage).toFixed(2)),
  };
};

export const countAbsences = (dates: any = {}, studentId: any) => {
  const datesValues = Object.values(dates);
  let attendanceAverage = 0;
  const attendanceTotal = datesValues.reduce((acc: number, attendance: any) => {
    if (attendance[studentId] === "absent") return acc + 1;
    if (attendance[studentId] === "late") return acc + 0.5;
    return acc;
  }, 0);

  attendanceAverage = (attendanceTotal / datesValues.length) * 100;

  return {
    attendanceCount: attendanceTotal,
    attendancePercentage: Number(Number(attendanceAverage).toFixed(2)),
  };
};

export const getColorOfAssistance = (value: any) => {
  const percentage = Number(value);
  if (percentage >= 12 && percentage < 20) {
    return "warning-field";
  }
  if (percentage >= 20) {
    return "danger-field";
  }

  return "";
};

export const formatExamParams = (result: any[], examType: string) => {
  const normalizedExamType = examType.replace(".", "");
  const fourModuleExams = ["PRELIM", "FIRST"];
  const threeModuleExams = ["STARTERS", "MOVERS", "FLYERS", "KEY"];

  const values = result?.map((exam) => {
    const criterion = exam.criterion?.toLowerCase();

    if (threeModuleExams.includes(normalizedExamType)) {
      if (criterion.includes("reading") && criterion.includes("writing")) {
        return {
          readingWriting: `${exam?.score ? exam?.score : 0.0}%`,
          readingWritingStatus: `${exam.grade}`,
        };
      } else if (criterion.includes("listening")) {
        return {
          listeningYLE: `${exam?.score ? exam?.score : 0.0}%`,
          listeningYLEStatus: `${exam.grade}`,
        };
      } else if (criterion.includes("speaking")) {
        return {
          speakingYLE: `${exam?.score ? exam?.score : 0.0}%`,
          speakingYLEStatus: `${exam.grade}`,
        };
      }
    } else if (fourModuleExams.includes(normalizedExamType)) {
      if (criterion.includes("reading") && !criterion.includes("writing")) {
        return {
          reading: `${exam?.score ? exam?.score : 0.0}%`,
          readingStatus: `${exam.grade}`,
        };
      } else if (
        criterion.includes("writing") &&
        !criterion.includes("reading")
      ) {
        return {
          writing: `${exam?.score ? exam?.score : 0.0}%`,
          writingStatus: `${exam.grade}`,
        };
      } else if (criterion.includes("listening")) {
        return {
          listening: `${exam?.score ? exam?.score : 0.0}%`,
          listeningStatus: `${exam.grade}`,
        };
      } else if (criterion.includes("speaking")) {
        return {
          speaking: `${exam?.score ? exam?.score : 0.0}%`,
          speakingStatus: `${exam.grade}`,
        };
      }
    }

    return {};
  });

  return Object.assign({}, ...values);
};
export const getExamType = (level: string, ageGroup: string) => {
  const levelUpper = level.toUpperCase();

  if (levelUpper.includes("PRE-A1") || levelUpper.includes("STARTER")) {
    return EXAMS_TYPE.STARTERS;
  }
  if (levelUpper.includes("A1") && !levelUpper.includes("A2")) {
    return EXAMS_TYPE.MOVERS;
  }
  if (levelUpper.includes("A2")) {
    const isAdult = ageGroup && ageGroup.toLowerCase().includes("adult");
    return isAdult ? EXAMS_TYPE.KEY : EXAMS_TYPE.FLYERS;
  }
  if (levelUpper.includes("B1")) {
    return EXAMS_TYPE.PRELIM;
  }
  if (levelUpper.includes("B2")) {
    return EXAMS_TYPE.FIRST;
  }

  console.warn(
    `No exam type match found for level: ${level}, ageGroup: ${ageGroup}`
  );
  const isAdult = ageGroup && ageGroup.toLowerCase().includes("adult");
  return isAdult ? EXAMS_TYPE.KEY : EXAMS_TYPE.FLYERS;
};
export const getExamTypeByLevelId = (levelId: number): string => {
  const LEVEL_TO_EXAM_TYPE: Record<string, string> = {
    level_1: EXAMS_TYPE.MOVERS,
    level_2: EXAMS_TYPE.KEY,
    level_3: EXAMS_TYPE.PRELIM,
    level_4: EXAMS_TYPE.PRELIM,
    level_5: EXAMS_TYPE.FIRST,
    level_6: EXAMS_TYPE.FIRST,
    level_7: EXAMS_TYPE.STARTERS,
    level_8: EXAMS_TYPE.MOVERS,
    level_9: EXAMS_TYPE.FLYERS,
    level_10: EXAMS_TYPE.PRELIM,
    level_11: EXAMS_TYPE.PRELIM,
    level_12: EXAMS_TYPE.MOVERS,
    level_13: EXAMS_TYPE.FLYERS,
    level_14: EXAMS_TYPE.PRELIM,
  };

  return LEVEL_TO_EXAM_TYPE[`level_${levelId}`] || EXAMS_TYPE.PRELIM;
};

export const getExamConfiguration = () => {
  const threeModuleExams = ["READING & WRITING", "LISTENING", "SPEAKING"];
  const fourModuleExams = ["READING", "LISTENING", "WRITING", "SPEAKING"];

  return {
    [EXAMS_TYPE.STARTERS]: {
      examType: EXAMS_TYPE.STARTERS,
      modules: threeModuleExams,
    },
    [EXAMS_TYPE.MOVERS]: {
      examType: EXAMS_TYPE.MOVERS,
      modules: threeModuleExams,
    },
    [EXAMS_TYPE.FLYERS]: {
      examType: EXAMS_TYPE.FLYERS,
      modules: threeModuleExams,
    },
    [EXAMS_TYPE.KEY]: { examType: EXAMS_TYPE.KEY, modules: threeModuleExams },
    [EXAMS_TYPE.PRELIM]: {
      examType: EXAMS_TYPE.PRELIM,
      modules: fourModuleExams,
    },
    [EXAMS_TYPE.FIRST]: {
      examType: EXAMS_TYPE.FIRST,
      modules: fourModuleExams,
    },
  };
};

export const getModulesByExamType = (examType: string): string[] => {
  const examConfig = getExamConfiguration();
  return examConfig[examType]?.modules || [];
};
export const getPrincipalRoute = (role: string): string => {
  switch (role) {
    case USER_TYPES.ADMIN:
    case USER_TYPES.FINANCIAL:
    case USER_TYPES.RECEPTIONIST:
    case USER_TYPES.COORDINATOR:
      return "/dashboard";
    case USER_TYPES.PROFESSOR:
      return "/teachers";
    default:
      return "/authentication/login";
  }
};

export const generateCalendarEvents = (courses: Course[]): CalendarEvent[] => {
  const events: CalendarEvent[] = [];

  courses.forEach((course) => {
    const startDate = parseISO(course.start_date);
    const endDate = parseISO(course.end_date);
    const [startHour, startMinute] = course.start_time.split(':').map(Number);
    const [endHour, endMinute] = course.end_time.split(':').map(Number);

    let currentDate = startDate;
    let eventCount = 0;
    
    while (isBefore(currentDate, endDate) || isSameDay(currentDate, endDate)) {
      const dayOfWeek = format(currentDate, 'EEEE');
      
      const dayMatches = course.schedule_days.some(day => 
        day.toLowerCase() === dayOfWeek.toLowerCase()
      );
      
      if (dayMatches) {
        const eventStart = setSeconds(
          setMinutes(
            setHours(currentDate, startHour),
            startMinute
          ),
          0
        );
        
        const eventEnd = setSeconds(
          setMinutes(
            setHours(currentDate, endHour),
            endMinute
          ),
          0
        );

        
        events.push({
          id: `${course.id}-${format(currentDate, 'yyyy-MM-dd')}`,
          title: `${course.course_number}`,
          start: eventStart,
          end: eventEnd,
          resource: {
            course,
            level: course.level_name,
          },
        });
        
        eventCount++;
      }
      
      currentDate = addDays(currentDate, 1);
      
      if (eventCount > 1000) {
        break;
      }
    }
  });

  return events;
};

export const formatEventTime = (date: Date | null | undefined): string => {
  return date?.toLocaleTimeString('es-ES', { 
    hour: '2-digit', 
    minute: '2-digit' 
  }) || '';
};

export const validateEmailFormat = (email: string): { isValid: boolean; message?: string } => {
  if (!email) {
    return { isValid: false, message: 'Email is required' };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { isValid: false, message: 'Email must contain @ and . in the correct format (e.g., user@domain.com)' };
  }

  if (email.includes('@@@') || email.includes('...')) {
    return { isValid: false, message: 'Invalid email format' };
  }

  return { isValid: true };
};

export const formatEmailInput = (email: string): string => {
  return email.trim();
};

export const validateAndFormatEmail = (email: string) => {
  const formattedEmail = formatEmailInput(email);
  const validation = validateEmailFormat(formattedEmail);
  
  return {
    formattedEmail,
    ...validation
  };
};

export const formatUsernameWithBrighton = (username: string): string => {
  const trimmedUsername = username.trim();
  
  if (!trimmedUsername) {
    return '';
  }
  
  const brightonSuffix = 'Brighton';
  const lowerUsername = trimmedUsername.toLowerCase();
  const lowerBrighton = brightonSuffix.toLowerCase();
  
  if (lowerUsername.endsWith(lowerBrighton)) {
    return trimmedUsername;
  }
  
  return trimmedUsername + brightonSuffix;
};

export const validateAndFormatUsername = (username: string) => {
  const formattedUsername = formatUsernameWithBrighton(username);
  
  return {
    formattedUsername,
    isValid: formattedUsername.length > 0,
    message: formattedUsername.length === 0 ? 'Username is required' : ''
  };
};
