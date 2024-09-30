import React from "react";
import { Table } from "reactstrap";
import { MouseEvent, useEffect, useState } from "react";
import { format, nextDay } from "date-fns";
import { FaCirclePlus } from "react-icons/fa6";

const TableAttendance = () => {
  const [dates, setDates] = useState<any>({});
  const handleAddDate = (e: MouseEvent<SVGAElement>) => {
    const currentDate = nextDay(new Date(), 5).toISOString();
    setDates((dates: any) => ({
      ...dates,
      [currentDate]: {
        "PIERINA VALENTINA CEVALLOS MALDONA": "P",
        "ENRIQUE LEONARDO GARCIA CARRILLO": "F",
        "MATEO NICOLAS MALDONADO PALMA": "R",
      },
    }));
  };

  useEffect(() => {
    const currentDate = new Date().toISOString();
    setDates({
      [currentDate]: {
        "PIERINA VALENTINA CEVALLOS MALDONA": "P",
        "ENRIQUE LEONARDO GARCIA CARRILLO": "F",
        "MATEO NICOLAS MALDONADO PALMA": "R",
      },
    });
  }, []);

  const datesArray = Object.keys(dates);
  const students = Array.from(
    new Set(datesArray.flatMap((date) => Object.keys(dates[date]))),
  );

  return (
    <div>
      <Table responsive bordered className="main-table w-auto">
        <thead>
          <tr>
            <th className="main-col-title student-col">STUDENT</th>
            {Object.keys(dates).map((date, index) => (
              <th className="col-vertical" key={`date-attendence-${index}`}>
                {format(new Date(date), "EEE, MMM d")}

                {index === Object.keys(dates).length - 1 && (
                  <div className="add-col-btn">
                    <FaCirclePlus onClick={handleAddDate} />
                  </div>
                )}
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
          {students.map((student: any, index) => (
            <tr key={`date-student-${index}`}>
              <td>{student}</td>
              {datesArray.map((currentDate: any, index2) => (
                <td key={`attendance-${index2}`}>
                  {dates[currentDate][student]}
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
