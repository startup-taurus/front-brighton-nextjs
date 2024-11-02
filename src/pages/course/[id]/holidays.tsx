import { useRouter } from "next/router";
import useSWR from "swr";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import { Card, CardBody, Col, Row } from "reactstrap";
import CustomTable from "@/components/own/custom-table/custom-table";
import React, { ReactElement } from "react";
import { ImgPath } from "../../../../utils/Constant";
import Image from "next/image";
import CourseLayout from "@/components/own/course-layout/course-layout";
import { NextPageWithLayout } from "@/pages/_app";
import { getCourseById } from "../../../../helper/api-data/course";

const tabsName = "HOLIDAYS";
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
    date: "Mon, Jan 01",
    festivity: "NEW YEAR'S DAY",
  },
  {
    date: "Fri, Feb 09",
    festivity: "CARNIVAL",
  },
  {
    date: "Tue, Feb 13",
    festivity: "CARNIVAL",
  },
  {
    date: "Fri, Mar 29",
    festivity: "GOOD FRIDAY",
  },
  {
    date: "Wed, May 01",
    festivity: "LABOR DAY",
  },
  {
    date: "Sun, May 26",
    festivity: "BATTLE OF PICHINCHA",
  },
  {
    date: "Sat, Aug 10",
    festivity: "FIRST CRY OF INDEPENDENCE",
  },
  {
    date: "Wed, Oct 09",
    festivity: "GUAYAQUIL'S INDEPENDENCE",
  },
  {
    date: "Sat, Nov 02",
    festivity: "ALL SOULS' DAY",
  },
  {
    date: "Sun, Nov 03",
    festivity: "CUENCA'S INDEPENDENCE",
  },
  {
    date: "Tue, Dec 24",
    festivity: "CHRISTMAS EVE",
  },
  {
    date: "Wed, Dec 25",
    festivity: "CHRISTMAS",
  },
  {
    date: "Tue, Dec 31",
    festivity: "NEW YEAR'S EVE",
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
  const router = useRouter();
  const courseId = router.query.id as string;

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );

  if (!courseDetail?.data?.data) return null;
  const { course_number } = courseDetail?.data?.data;

  return (
    <Card>
      <CardBody>
        <TabsTeachers numberOfClass={course_number} tabsName={tabsName} />
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
