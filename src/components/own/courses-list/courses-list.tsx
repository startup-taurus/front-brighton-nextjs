import Link from "next/link";
import React from "react";
import { Table } from "reactstrap";

interface CoursesListProps {
  title: string;
  coursesList: any;
}

const CoursesList = ({ title, coursesList }: CoursesListProps) => {
  return (
    <div>
      <h2 className="main-title">{title}</h2>
      <Table className="link-list">
        <tbody>
          {coursesList?.map((course: any, index: number) => (
            <tr key={`dashboard-course-${index}`}>
              <td>{course?.course_number}</td>
              <td>{`${course?.course_name} - ${course.classSchedule}`}</td>
              <td className="col-bg-primary ">
                <Link
                  href={`/course/${course?.course_id}/home`}
                  className="w-100 h-100 col-icon"
                >
                  📁
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default CoursesList;
