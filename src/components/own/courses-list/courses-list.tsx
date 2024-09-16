import Link from "next/link";
import React from "react";
import { Table } from "reactstrap";

interface CoursesListProps {
  title: string;
  coursesList: {
    classRoom: string;
    level: string;
    link: string;
  }[];
}

const CoursesList = ({ title, coursesList }: CoursesListProps) => {
  return (
    <div>
      <h2 className="main-title">{title}</h2>
      <Table className="link-list">
        <tbody>
          {coursesList?.map((course, index) => (
            <tr key={`dashboard-course-${index}`}>
              <td>{course.classRoom}</td>
              <td>{course.level}</td>
              <td className="col-bg-primary ">
                <Link href={course.link} className="w-100 h-100 col-icon">
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
