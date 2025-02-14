import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { COMPONENTS_GRADEBOOK, ERROR_MESSAGE, EXAMS_TYPE } from "./constants";
import { NextRouter } from "next/router";
import {
  addDays,
  addWeeks,
  format,
  isBefore,
  parseISO,
  startOfWeek,
} from "date-fns";
import {
  ComponentsGradebook,
  GradingItem,
  GradingPercentage,
} from "../Types/GradingItem";

export const isBrowser = () => typeof window !== "undefined";

export const handleError = (
  e: any,
  hideError?: boolean,
  stopRedirect?: boolean,
) => {
  if (
    (e?.response?.data?.message == "No autorizado, no se envió el token" ||
      e?.response?.status == 401) &&
    isBrowser() &&
    !stopRedirect
  ) {
    Cookies.remove("token");
    window.location.replace("/dashboard/login");
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
  router: NextRouter,
) => {
  const query = { ...router.query, [key]: value };

  router.push(
    {
      pathname: router.pathname,
      query,
    },
    undefined,
    { shallow: true },
  );
};

// export const getFiltersString = (
//   filters: Array<{ key: string; value: string }>,
// ) => {
//   return filters
//     .reduce(
//       (prev, current) =>
//         current.value !== "all"
//           ? prev.concat(`${current.key}=${current.value}&`)
//           : prev,
//       "",
//     )
//     .slice(0, -1);
// };

export const getFiltersString = (router: NextRouter) => {
  return Object.entries(router.query)
    .filter(([, value]) => value && value !== "all")
    .map(
      ([key, value]) =>
        `${encodeURIComponent(key)}=${encodeURIComponent(value as string)}`,
    )
    .join("&");
};

export const cleanAndFormatQuery = (values: any) => {
  return Object.fromEntries(
    Object.entries(values)
      .filter(([, value]) => value && value !== "all")
      .map((item) => item),
  );
};

export const clearQueryString = (router: NextRouter) => {
  router.push(
    {
      pathname: router.pathname,
    },
    undefined,
    { shallow: true },
  );
};

export const handleChangeFilter = (
  key: string,
  value: string | number,
  router: NextRouter,
) => {
  setQueryStringValue(key, value, router);
};

export const textEllipsis = (
  str: string,
  maxLength: number,
  { side = "end", ellipsis = "..." } = {},
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
  schedule: any,
) => {
  let currentDate = new Date(startDate);
  let daysOfClasses: any = [];
  while (isBefore(currentDate, new Date(endDate))) {
    schedule.forEach((weekDay: any) =>
      daysOfClasses.push(
        format(
          getDateByDateAndDayName(currentDate, weekDay.day),
          "EEE, MMM d, yy",
        ),
      ),
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
  attendanceDate: any,
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
  studentsAttendance: any,
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
    (item: any) => item.category === COMPONENTS_GRADEBOOK.ASSIGNMENTS,
  );

  const progressTest = data.filter(
    (item: any) => item.category === COMPONENTS_GRADEBOOK.PROGRESS_TESTS,
  );

  const moversExam = data.filter(
    (item: any) => item.category === COMPONENTS_GRADEBOOK.MOVERS_EXAM,
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
  studentsGrades: any,
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
  studentsGrades: any,
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
  studentId: string,
) => {
  let sumResult = 0;
  let totalExpected = notes.length * 10;
  let averageResult = "0";

  notes.map((note) => {
    sumResult += !!grades[note.item_id][studentId]
      ? Number(grades[note.item_id][studentId])
      : 0;
  });

  averageResult = ((sumResult * 100) / totalExpected).toFixed(2) ?? 0;

  return averageResult;
};

export const calculateTotalAverage = (
  grades: any[],
  notes: ComponentsGradebook,
  studentId: string,
  gradingPercentages: GradingPercentage,
) => {
  let result = 0;
  const assignments = calculateAverage(grades, notes.assignments, studentId);
  const progressTest = calculateAverage(grades, notes.progressTest, studentId);
  const moversExam = calculateAverage(grades, notes.moversExam, studentId);

  result =
    Number(assignments) *
      calculateRelativePercentage(gradingPercentages.assig_percentage) +
    Number(progressTest) *
      calculateRelativePercentage(gradingPercentages.test_percentage) +
    Number(moversExam) *
      calculateRelativePercentage(gradingPercentages.exam_percentage);

  return Number(result).toFixed(2);
};

export const calculateClassTotalAverage = (
  grades: any[],
  componentsGradebook: any,
  gradingPercentages: GradingPercentage,
  students: any[],
) => {
  const gradesTotalSum = students?.reduce((acc, student) => {
    const totalAverage = calculateTotalAverage(
      grades,
      componentsGradebook,
      student.id,
      gradingPercentages,
    );

    return acc + Number(totalAverage);
  }, 0);
  const totalClassAverage = gradesTotalSum / students.length;
  return !!totalClassAverage ? Number(totalClassAverage).toFixed(2) : "0";
};

export const calculateFinalGradingStatus = (
  notesPercentages: any[] = [],
  note: any,
) => {
  const percentage = Number(note);

  const gradingStatus = notesPercentages?.find((notePercentage: any) => {
    return (
      percentage >= Number(notePercentage.min) &&
      percentage <= Number(notePercentage.max)
    );
  });

  return !!gradingStatus ? gradingStatus?.name : "NOT REPORTED";
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
  courseLevel: string,
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
) => {
  return moversExamScore?.map((moverExamScore, index) => {
    const scorePercentage = (
      (grades[moverExamScore.item_id][studentId] * 100) /
      10
    ).toFixed(2);

    const gradeResult = calculateFinalGradingStatus(
      notesPercentages,
      scorePercentage,
    );

    return {
      id: index,
      criterion: moverExamScore.item_name,
      level: moverExamScore?.category,
      score: scorePercentage,
      grade: gradeResult,
      class: `result-${gradeResult?.split(" ")[0].toLowerCase()}`,
    };
  });
};

export const calculateAssignmentAverage = (
  scoreGrades: any,
  gradingPercentage: GradingPercentage,
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
  gradingPercentage: GradingPercentage,
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
  studentId: string,
) => {
  let moverExamSum = 0;
  let moversExamProm = 0;

  moverExamSum = moversExamScore.reduce((acc, moverExamScore) => {
    return acc + Number(grades[moverExamScore.item_id][studentId]);
  }, 0);

  moversExamProm = (moverExamSum / moversExamScore.length) * 10;

  return Number(moversExamProm).toFixed(2);
};

export const formatReportBarChartData = (
  moversExamScore: any[] = [],
  grades: any,
  studentId: string,
) => {
  let labels: string[] = [];
  let data: number[] = [];

  moversExamScore.forEach((item) => {
    labels.push(item.item_name);
    data.push(Number(grades[item.item_id][studentId]) * 0.1);
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

export const formatExamParams = (result: any[]) => {
  const values = result?.map((exam) => {
    const name = exam.criterion?.toLowerCase().replace(" and ", "-");
    return {
      [name]: `${exam.score}%`,
      [`${name}Status`]: `${exam.grade}`,
    };
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
  reading,
  readingStatus,
  writing,
  writingStatus,
  speaking,
  speakingStatus,
  generalExamsTotal,
  //Young learners
  readingWriting,
  readingWritingStatus,
  listeningYLE,
  listeningYLEStatus,
  speakingYLE,
  speakingYLEStatus,
  yleTotal,
  gpa,
  final,
}: any) => {
  const baseUrl = new URL(
    "https://chiispiitas.github.io/Brighton/Certificate%20Generator/index.html",
  );
  baseUrl.searchParams.append("student", student.toUpperCase());
  baseUrl.searchParams.append(
    "program",
    ageGroup === "adult" ? "General English" : "Young Learners",
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

  if (exam === EXAMS_TYPE.PRELIM) {
    baseUrl.searchParams.append("reading", reading);
    baseUrl.searchParams.append("reading-status", readingStatus);
    baseUrl.searchParams.append("listening", reading);
    baseUrl.searchParams.append("listening-status", readingStatus);
    baseUrl.searchParams.append("writing", writing);
    baseUrl.searchParams.append("writing-status", writingStatus);
    baseUrl.searchParams.append("speaking", speaking);
    baseUrl.searchParams.append("speaking-status", speakingStatus);
    baseUrl.searchParams.append("general-exams-total", generalExamsTotal);
  } else {
    baseUrl.searchParams.append("reading-and-writing", readingWriting);
    baseUrl.searchParams.append(
      "reading-and-writing-status",
      readingWritingStatus,
    );
    baseUrl.searchParams.append("listening-yle", listeningYLE);
    baseUrl.searchParams.append("listening-yle-status", listeningYLEStatus);
    baseUrl.searchParams.append("speaking-yle", speakingYLE);
    baseUrl.searchParams.append("speaking-yle-status", speakingYLEStatus);
    baseUrl.searchParams.append("yle-total", yleTotal);
  }

  return baseUrl;
  // return `https://chiispiitas.github.io/Brighton/Certificate%20Generator/index.html?student=JEAN%20PA
  //         UL%20SANTOS%20CUADROS&program=General%20English&level=B1%20PRE-
  //         INTERMEDIATE&short-level=B1&assignments=90%&assignments-total=97.5%&assignments-
  //         status=PASS&tests=100&tests-status=PASS&exam=PRELIM.&reading=20%&reading-
  //         status=NOT%20REPORTED&listening=30%&listening-
  //         status=NOT%20REPORTED&writing=40%&writing-
  //         status=FAILED%20(A2)&speaking=50%&speaking-status=FAILED%20(A2)&general-exams-
  //         total=35%&gpa=47.5%%20(FAILED%20(A2))&final=FAILED%20&password=Brighton1234@`;
};
