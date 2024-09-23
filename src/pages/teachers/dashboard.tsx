import React from "react";

import SectionTitle from "@/components/own/section-title/section-title";
import { Card, CardBody, Col, Row } from "reactstrap";
import TeacherProfile from "@/components/own/teacher-profile/teacher-profile";
import { ImgPath } from "utils/Constant";
import CoursesList from "@/components/own/courses-list/courses-list";
import QuickLinksList from "@/components/own/quick-links-list/quick-links-list";
import ScheduleCalendar from "@/components/own/schedule-calendar/schedule-calendar";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";

const COURSES = [
  {
    classRoom: "F-16°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/teachers/home",
  },
  {
    classRoom: "F-42°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/teachers/home",
  },
  {
    classRoom: "H-17°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/teachers/home",
  },
  {
    classRoom: "C-17°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/teachers/home",
  },
  {
    classRoom: "V-51°",
    level: "A1.2 MOVERS - MON & WED 4-6 PM",
    link: "/teachers/home",
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
  return (
    <div className="page-body pt-2">
      <TeacherNavMenu />
      <Card>
        <CardBody>
          <SectionTitle title="Dashboard" />
          <TeacherProfile
            profileData={{
              profileImage: `${ImgPath}/own/profile-image.png`,
              firstName: "Kaori",
              lastName: "Fukusawa",
              position: "Teacher",
              studentQty: 30,
              coursesQty: 3,
            }}
          />
          <div className="divider"></div>
          <div className="d-flex flex-column flex-lg-row justify-content-between pb-5">
            <CoursesList title="Courses" coursesList={COURSES} />
            <QuickLinksList
              title="Quick Links"
              quickLinks={QUICK_LINKS}
              otherLinks={OTHER_LINKS}
            />
          </div>
          <div className="divider"></div>
          <ScheduleCalendar />
        </CardBody>
      </Card>
    </div>
  );
};

export default Dashboard;
