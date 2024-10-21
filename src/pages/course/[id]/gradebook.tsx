import CourseLayout from "@/components/own/course-layout/course-layout";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import React, { ReactElement } from "react";
import { Card, CardBody, Table } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";
import { tr } from "date-fns/locale";
import { useRouter } from "next/router";
import useSWR from "swr";
import { getCourseById } from "../../../../helper/api-data/course";

const tabsName = "GRADEBOOK";
const numberOfClass = "F-16°";

const studentsData = [
  {
    name: "PIERINA VALENTINA CEVALLOS MALDONA",
  },
  {
    name: "ENRIQUE LEONARDO GARCIA CARRILLO",
  },
  {
    name: "MATEO NICOLAS MALDONADO PALMA",
  },
];

const studentsCols = [
  {
    name: "STUDENT",
    selector: (row: { name: string }) => row.name,
  },
  {
    name: "Page 112",
    selector: (row: any) => row.page112,
  },
  {
    name: "Homework #2",
    selector: (row: any) => row.homeWork,
  },
  {
    name: "ASSIG. (5%)",
    selector: (row: any) => row.assig,
  },
  {
    name: "Test Units 1-2",
    selector: (row: any) => row.note,
  },
];

const Gradebook: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;

  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId),
  );

  if (!courseDetail?.data?.data) return null;
  const { course_number } = courseDetail?.data?.data;

  return (
    <Card tag="section" className="gradebook">
      <CardBody>
        <TabsTeachers numberOfClass={course_number} tabsName={tabsName} />
        <Table responsive bordered className="report-table">
          <thead>
            <tr>
              <th className="col-title">STUDENT</th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title">ASSIG. (5%)</th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title">TEST. (15%)</th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title"></th>
              <th className="col-title">EXAM (80%)</th>
              <th className="col-title">TOTAL</th>
              <th className="col-title">GRADE</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>PIERINA VALENTINA CEVALLOS MALDONA</td>
              <td>100%</td>
              <td>100%</td>
              <td></td>
              <td>90%</td>
              <td>80%</td>
              <td></td>
              <td></td>
              <td>80%</td>
              <td>80%</td>
              <td></td>
              <td></td>
              <td>80%</td>
              <td className="highlighted-col">80%</td>
              <td className="gay-col">NOT REPORTED</td>
            </tr>
            <tr>
              <td>ENRIQUE LEONARDO GARCIA CARRILLO</td>
              <td>100%</td>
              <td>100%</td>
              <td></td>
              <td>90%</td>
              <td>80%</td>
              <td></td>
              <td></td>
              <td>80%</td>
              <td>80%</td>
              <td></td>
              <td></td>
              <td>80%</td>
              <td className="highlighted-col">80%</td>
              <td className="gay-col">NOT REPORTED</td>
            </tr>
          </tbody>
        </Table>
        <div className="d-flex justify-content-end">
          <div className="attendance-resume">
            <p className="field-description">CLASS AVG.</p>
            <p className="field-value">5.33%</p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

Gradebook.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Gradebook;
