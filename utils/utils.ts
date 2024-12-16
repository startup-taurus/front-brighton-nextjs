import Cookies from "js-cookie";
import { toast } from "react-toastify";
import { ERROR_MESSAGE } from "./constants";
import { NextRouter } from "next/router";
import {
  addDays,
  addWeeks,
  differenceInBusinessDays,
  eachDayOfInterval,
  endOfWeek,
  format,
  formatDistance,
  isBefore,
  parse,
  parseISO,
  startOfWeek,
} from "date-fns";

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
      attendanceDate[studentAttendance?.id]![studentAttendance?.student_id] =
        studentAttendance?.status;
    }
  });

  return attendanceDate;
};
