import React, { useEffect, useState, useMemo } from "react";
import { Input, Table } from "reactstrap";
import { format } from "date-fns";
import {
  buildAttendanceStructure,
  getAllCourseDays,
} from "../../../../utils/utils";
import { createAttendance } from "../../../../helper/api-data/attendance";
import { useRouter } from "next/router";

type TableAttendance = {
  startDate: Date;
  endDate: Date;
  schedule: Array<any>;
  studentsAttendance: Array<any>;
  students: Array<any>;
};

type AttendanceStatistics = {
  attendanceCount: number;
  attendancePercentage: number;
};

const TableAttendance = ({
  startDate,
  endDate,
  schedule,
  studentsAttendance,
  students,
}: TableAttendance) => {
  const router = useRouter();
  const courseId = router.query.id;
  const [dates, setDates] = useState<any>([]);
  const daysOfClasses = useMemo(
    () => getAllCourseDays(startDate, endDate, schedule),
    [startDate, endDate],
  );

  useEffect(() => {
    const attendance = buildAttendanceStructure(
      daysOfClasses,
      studentsAttendance,
    );
    setDates(attendance);
  }, [startDate, endDate, daysOfClasses]);

  const changeAttendance = async (
    event: any,
    currentDate: any,
    student: any,
  ) => {
    if (event.target.value === "") return;
    setDates((date: any) => ({
      ...date,
      [currentDate]: {
        ...date[currentDate],
        [student?.id]: event.target.value,
      },
    }));
    await createAttendance({
      course_id: Number(courseId),
      student_id: student.id,
      attendance_date: format(new Date(currentDate), "yyyy-MM-dd"),
      status: event.target.value,
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
    const assistanceStatistics = calculateAttendance(studentId, "Present");
    const absentStatistics = calculateAttendance(studentId, "Absent");

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
            {daysOfClasses.map((date: string, index: number) => (
              <th className="col-vertical" key={`date-attendance-${index}`}>
                {date}
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
          {students?.map((student: any, index) => (
            <tr key={`date-student-${index}`}>
              <td>{student?.name}</td>
              {Object.keys(dates).map((currentDate: any, index2) => (
                <td key={`attendance-${index2}`} className="td-attendance">
                  <Input
                    type="select"
                    className="attendance-input"
                    value={dates[currentDate][student?.id]}
                    onChange={(event) =>
                      changeAttendance(event, currentDate, student)
                    }
                  >
                    <option value="">&nbsp;</option>
                    <option value="Present">P</option>
                    <option value="Excused">R</option>
                    <option value="Absent">A</option>
                  </Input>
                </td>
              ))}
              {renderStatisticsCol(student?.id)}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableAttendance;
