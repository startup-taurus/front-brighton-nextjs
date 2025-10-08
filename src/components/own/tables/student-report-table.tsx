import React, { useEffect, useMemo, useState } from "react";
import { Col, Button } from "reactstrap";
import ReportTable from "@/components/own/report-table/report-table";
import ReportStatus from "@/components/own/report-status/report-status";
import Link from "next/link";
import { FaRegFilePdf, FaCertificate, FaFileAlt } from "react-icons/fa";
import { generateCertificatePDF, generateReportPDF } from "../certificate-generator/pdfGenerator";
import { StudentData } from "../../../../Types/ReportTypes";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import { generateBarChartOptions } from "../../../../Data/Charts/ChartJsData";
import {
  buildGradebookStructure,
  calculateAssignmentAverage,
  calculateAverage,
  calculateReportExamAverage,
  calculateStudentAverage,
  calculateFinalGradingStatus, 
  formatExamParams,
  formatGradebookComponents,
  formatReportBarChartData,
  formatStudentScoreAssignmentsGrades,
  formatStudentScoreExamGrades,
  getExamType, 
  isBrowser,
} from "../../../../utils/utils";
import { ComponentsGradebook } from "../../../../Types/GradingItem";
import {
  DEFAULT_BAR_CHART_DATA,
  EXAMS_TYPE,
  STUDENT_REPORT_CONSTANTS,
} from "../../../../utils/constants";

const assignmentsTestCols = [
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.NO,
    className: STUDENT_REPORT_CONSTANTS.CSS_CLASSES.HIGHLIGHTED_COL,
    selector: (row: any) => row.id,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.CRITERION,
    selector: (row: any) => row.criterion,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.LEVEL,
    selector: (row: any) => row.level,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.SCORE,
    selector: (row: any) => `${row.score}%`,  
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.GRADE,
    selector: (row: any) => row.grade,
  },
];

const examPageCols = [
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.NO,
    className: STUDENT_REPORT_CONSTANTS.CSS_CLASSES.HIGHLIGHTED_COL,
    selector: (row: any) => row.id,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.EXAM_PAPER,
    selector: (row: any) => row.criterion,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.EXAM,
    selector: (row: any) => row.examType || row.level,
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.SCORE,
    selector: (row: any) => `${row.score}%`,  
  },
  {
    name: STUDENT_REPORT_CONSTANTS.COLUMNS.GRADE,
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
  const barChartOptions = generateBarChartOptions();

  const [componentsGradebook, setComponentsGradebook] =
    useState<ComponentsGradebook>({
      assignments: [],
      progressTest: [],
      moversExam: [],
    });

  const [assignmentsData, setAssignmentsData] = useState<any[]>([]);
  const [examData, setExamData] = useState<any[]>([]);
  const [assignmentsAverage, setAssignmentsAverage] = useState(STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO);
  const [examAverage, setExamAverage] = useState(STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO);
  const [studentTotalAverage, setStudentTotalAverage] = useState(STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO);
  const [examType, setExamType] = useState<string>(""); 
  const [reportChartData, setReportChartData] = useState<any>(
    DEFAULT_BAR_CHART_DATA,
  );
  const [resultGPA, setResultGPA] = useState<string>(STUDENT_REPORT_CONSTANTS.STATUS.NOT_RESULTED);
  const [isGenerating, setIsGenerating] = useState(false);

  const norm = (s?: string) =>
    (s || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const findRow = (rows: any[], name: string) =>
    rows?.find((r) => norm(r.criterion) === norm(name));

  const pickYLE = (examRows: any[]) => {
    const rw = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_WRITING_ALT) || 
               findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_AND_WRITING);
    const li = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
    const sp = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
    return {
      readingAndWriting: rw?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingAndWritingStatus: rw?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: li?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: li?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: sp?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: sp?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    };
  };

  const pickGeneral = (examRows: any[]) => {
    const rd = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING);
    const li = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
    const wr = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.WRITING);
    const sp = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
    return {
      reading: rd?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingStatus: rd?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: li?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: li?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      writing: wr?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      writingStatus: wr?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: sp?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: sp?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    };
  };

  const isYLEorKEY = (t?: string) =>
    [EXAMS_TYPE.STARTERS, EXAMS_TYPE.MOVERS, EXAMS_TYPE.FLYERS, EXAMS_TYPE.KEY]
      .includes((t || "").toUpperCase());

  const generateStudentData = (includeCertificateFields = false): StudentData => {
    const currentExamType =
      courseDetail?.syllabus?.exam_type ||
      getExamType(courseDetail?.course_name, courseDetail?.age_group);

    const asg = assignmentsData?.[0];
    const pts = assignmentsData?.[1];

    const base: StudentData = {
      student:
        selectedStudent.name ||
        `${selectedStudent.first_name || ''} ${selectedStudent.last_name || ''}`.trim(),
      date: new Date().toISOString().split('T')[0],
      program: courseDetail?.age_group === STUDENT_REPORT_CONSTANTS.AGE_GROUP.ADULT ? 
               STUDENT_REPORT_CONSTANTS.PROGRAMS.GENERAL_ENGLISH : 
               STUDENT_REPORT_CONSTANTS.PROGRAMS.YOUNG_LEARNERS,
      level: courseDetail?.level?.name || courseDetail?.course_name || '',
      shortLevel:
        courseDetail?.level?.short_name ||
        courseDetail?.level?.name?.split(" ")[0] ||
        '',
      assignments: asg?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsTotal: assignmentsAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsStatus: asg?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      ...(includeCertificateFields && {
        assignmentsIndividual: asg?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
        assignmentsIndividualStatus: asg?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      }),
      progressTests: pts?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      progressTestsStatus: pts?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      exam: currentExamType || STUDENT_REPORT_CONSTANTS.EXAM_TYPES.GENERAL,
      readingAndWriting: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingAndWritingStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      yleTotal: examAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      generalExamsTotal: examAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      gpa: `${studentTotalAverage}% (${resultGPA})`,
      final: resultGPA,
    };

    return isYLEorKEY(currentExamType)
      ? { ...base, ...pickYLE(examData) }
      : { ...base, ...pickGeneral(examData) };
  };

  const handlePDFGeneration = async (
    type: 'certificate' | 'report',
    generateFunction: (data: StudentData) => Promise<void>
  ) => {
    if (!selectedStudent || !courseDetail) {
      toast.error(STUDENT_REPORT_CONSTANTS.MESSAGES.NO_DATA_ERROR);
      return;
    }

    try {
      setIsGenerating(true);
      
      const studentData = generateStudentData(type === 'certificate');
      await generateFunction(studentData);
      
      const successMessage = type === 'certificate' 
        ? STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE_SUCCESS
        : STUDENT_REPORT_CONSTANTS.MESSAGES.REPORT_SUCCESS;
      toast.success(successMessage);
    } catch (error) {
      const errorMessage = type === 'certificate' 
        ? STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE_ERROR
        : STUDENT_REPORT_CONSTANTS.MESSAGES.REPORT_ERROR;
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleGenerateCertificate = async () => {
    await handlePDFGeneration('certificate', generateCertificatePDF);
  };

  const handleGenerateReport = async () => {
    await handlePDFGeneration('report', generateReportPDF);
  };

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
  
    const currentExamType = courseDetail?.syllabus?.exam_type || getExamType(courseDetail?.course_name, courseDetail?.age_group);
    setExamType(currentExamType); 
    
    const examFormatedData = formatStudentScoreExamGrades(
      componentsGradebook.moversExam,
      courseDetail?.course_name,
      selectedStudentId,
      gradingGrade,
      notesPercentages,
      currentExamType 
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

    const examProps = formatExamParams(examFormatedData, currentExamType);
    const gpaResult = calculateFinalGradingStatus(
      notesPercentages,
      studentAverage,
    );

    setStudentTotalAverage(studentAverage);

    setAssignmentsAverage(assignmentAverage);
    setExamAverage(reportExamAverage);

    setAssignmentsData(assignmentsFormatedData);
    setExamData(examFormatedData);

    setReportChartData(chartFormattedData);
    setResultGPA(gpaResult);
  }, [gradingGrade, componentsGradebook, selectedStudentId, courseDetail, gradingPercentage, notesPercentages]);

  return (
    <>
      <Col xs={12} sm={12} md={12} lg={8}>
        <div className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.MT_4}>
          <div className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ATTENDANCE_RESUME}>
            <p className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.FIELD_DESCRIPTION}>{STUDENT_REPORT_CONSTANTS.MESSAGES.ATTENDANCE}</p>
            <p className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.FIELD_VALUE}>
              {studentAttendance?.attendancePercentage ? studentAttendance.attendancePercentage : STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO_DECIMAL}%
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
            resumeRowTitle={`${examType} EXAM (${gradingPercentage?.exam_percentage}%)`}
            finalPercentage={examAverage}
          />
        )}
        <div className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.FLEX_COLUMN_MD_ROW}>
          <ReportStatus
            field={STUDENT_REPORT_CONSTANTS.MESSAGES.GPA}
            status={resultGPA}
            statusPercentage={`${studentTotalAverage}%`}
          />
          <div className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.DOWNLOAD_CONTAINER}>
            <Button
              color="primary"
              onClick={handleGenerateCertificate}
              disabled={!selectedStudent || !courseDetail || isGenerating}
              className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
            >
              <FaCertificate />
              {isGenerating ? STUDENT_REPORT_CONSTANTS.MESSAGES.GENERATING : STUDENT_REPORT_CONSTANTS.MESSAGES.DOWNLOAD_CERTIFICATE}
            </Button>
            <Button
              color="secondary"
              onClick={handleGenerateReport}
              disabled={!selectedStudent || !courseDetail || isGenerating}
              className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
            >
              <FaFileAlt />
              {isGenerating ? STUDENT_REPORT_CONSTANTS.MESSAGES.GENERATING : STUDENT_REPORT_CONSTANTS.MESSAGES.DOWNLOAD_REPORT}
            </Button>
          </div>
        </div>
      </Col>
      <Col xs={12} sm={12} md={12} lg={4}>
        {reportChartData && isBrowser() && (
          <div className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.CHART_CONTAINER}>
            <Bar
              data={reportChartData}
              options={barChartOptions}
              width={778}
              height={400}
              style={{ width: STUDENT_REPORT_CONSTANTS.CSS_CLASSES.WIDTH_100 }}
            />
          </div>
        )}
      </Col>
    </>
  );
};

export default StudentReportTable;