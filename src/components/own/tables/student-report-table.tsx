import React, { useEffect, useMemo, useState } from "react";
import { Col } from "reactstrap";
import ReportTable from "@/components/own/report-table/report-table";
import ReportStatus from "@/components/own/report-status/report-status";
import Link from "next/link";
import { FaRegFilePdf } from "react-icons/fa";
import { Bar } from "react-chartjs-2";
import { barChartOptions } from "../../../../Data/Charts/ChartJsData";
import {
  buildGradebookStructure,
  calculateAssignmentAverage,
  calculateAverage,
  calculateReportExamAverage,
  formatGradebookComponents,
  formatReportBarChartData,
  formatStudentScoreAssignmentsGrades,
  formatStudentScoreExamGrades,
} from "../../../../utils/utils";
import { ComponentsGradebook } from "../../../../Types/GradingItem";
import { DEFAULT_BAR_CHART_DATA } from "../../../../utils/constants";

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

const examPageCols = [
  {
    name: "NO.",
    className: "highlighted-col text-center",
    selector: (row: any) => row.id,
  },
  {
    name: "EXAM PAPER",
    selector: (row: any) => row.criterion,
  },
  {
    name: "EXAM",
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

const StudentReportTable = ({
  students,
  courseDetail,
  studentAttendance,
  gradingPercentage,
  gradingItems,
  gradesByStudent,

  selectedStudentId,
}: any) => {
  const [componentsGradebook, setComponentsGradebook] =
    useState<ComponentsGradebook>({
      assignments: [],
      progressTest: [],
      moversExam: [],
    });

  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [examData, setExamData] = useState<any[]>([]);

  const [assignmentsAverage, setAssignmentsAverage] = useState("0");
  const [examAverage, setExamAverage] = useState("0");
  const [reportChartData, setReportChartData] = useState<any>(
    DEFAULT_BAR_CHART_DATA,
  );

  const gradingGrade = useMemo(
    () =>
      buildGradebookStructure(
        gradingItems,
        [{ id: selectedStudentId }],
        gradesByStudent,
      ),
    [gradingItems, selectedStudentId, gradesByStudent],
  );

  useEffect(() => {
    const components = formatGradebookComponents(gradingItems);
    setComponentsGradebook(components);
  }, [gradingItems]);

  useEffect(() => {
    const assignments = calculateAverage(
      gradingGrade,
      componentsGradebook.assignments,
      selectedStudentId,
    );
    const progressTest = calculateAverage(
      gradingGrade,
      componentsGradebook.progressTest,
      selectedStudentId,
    );
    const moversExam = calculateAverage(
      gradingGrade,
      componentsGradebook.moversExam,
      selectedStudentId,
    );

    const assignmentsScore = formatStudentScoreAssignmentsGrades(
      { assignments, progressTest, moversExam },
      courseDetail?.course_name,
    );

    const result = formatStudentScoreExamGrades(
      componentsGradebook.moversExam,
      courseDetail?.course_name,
      selectedStudentId,
      gradingGrade,
    );

    const assignmentAverage = calculateAssignmentAverage(
      {
        assignments,
        progressTest,
      },
      gradingPercentage,
    );

    const reportExamAverage = calculateReportExamAverage(
      componentsGradebook.moversExam,
      gradingGrade,
      selectedStudentId,
    );

    const chartFormattedData = formatReportBarChartData(
      componentsGradebook.moversExam,
      gradingGrade,
      selectedStudentId,
    );

    setAssignmentsAverage(assignmentAverage);
    setExamData(result);
    setExamAverage(reportExamAverage);
    setAssignmentsData(assignmentsScore);
    setReportChartData(chartFormattedData);
  }, [gradingGrade, componentsGradebook, selectedStudentId]);

  return (
    <>
      <Col xs={12} sm={12} md={12} lg={8}>
        <div className="mt-4">
          <div className="attendance-resume">
            <p className="field-description">ATTENDANCE</p>
            <p className="field-value">
              {studentAttendance ? studentAttendance?.attendancePercentage : 0}%
            </p>
          </div>
        </div>
        {assignmentsData && assignmentsData?.length > 0 && (
          <ReportTable
            data={assignmentsData}
            columns={assignmentsTestCols}
            resumeRowTitle={`ASSIGNMENTS (${gradingPercentage?.assig_percentage}%) + TESTS (${gradingPercentage?.test_percentage}%)`}
            finalPercentage={assignmentsAverage}
          />
        )}
        {examData && examData?.length > 0 && (
          <ReportTable
            data={examData}
            columns={examPageCols}
            resumeRowTitle={`EXAM (${gradingPercentage?.exam_percentage}%)`}
            finalPercentage={examAverage}
          />
        )}
        <div className="d-flex flex-column flex-md-row justify-content-between">
          <ReportStatus
            field="GPA"
            status="NOT REPORTED"
            statusPercentage="4.5%"
          />
          <div className="d-flex download-container gap-2">
            <Link
              className="brighton-download-btn"
              target="_blank"
              href="https://chiispiitas.github.io/Brighton/Certificate%20Generator/index.html?student=JEAN%20PAUL%20SANTOS%20CUADROS&program=General%20English&level=B1%20PRE-INTERMEDIATE&short-level=B1&assignments=90%&assignments-total=22.5%&assignments-status=PASS&tests=0&tests-status=FAIL&exam=PRELIM.&reading=0%&reading-status=&listening=0%&listening-status=&writing=0%&writing-status=&speaking=0%&speaking-status=&general-exams-total=0%&gpa=4.5%%20(NOT%20REPORTED)&final=NOT%20REPORTED&password=Brighton1234@"
            >
              Download
            </Link>
            <FaRegFilePdf style={{ width: "40px", height: "40px" }} />
          </div>
        </div>
      </Col>
      <Col xs={12} sm={12} md={12} lg={4}>
        {reportChartData && (
          <div className="chart-container">
            <Bar
              data={reportChartData}
              options={barChartOptions}
              width={778}
              height={400}
              style={{ width: "100%" }}
            />
          </div>
        )}
      </Col>
    </>
  );
};

export default StudentReportTable;
