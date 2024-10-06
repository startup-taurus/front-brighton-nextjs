import React, { ReactElement } from "react";
import { Button, Card, CardBody, Col, Input, Row } from "reactstrap";
import { NextPageWithLayout } from "@/pages/_app";

import CourseLayout from "@/components/own/course-layout/course-layout";
import TabsTeachers from "@/components/own/tabs-teachers/tabs-teachers";
import ReportTable from "@/components/own/report-table/report-table";
import Image from "next/image";
import { ImgPath } from "../../../utils/Constant";
import { Bar } from "react-chartjs-2";
import { barChartOptions } from "../../../Data/Charts/ChartJsData";
import ReportStatus from "@/components/own/report-status/report-status";
import Link from "next/link";
import { FaRegFilePdf } from "react-icons/fa";

const tabsName = "GRADEBOOK";
const numberOfClass = "F-16°";

const assignmentsTestCols = [
  {
    name: "NO.",
    className: "highlighted-col text-center",
    selector: (row: any) => row.id,
  },
  {
    name: "CRITERION",
    selector: (row: any) => row.criterion,
  },
  {
    name: "LEVEL",
    selector: (row: any) => row.level,
  },
  {
    name: "SCORE",
    selector: (row: any) => row.score,
  },
  {
    name: "GRADE",
    selector: (row: any) => row.grade,
  },
];

const assignmentsTestData = [
  {
    id: 1,
    criterion: "ASSIGNMENTS",
    level: "B1",
    score: "97.7%",
    grade: "PASS",
  },
  {
    id: 2,
    criterion: "TEST",
    level: "B1",
    score: "0.0%",
    grade: "FAIL",
  },
];

const barChartData = {
  labels: ["READING", "WRITING", "LISTENING", "SPEAKING"],
  datasets: [
    {
      label: "SKILLS",
      backgroundColor: "rgba(255, 167 ,0, 1)",
      highlightFill: "rgba(255, 151 , 0, 1)",
      borderWidth: 2,
      data: [0.25, 0.5, 1, 0.75],
    },
  ],
};

const Gradebook: NextPageWithLayout = () => {
  return (
    <Card tag="section">
      <CardBody>
        <TabsTeachers numberOfClass={numberOfClass} tabsName={tabsName} />
        <div className="report-container">
          <Row>
            <Col xs={12} sm={12} lg={8}>
              <div className="student-selector">
                <p className="field-description">STUDENT</p>
                <Input
                  type="select"
                  name="student"
                  id="studentFilter"
                  className="report-student-filter"
                >
                  <option value="" disabled>
                    Seleccione al estudiante
                  </option>
                  <option value={1}>JEAN PAUL SANTOS CUADROS</option>
                </Input>
                <Image
                  src={`${ImgPath}/course/warning-icon.png`}
                  alt="logo"
                  width={50}
                  height={70}
                />
              </div>
              <div className="mt-4">
                <div className="attendance-resume">
                  <p className="field-description">ATTENDANCE</p>
                  <p className="field-value">33.33%</p>
                </div>
              </div>
              <ReportTable
                data={assignmentsTestData}
                columns={assignmentsTestCols}
                resumeRowTitle="ASSIGNMENTS (5%) + TESTS (15%)"
              />
              <ReportTable
                data={assignmentsTestData}
                columns={assignmentsTestCols}
                resumeRowTitle="ASSIGNMENTS (5%) + TESTS (15%)"
              />
              <div className="d-flex flex-column flex-md-row justify-content-between">
                <ReportStatus
                  field="GPA"
                  status="NOT REPORTED"
                  statusPercentage="4.5%"
                />
                <div className="d-flex download-container gap-2">
                  <Link
                    className="brighton-download-btn"
                    href="https://chiispiitas.github.io/Brighton/Certificate%20Generator/index.html?student=JEAN%20PAUL%20SANTOS%20CUADROS&program=General%20English&level=B1%20PRE-INTERMEDIATE&short-level=B1&assignments=90%&assignments-total=22.5%&assignments-status=PASS&tests=0&tests-status=FAIL&exam=PRELIM.&reading=0%&reading-status=&listening=0%&listening-status=&writing=0%&writing-status=&speaking=0%&speaking-status=&general-exams-total=0%&gpa=4.5%%20(NOT%20REPORTED)&final=NOT%20REPORTED&password=Brighton1234@"
                  >
                    Download
                  </Link>
                  <FaRegFilePdf style={{ width: "40px", height: "40px" }} />
                </div>
              </div>
            </Col>
            <Col xs={12} sm={12} lg={4}>
              <div className="chart-container">
                <Bar
                  data={barChartData}
                  options={barChartOptions}
                  width={778}
                  height={400}
                />
              </div>
            </Col>
          </Row>
        </div>
      </CardBody>
    </Card>
  );
};

Gradebook.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default Gradebook;
