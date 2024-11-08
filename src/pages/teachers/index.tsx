import React, { useContext } from "react";

import SectionTitle from "@/components/own/section-title/section-title";
import { Card, CardBody, Col, Row } from "reactstrap";
import TeacherProfile from "@/components/own/teacher-profile/teacher-profile";
import { ImgPath } from "utils/Constant";
import CoursesList from "@/components/own/courses-list/courses-list";
import QuickLinksList from "@/components/own/quick-links-list/quick-links-list";
import ScheduleCalendar from "@/components/own/schedule-calendar/schedule-calendar";
import useSWR from "swr";
import { UserContext } from "../../../helper/User";
import { getProfessorCourses } from "../../../helper/api-data/professor";

const COURSES = [
  {
    classRoom: "F-16°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/course/home",
  },
  {
    classRoom: "F-42°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/course/home",
  },
  {
    classRoom: "H-17°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/course/home",
  },
  {
    classRoom: "C-17°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/course/home",
  },
  {
    classRoom: "V-51°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/course/home",
  },
];

const QUICK_LINKS = [
  {
    title: "Personal Best",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "📚",
  },
  {
    title: "Study Guides",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "🎒",
  },
  {
    title: "Final Projects",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "🎓",
  },
  {
    title: "Final Exams",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "📝",
  },
  {
    title: "Rulebooks",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "📔",
  },
];

const OTHER_LINKS = [
  {
    title: "Monthly reports",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "📁",
  },
  {
    title: "Courses",
    link: "https://drive.google.com/drive/folders/1570aSXIRsYP2h8BFHzsXyzJrZ5nCGd1F",
    icon: "📁",
  },
];

const Dashboard = () => {
  const { user } = useContext(UserContext);
  const courses = useSWR(
    user?.id ? `/professor/${user?.id}/courses` : null,
    () => getProfessorCourses(user?.id),
  );

  if (!courses?.data?.data?.courses) return null;

  return (
    <div className="page-body pt-2">
      <Card>
        <CardBody>
          <SectionTitle title="Dashboard" />
          <TeacherProfile
            profileData={{
              profileImage: `${ImgPath}/user/user.png`,
              firstName: user?.name?.split(" ")[0],
              lastName: user?.name?.split(" ")[1],
              position: user?.role,
              studentQty: courses?.data?.data?.total_students,
              coursesQty: courses?.data?.data?.total_courses,
            }}
          />
          <div className="divider"></div>
          <div className="d-flex flex-column flex-lg-row justify-content-between pb-5">
            <CoursesList
              title="Courses"
              coursesList={courses?.data?.data?.courses}
            />
            <QuickLinksList
              title="Quick Links"
              quickLinks={QUICK_LINKS}
              otherLinks={OTHER_LINKS}
            />
          </div>
          <div className="divider"></div>
          <ScheduleCalendar courses={courses?.data?.data?.courses} />
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
