import React from "react";
import { Table } from "reactstrap";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import {
  buildAttendanceStructure,
  getAllCourseDays,
  getUniqueStudents,
} from "../../../../utils/utils";
import { createAttendance } from "../../../../helper/api-data/attendance";
import { useRouter } from "next/router";
import logoHeader from "@/components/own/logo-header/logo-header";
import { mutate } from "swr";

type TableAttendance = {
  startDate: Date;
  endDate: Date;
  schedule: Array<any>;
  studentsAttendance: Array<any>;
  students: Array<any>;
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
  const [daysOfClasses, setDaysOfClasses] = useState([]);

  useEffect(() => {
    const datesOfClasses = getAllCourseDays(startDate, endDate, schedule);
    setDaysOfClasses(datesOfClasses);
    const attendance = buildAttendanceStructure(
      datesOfClasses,
      studentsAttendance,
    );
    setDates(attendance);
    // console.log(attendance);
  }, [startDate, endDate, schedule]);

  const changeAttendance = async (
    event: any,
    currentDate: any,
    student: any,
  ) => {
    // await createAttendance({
    //   course_id: Number(courseId),
    //   student_id: student.id,
    //   attendance_date: format(new Date(currentDate), "yyyy-MM-dd").split(
    //     "T",
    //   )[0],
    //   status: "Present",
    // });

    setDates((date: any) => ({
      ...date,
      [currentDate]: {
        ...date[currentDate],
        [student?.name]: event.target.value,
      },
    }));
  };

  return (
    <div>
      <Table responsive bordered className="main-table w-100">
        <thead>
          <tr>
            <th className="main-col-title student-col">STUDENT</th>
            {daysOfClasses.map((date, index) => (
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
                  <input
                    type="text"
                    className="inner-input"
                    value={dates[currentDate][student?.name]}
                    onChange={(event) =>
                      changeAttendance(event, currentDate, student)
                    }
                  />
                </td>
              ))}
              <td>18</td>
              <td>43%</td>
              <td>4</td>
              <td>14%</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default TableAttendance;
