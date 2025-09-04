import Cookies from "js-cookie";
import { toast } from "react-toastify";
import {
  COMPONENTS_GRADEBOOK,
  ERROR_MESSAGE,
  EXAMS_TYPE,
  USER_TYPES,
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
    Swal.fire({
      title: "Access Denied",
      text: "You don't have access to this section.",
      icon: "error",
      confirmButtonText: "OK",
    }).then(() => {
      window.location.href = "/teachers";
    });
    return e;
  }

  if (
    (e?.response?.data?.message == "Not authorized, token not sent" ||
      e?.response?.status == 401) &&
    isBrowser() &&
    !stopRedirect
  ) {
    Cookies.remove("token");
    window.location.replace("/authentication/login");
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
    return course?.schedule?.map((item: any, index: number) => {
      const dayNumber = getDayNumber(item.day);
      const date = addDays(weekStart, dayNumber);
      const startDateTime = `${format(date, "yyyy-MM-dd")}T${item.startTime}:00`;
      const endDateTime = `${format(date, "yyyy-MM-dd")}T${item.endTime}:00`;

      return {
        id: index,
        title: course?.course_name,
        start: startDateTime,
        end: endDateTime,
        url: `course/${course.course_id}/home`,
      };
    });
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

const getDateByDateAndDayName = (date: any, day: string) => {
  const dayNumber = getDayNumber(day);
  const weekStart = startOfWeek(date, { weekStartsOn: 0 });
  return addDays(weekStart, dayNumber);
};

export const formatDate = (date: string): string =>
  format(parseISO(date), "EEE, MMM d");

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
    attendanceCount: Math.floor(attendanceTotal),
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
    attendanceCount: Math.floor(attendanceTotal),
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

export const formatReportUrl = ({
  student,
  ageGroup,
  level,
  assignments,
  assignmentsTotal,
  assignmentsStatus,
  tests,
  testsStatus,
  exam,
  reading = "0.00%",
  readingStatus = "NOT REPORTED",
  listening = "0.00%",
  listeningStatus = "NOT REPORTED",
  writing = "0.00%",
  writingStatus = "NOT REPORTED",
  speaking = "0.00%",
  speakingStatus = "NOT REPORTED",
  generalExamsTotal,
  readingWriting = "0.00%",
  readingWritingStatus = "NOT REPORTED",
  listeningYLE = "0.00%",
  listeningYLEStatus = "NOT REPORTED",
  speakingYLE = "0.00%",
  speakingYLEStatus = "NOT REPORTED",
  yleTotal,
  gpa,
  final,
}: any) => {
  const baseUrl = new URL(
    "https://chiispiitas.github.io/Brighton/Certificate%20Generator/index.html"
  );

  baseUrl.searchParams.append("student", student.toUpperCase());
  baseUrl.searchParams.append(
    "program",
    ageGroup === "adult" ? "General English" : "Young Learners"
  );
  baseUrl.searchParams.append("level", level);
  baseUrl.searchParams.append("short-level", level?.split(" ")[0]);
  baseUrl.searchParams.append("assignments", assignments);
  baseUrl.searchParams.append("assignments-total", assignmentsTotal);
  baseUrl.searchParams.append("assignments-status", assignmentsStatus);
  baseUrl.searchParams.append("tests", tests);
  baseUrl.searchParams.append("tests-status", testsStatus);
  baseUrl.searchParams.append("exam", exam);
  baseUrl.searchParams.append("gpa", gpa);
  baseUrl.searchParams.append("final", final);
  baseUrl.searchParams.append("password", "Brighton1234@");

  const normalizedExam = exam.replace(".", "");
  const fourModuleExams = ["PRELIM", "FIRST"];
  const threeModuleExams = ["STARTERS", "MOVERS", "FLYERS", "KEY"];

  if (fourModuleExams.includes(normalizedExam)) {
    baseUrl.searchParams.append("reading", reading);
    baseUrl.searchParams.append("reading-status", readingStatus);
    baseUrl.searchParams.append("listening", listening);
    baseUrl.searchParams.append("listening-status", listeningStatus);
    baseUrl.searchParams.append("writing", writing);
    baseUrl.searchParams.append("writing-status", writingStatus);
    baseUrl.searchParams.append("speaking", speaking);
    baseUrl.searchParams.append("speaking-status", speakingStatus);
    baseUrl.searchParams.append("general-exams-total", generalExamsTotal);
  } else if (threeModuleExams.includes(normalizedExam)) {
    baseUrl.searchParams.append("reading-and-writing", readingWriting);
    baseUrl.searchParams.append(
      "reading-and-writing-status",
      readingWritingStatus
    );
    baseUrl.searchParams.append("listening-yle", listeningYLE);
    baseUrl.searchParams.append("listening-yle-status", listeningYLEStatus);
    baseUrl.searchParams.append("speaking-yle", speakingYLE);
    baseUrl.searchParams.append("speaking-yle-status", speakingYLEStatus);
    baseUrl.searchParams.append("yle-total", yleTotal);
  }

  return baseUrl;
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

        const professorText = course.professor_name && course.professor_name !== 'No asignado' 
        
        events.push({
          id: `${course.id}-${format(currentDate, 'yyyy-MM-dd')}`,
          title: `${course.course_name}${professorText}`,
          start: eventStart,
          end: eventEnd,
          resource: {
            course,
            level: course.level_name,
            professor: course.professor_name,
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
