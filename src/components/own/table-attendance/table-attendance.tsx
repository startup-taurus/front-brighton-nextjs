import React, { useEffect, useState, useMemo } from "react";
import { Input, Table } from "reactstrap";
import {
  buildAttendanceStructure,
  formatDate,
  getAllCourseDays,
} from "../../../../utils/utils";
import { createAttendance } from "../../../../helper/api-data/attendance";
import { useRouter } from "next/router";

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
  const attendanceDate = useMemo(
    () =>
      buildAttendanceStructure(courseSchedule, students, studentsAttendance),
    [courseSchedule, students, studentsAttendance],
  );
  const [dates, setDates] = useState<any>([]);

  useEffect(() => {
    setDates(attendanceDate);
  }, [attendanceDate]);

  const changeAttendance = async (
    event: any,
    syllabusItemId: any,
    studentId: any,
  ) => {
    const status = event.target.value;
    if (status === "") return;
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

  const calculateAttendance = (
    studentId: number,
    status: string,
  ): AttendanceStatistics => {
    const datesValues = Object.values(dates);

    const attendanceCount = datesValues.filter(
      (record: any) => record[studentId] === status,
    ).length;

    const attendancePercentage = (
      (attendanceCount / datesValues.length) *
      100
    ).toFixed(2);

    return {
      attendanceCount,
      attendancePercentage: Number(attendancePercentage),
    };
  };

  const renderStatisticsCol = (studentId: number) => {
    const assistanceStatistics = calculateAttendance(studentId, "present");
    const absentStatistics = calculateAttendance(studentId, "absent");

    return (
      <>
        <td>{assistanceStatistics.attendanceCount}</td>
        <td>{assistanceStatistics.attendancePercentage}%</td>
        <td>{absentStatistics.attendanceCount}</td>
        <td>{absentStatistics.attendancePercentage}%</td>
      </>
    );
  };

  return (
    <div>
      <Table responsive bordered className="main-table w-100">
        <thead>
          <tr>
            <th className="main-col-title student-col">STUDENT</th>
            {courseSchedule?.map((date: any, index: number) => (
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

          <tr className="py-2">
            <td className="border-none"></td>
          </tr>
          <tr>
            <td className="main-col-description student-col">LESSON:</td>
            {courseSchedule.map((item: any, index: number) => (
              <td className="col-vertical" key={`current-lesson-col-${index}`}>
                <Input type="text" className="attendance-input" />
              </td>
            ))}
            <td className="main-col-description" colSpan={4}></td>
          </tr>
          <tr>
            <td className="main-col-description student-col">CURRICULUM:</td>
            {courseSchedule?.map((item: any, index: number) => (
              <td
                className="col-vertical highlighted-col text-center"
                key={`curriculum-lesson-col-${index}`}
              >
                {item.syllabusItem.item_name}
              </td>
            ))}
            <td className="main-col-description" colSpan={4}></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default TableAttendance;
