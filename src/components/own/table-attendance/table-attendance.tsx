import React, {
  useEffect,
  useState,
  useMemo,
  ChangeEvent,
  useCallback,
} from "react";
import { Input, Table } from "reactstrap";
import {
  buildAttendanceStructure,
  countAbsences,
  countAttendance,
  formatDate,
  getColorOfAssistance,
} from "../../../../utils/utils";
import { createAttendance } from "../../../../helper/api-data/attendance";
import { updateLessonTaught } from "../../../../helper/api-data/course-schedule";
import { toast } from "react-toastify";
import { debounce } from "lodash";

type TableAttendance = {
  courseSchedule: any;
  studentsAttendance: Array<any>;
  students: Array<any>;
};

type AttendanceStatistics = {
  attendanceCount: number;
  attendancePercentage: number;
};

const TableAttendance = ({
  courseSchedule = [],
  studentsAttendance,
  students = [],
}: TableAttendance) => {
  const [dates, setDates] = useState<any>([]);
  const [scheduleItems, setScheduleItems] = useState(courseSchedule);

  useEffect(() => {
    setDates(studentsAttendance);
  }, [studentsAttendance]);

  useEffect(() => {
    setScheduleItems(courseSchedule);
  }, [courseSchedule]);

  const changeAttendance = async (
    event: any,
    syllabusItemId: any,
    studentId: any,
  ) => {
    const status = event.target.value;
    setDates((date: any) => ({
      ...date,
      [syllabusItemId]: {
        ...date[syllabusItemId],
        [studentId]: status,
      },
    }));

    await createAttendance({
      course_schedule_id: syllabusItemId,
      student_id: studentId,
      status,
    });
  };

  const calculateAttendance = (studentId: number): AttendanceStatistics => {
    return countAttendance(dates, studentId);
  };

  const calculateAbsence = (studentId: number): AttendanceStatistics => {
    return countAbsences(dates, studentId);
  };

  const updateScheduleItem = (
    e: ChangeEvent,
    lessonId: number,
    index: number,
  ) => {
    const value = (e.target as HTMLInputElement).value;

    const updatedScheduleItems = scheduleItems.map((item: any, i: number) => {
      if (index === i) return { ...item, lesson_taught: value };
      return item;
    });
    setScheduleItems(updatedScheduleItems);

    onSaveLesson(value, lessonId);
  };

  const onSaveLesson = useCallback(
    debounce(async (lesson: string, lessonId: number) => {
      await updateLessonTaught(lessonId, { lesson_taught: lesson });
    }, 600),
    [],
  );

  const renderStatisticsCol = (studentId: number) => {
    const assistanceStatistics = calculateAttendance(studentId);
    const absentStatistics = calculateAbsence(studentId);

    return (
      <>
        <td>{assistanceStatistics.attendanceCount}</td>
        <td>{assistanceStatistics.attendancePercentage}%</td>
        <td>{absentStatistics.attendanceCount}</td>
        <td
          className={getColorOfAssistance(
            absentStatistics.attendancePercentage,
          )}
        >
          {absentStatistics.attendancePercentage}%
        </td>
      </>
    );
  };

  return (
    <div>
      <Table responsive bordered className="main-table w-100">
        <thead>
          <tr>
            <th className="main-col-title student-col">STUDENT</th>
            {scheduleItems?.map((date: any, index: number) => (
              <th className="col-vertical" key={`date-attendance-${index}`}>
                {formatDate(date?.scheduled_date)}
              </th>
            ))}
            <th className="main-col-title" colSpan={2}>
              ATTENDANCE
            </th>
            <th className="main-col-title" colSpan={2}>
              ABSENCES
            </th>
          </tr>
        </thead>
        <tbody>
          {students && students.length > 0 ? (
            students?.map((student: any, index) => (
              <tr key={`date-student-${index}`}>
                <td>{student?.name}</td>
                {Object.keys(dates).map((courseScheduleId: any, index2) => (
                  <td key={`attendance-${index2}`} className={`td-attendance`}>
                    <Input
                      type="select"
                      className="attendance-input"
                      value={dates[courseScheduleId][student?.id]}
                      onChange={(event) =>
                        changeAttendance(event, courseScheduleId, student?.id)
                      }
                    >
                      <option value="">&nbsp;</option>
                      <option value="present">P</option>
                      <option value="absent">F</option>
                      <option value="late">A</option>
                      <option value="recovered">R</option>
                    </Input>
                  </td>
                ))}
                {renderStatisticsCol(student?.id)}
              </tr>
            ))
          ) : (
            <tr>
              <td
                colSpan={Object.keys(dates).length + 4}
                className="text-center"
              >
                This course doesn't have student
              </td>
            </tr>
          )}

          {students && students.length > 0 && (
            <>
              <tr className="py-2">
                <td className="border-none"></td>
              </tr>
              <tr>
                <td className="main-col-description student-col">LESSON:</td>
                {scheduleItems.map((item: any, index: number) => (
                  <td
                    className="col-vertical"
                    key={`current-lesson-col-${index}`}
                  >
                    <Input
                      type="text"
                      className="attendance-input"
                      // @ts-ignore
                      onChange={(e) => updateScheduleItem(e, item.id, index)}
                      value={scheduleItems[index].lesson_taught ?? ""}
                    />
                  </td>
                ))}
                <td className="main-col-description" colSpan={4}></td>
              </tr>
              <tr>
                <td className="main-col-description student-col">
                  CURRICULUM:
                </td>
                {scheduleItems?.map((item: any, index: number) => (
                  <td
                    className="col-vertical highlighted-col text-center"
                    key={`curriculum-lesson-col-${index}`}
                  >
                    {item.syllabusItem.item_name}
                  </td>
                ))}
                <td className="main-col-description" colSpan={4}></td>
              </tr>
            </>
          )}
        </tbody>
      </Table>
    </div>
  );
};

export default TableAttendance;
