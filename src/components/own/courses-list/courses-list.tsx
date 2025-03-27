import Link from 'next/link';
import React, { useState } from 'react';
import { Table, Tooltip } from 'reactstrap';

interface CoursesListProps {
  title: string;
  coursesList: any;
}

const CoursesList = ({ title, coursesList }: CoursesListProps) => {
  const [tooltips, setTooltips] = useState<Record<string, boolean>>({});

  const toggle = (tooltipId: string) => {
    setTooltips((prev) => ({
      ...prev,
      [tooltipId]: !prev[tooltipId],
    }));
  };
  return (
    <div>
      <h2 className='main-title'>{title}</h2>
      <Table className='link-list'>
        <tbody>
          {coursesList?.map((course: any, index: number) => (
            <tr key={`dashboard-course-${index}`}>
              <td>{course?.course_number}</td>
              <td>{`${course?.course_name} - ${course.classSchedule}`}</td>
              <td className='col-bg-primary '>
                <Link
                  href={`/course/${course?.course_id}/home`}
                  className='w-100 h-100 col-icon'
                >
                  📁
                </Link>
              </td>
              {course?.options && (
                <td className='no-bg'>
                  <div className='d-flex align-items-center gap-1'>
                    {course?.options?.hasClassToday && (
                      <span id={`calendar-${index}`}> 📅</span>
                    )}
                    {course?.options?.hasClassToday && (
                      <Tooltip
                        innerClassName='text-dark'
                        isOpen={tooltips[`calendar-${index}`]}
                        target={`calendar-${index}`}
                        toggle={() => toggle(`calendar-${index}`)}
                      >
                        Class today
                      </Tooltip>
                    )}
                    {course?.options?.hasClassToday &&
                      !course?.options?.hasBeenTakenAttendance && (
                        <span id={`alert-${index}`}>❗</span>
                      )}
                    {course?.options?.hasClassToday &&
                      !course?.options?.hasBeenTakenAttendance && (
                        <Tooltip
                          innerClassName='text-dark'
                          isOpen={tooltips[`alert-${index}`]}
                          target={`alert-${index}`}
                          toggle={() => toggle(`alert-${index}`)}
                        >
                          Attendance not taken
                        </Tooltip>
                      )}
                    {course?.options?.endThisMoth && (
                      <span id={`finish-${index}`}>🏁</span>
                    )}
                    {course?.options?.endThisMoth && (
                      <Tooltip
                        innerClassName='text-dark'
                        isOpen={tooltips[`finish-${index}`]}
                        target={`finish-${index}`}
                        toggle={() => toggle(`finish-${index}`)}
                      >
                        Ends this month
                      </Tooltip>
                    )}
                    {course?.options?.isAreadyEnd && (
                      <span id={`graduate-${index}`}>🎓</span>
                    )}
                    {course?.options?.isAreadyEnd && (
                      <Tooltip
                        innerClassName='text-dark'
                        isOpen={tooltips[`graduate-${index}`]}
                        target={`graduate-${index}`}
                        toggle={() => toggle(`graduate-${index}`)}
                      >
                        Course completed
                      </Tooltip>
                    )}
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CoursesList;
