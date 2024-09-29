import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card, CardBody, Col, Row } from "reactstrap";
import TeacherNavMenu from "@/components/own/teacher-nav-menu/teacher-nav-menu";
import CustomTable from "@/components/own/custom-table/custom-table";
import React, { ReactElement } from "react";
import { ImgPath } from "../../../utils/Constant";
import Image from "next/image";
import Layout from "@/layout";
import CourseLayout from "@/components/own/course-layout/course-layout";
import { NextPageWithLayout } from "@/pages/_app";

const tabsName = "HOLIDAYS";
const numberOfClass = "F-16°";

const holidayCols = [
  {
    name: "DATE",
    selector: (row: { date: string }) => row.date,
    sortable: true,
  },
  {
    name: "FESTIVITY",
    selector: (row: { festivity: string }) => row.festivity,
    sortable: true,
  },
];

const holidayData = [
  {
    date: "Mon, Feb 12",
    festivity: "CARNIVALS",
  },
  {
    date: "Mon, Feb 12",
    festivity: "CARNIVALS",
  },
  {
    date: "Mon, Feb 12",
    festivity: "CARNIVALS",
  },
  {
    date: "Mon, Feb 12",
    festivity: "CARNIVALS",
  },
  {
    date: "Mon, Feb 12",
    festivity: "CARNIVALS",
  },
];

const cancelClassesCols = [
  {
    name: "DATE",
    selector: (row: { date: string }) => row.date,
    sortable: true,
  },
  {
    name: "REASON",
    selector: (row: { festivity: string }) => row.festivity,
    sortable: true,
  },
];
const TeachersHolidays: NextPageWithLayout = () => {
  return (
    <Card>
      <CardBody>
        <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
        <Row>
          <Col xs={12} sm={12} md={6} lg={4}>
            <div className="holiday-table-header">
              <h3>UNIVERSAL LIST</h3>
            </div>
            <CustomTable columns={holidayCols} data={holidayData} />
          </Col>
          <Col xs={12} sm={12} md={6} lg={4}>
            <div className="holiday-table-header">
              <h3>CANCELED LESSONS</h3>
            </div>
            <CustomTable columns={holidayCols} data={[]} />
          </Col>
          <Col xs={12} sm={12} md={6} lg={4}>
            <div className="warning-messages">
              <Image
                src={`${ImgPath}/course/warning-icon.png`}
                alt="logo"
                width={50}
                height={60}
              />
              <p>
                Dates input in the <span>'CANCELED LESSONS'</span> range will be
                removed from the attendance list.
              </p>
            </div>
            <Image
              className="w-100"
              src={`${ImgPath}/course/holiday-bg.png`}
              alt="logo"
              layout="responsive"
              width={100}
              height={100}
            />
          </Col>
        </Row>
      </CardBody>
    </Card>
  );
};

TeachersHolidays.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default TeachersHolidays;
