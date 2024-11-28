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
import { getAllActiveHolidays } from "../../../../helper/api-data/holidays";
import { format } from "date-fns";

const tabsName = "HOLIDAYS";
const holidayCols = [
  {
    name: "DATE",
    selector: (row: { holiday_date: string }) =>
      format(new Date(row.holiday_date), "ccc, LLL dd"),
    sortable: true,
  },
  {
    name: "FESTIVITY",
    selector: (row: { holiday_name: string }) => row.holiday_name,
    sortable: true,
  },
];

const cancelClassesCols = [
  {
    name: "DATE",
    selector: (row: { date: string }) =>
      format(new Date(row.date), "ccc, LLL dd"),
    sortable: true,
  },
  {
    name: "REASON",
    selector: (row: { reason: string }) => row.reason,
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

  const holidays = useSWR(`/holidays/get-all-active`, () =>
    getAllActiveHolidays(),
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
            <CustomTable columns={holidayCols} data={holidays?.data?.data} />
          </Col>
          <Col xs={12} sm={12} md={6} lg={4}>
            <div className="holiday-table-header">
              <h3>CANCELED LESSONS</h3>
            </div>
            <CustomTable columns={cancelClassesCols} data={[]} />
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
