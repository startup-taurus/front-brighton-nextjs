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
  calculateFinalGradingStatus,
  calculateReportExamAverage,
  calculateStudentAverage,
  calculateTotalAverage,
  formatExamParams,
  formatGradebookComponents,
  formatReportBarChartData,
  formatReportUrl,
  formatStudentScoreAssignmentsGrades,
  formatStudentScoreExamGrades,
} from "../../../../utils/utils";
import { ComponentsGradebook } from "../../../../Types/GradingItem";
import {
  DEFAULT_BAR_CHART_DATA,
  EXAMS_TYPE,
} from "../../../../utils/constants";

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
  selectedStudent,
  courseDetail,
  studentAttendance,
  gradingPercentage,
  gradingItems,
  gradesByStudent,
  notesPercentages,
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
  const [studentTotalAverage, setStudentTotalAverage] = useState("0");
  const [reportChartData, setReportChartData] = useState<any>(
    DEFAULT_BAR_CHART_DATA,
  );

  const [reportURL, setReportURL] = useState<string>("");

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

    const assignmentsFormatedData = formatStudentScoreAssignmentsGrades(
      { assignments, progressTest, moversExam },
      courseDetail?.course_name,
    );

    const examFormatedData = formatStudentScoreExamGrades(
      componentsGradebook.moversExam,
      courseDetail?.course_name,
      selectedStudentId,
      gradingGrade,
      notesPercentages,
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

    const studentAverage = calculateStudentAverage(
      {
        assignments,
        progressTest,
        moversExam,
      },
      gradingPercentage,
    );

    const examProps = formatExamParams(examFormatedData);
    const gpaResult = calculateFinalGradingStatus(
      notesPercentages,
      studentAverage,
    );

    const url = formatReportUrl({
      student: selectedStudent?.name,
      ageGroup: courseDetail?.age_group,
      level: courseDetail?.course_name,
      assignments: `${assignmentsFormatedData[0]?.score}%`,
      assignmentsStatus: assignmentsFormatedData[0]?.grade,
      assignmentsTotal: assignmentAverage,
      tests: `${assignmentsFormatedData[1]?.score}%`,
      testsStatus: assignmentsFormatedData[1]?.grade,
      exam:
        courseDetail?.age_group === "adult"
          ? EXAMS_TYPE.PRELIM
          : EXAMS_TYPE.MOVERS,
      generalExamsTotal: reportExamAverage,
      gpa: `${studentAverage}% (${gpaResult})`,
      final: `${gpaResult}`,
      ...examProps,
    });

    setReportURL(!!url ? url.href : "");

    setStudentTotalAverage(studentAverage);

    setAssignmentsAverage(assignmentAverage);
    setExamAverage(reportExamAverage);

    setAssignmentsData(assignmentsFormatedData);
    setExamData(examFormatedData);

    setReportChartData(chartFormattedData);
  }, [gradingGrade, componentsGradebook, selectedStudentId]);

  const generateReportUrl = () => {
    const url = formatReportUrl({
      student: selectedStudent?.student,
      ageGroup: courseDetail?.age_group,
      level: courseDetail?.course_name,
    });
  };

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
            statusPercentage={`${studentTotalAverage}%`}
          />
          <div className="d-flex download-container gap-2">
            <Link
              className="brighton-download-btn"
              target="_blank"
              href={reportURL}
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
