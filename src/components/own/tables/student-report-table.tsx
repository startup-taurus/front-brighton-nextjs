import React, { useEffect, useMemo, useState } from "react";
import { Col, Button } from "reactstrap";
import ReportTable from "@/components/own/report-table/report-table";
import ReportStatus from "@/components/own/report-status/report-status";
import Link from "next/link";
import { FaRegFilePdf, FaFileAlt } from "react-icons/fa";
import { generateCertificatePDF, generateReportPDF } from "../../../../utils/pdfGenerator";
import { StudentData } from "../../../../Types/ReportTypes";
import { toast } from "react-toastify";
import { Bar } from "react-chartjs-2";
import Swal from 'sweetalert2';
import { mutate } from 'swr';
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
} from "../../../../utils/constants";
import { STUDENT_REPORT_CONSTANTS } from "../../../../utils/studentReportConstants";
import {
  formatMissingItemsHtml,
  getMissingGradeItems,
  MissingGradeItem,
} from '../../../../utils/emissionValidation';
import CompleteMissingGradesModal from '@/components/own/modals/complete-missing-grades-modal';

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
  const [isMissingModalOpen, setIsMissingModalOpen] = useState(false);
  const [missingItems, setMissingItems] = useState<MissingGradeItem[]>([]);
  const [pendingDownloadType, setPendingDownloadType] = useState<string | null>(null);

  const norm = (s?: string) =>
    (s || "")
      .toUpperCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();

  const findRow = (rows: any[], name: string) =>
    rows?.find((r) => norm(r.criterion) === norm(name));

  const pickYLE = (examRows: any[]) => {
    const readingWriting = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_WRITING_ALT) || 
                          findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING_AND_WRITING);
    const listening = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
    const speaking = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
    return {
      readingAndWriting: readingWriting?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingAndWritingStatus: readingWriting?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: listening?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: listening?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: speaking?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: speaking?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    };
  };

  const pickGeneral = (examRows: any[]) => {
    const reading = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.READING);
    const listening = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.LISTENING);
    const writing = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.WRITING);
    const speaking = findRow(examRows, STUDENT_REPORT_CONSTANTS.EXAM_SKILLS.SPEAKING);
    return {
      reading: reading?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      readingStatus: reading?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      listening: listening?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      listeningStatus: listening?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      writing: writing?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      writingStatus: writing?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      speaking: speaking?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      speakingStatus: speaking?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
    };
  };

  const isYLEorKEY = (t?: string) =>
    [EXAMS_TYPE.STARTERS, EXAMS_TYPE.MOVERS, EXAMS_TYPE.FLYERS, EXAMS_TYPE.KEY]
      .includes((t || "").toUpperCase());

  const generateStudentData = (includeCertificateFields = false): StudentData => {
    const currentExamType =
      courseDetail?.syllabus?.exam_type ||
      getExamType(courseDetail?.course_name, courseDetail?.age_group);

    const assignmentScore = assignmentsData?.[0];
    const progressTestScore = assignmentsData?.[1];

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
      assignments: assignmentScore?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsTotal: assignmentsAverage || STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      assignmentsStatus: assignmentScore?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      ...(includeCertificateFields && {
        assignmentsIndividual: assignmentScore?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
        assignmentsIndividualStatus: assignmentScore?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
      }),
      progressTests: progressTestScore?.score?.toString() ?? STUDENT_REPORT_CONSTANTS.DEFAULT_VALUES.ZERO,
      progressTestsStatus: progressTestScore?.grade ?? STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED,
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
    type: string,
    generateFunction: (data: StudentData) => Promise<void>
  ) => {
    if (!selectedStudent || !courseDetail) {
      toast.error(STUDENT_REPORT_CONSTANTS.MESSAGES.NO_DATA_ERROR);
      return;
    }

    try {
      const detectedMissingItems = getMissingGradeItems(gradingItems, gradesByStudent);

      if (detectedMissingItems.length > 0) {
        const htmlDetails = formatMissingItemsHtml(detectedMissingItems);
        setMissingItems(detectedMissingItems);

        const decision = await Swal.fire({
          title: 'Missing grades detected',
          html: `<p style="text-align:left;">You need to complete the following grades before issuing this document:</p>${htmlDetails}`,
          icon: 'warning',
          showCloseButton: false,
          showCancelButton: true,
          confirmButtonText: 'Complete now',
          cancelButtonText: 'Cancel',
          cancelButtonColor: '#6c757d',
          heightAuto: false,
          scrollbarPadding: false,
          didOpen: () => {
            const popup = Swal.getPopup();
            const actions = Swal.getActions();
            const htmlContainer = Swal.getHtmlContainer();

            if (popup) {
              popup.style.maxHeight = '88vh';
              popup.style.display = 'flex';
              popup.style.flexDirection = 'column';
              popup.style.overflow = 'hidden';
            }

            if (htmlContainer) {
              htmlContainer.style.flex = '1 1 auto';
              htmlContainer.style.minHeight = '0';
              htmlContainer.style.maxHeight = 'none';
              htmlContainer.style.overflowY = 'auto';
              htmlContainer.style.paddingRight = '0.5rem';
            }

            if (actions) {
              actions.style.position = 'sticky';
              actions.style.bottom = '0';
              actions.style.background = '#fff';
              actions.style.paddingTop = '0.75rem';
              actions.style.marginTop = '0';
              actions.style.zIndex = '2';
            }
          },
        });

        if (decision.isConfirmed) {
          setPendingDownloadType(type);
          setIsMissingModalOpen(true);
        }
        return;
      }

      setIsGenerating(true);
      
      const studentData = generateStudentData(type === STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE);
      await generateFunction(studentData);
      
      const successMessage = type === STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE       
        ? STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE_SUCCESS
        : STUDENT_REPORT_CONSTANTS.MESSAGES.REPORT_SUCCESS;
      toast.success(successMessage);
    } catch (error) {
      const errorMessage = type === STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE 
        ? STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE_ERROR
        : STUDENT_REPORT_CONSTANTS.MESSAGES.REPORT_ERROR;
      console.error(errorMessage, error);
      toast.error(errorMessage);
    } finally {
      setIsGenerating(false);
    }
  };

  const refreshGrades = async () => {
    if (!selectedStudentId || !courseDetail?.id) return;

    await Promise.all([
      mutate(
        `/student-grades/get-grades-by-course-and-student/${courseDetail.id}/${selectedStudentId}`
      ),
      mutate(`/student-grades/get-grades-by-course/${courseDetail.id}`),
    ]);
  };

  const handleGenerateCertificate = async () => {
    await handlePDFGeneration(STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE, generateCertificatePDF);
  };

  const handleGenerateReport = async () => {
    await handlePDFGeneration(STUDENT_REPORT_CONSTANTS.MESSAGES.REPORT, generateReportPDF);
  };

  const handleOpenDownloadModal = async () => {
    if (!selectedStudent || !courseDetail || isGenerating) {
      return;
    }

    const decision = await Swal.fire({
      title: 'Download document',
      text: 'Choose what you want to download for this student.',
      icon: 'question',
      showDenyButton: true,
      confirmButtonText: 'Certificate',
      denyButtonText: 'Report',
      allowOutsideClick: true,
      allowEscapeKey: true,
    });

    if (decision.isConfirmed) {
      await handleGenerateCertificate();
      return;
    }

    if (decision.isDenied) {
      await handleGenerateReport();
    }
  };

  const handleMissingModalSubmit = async () => {
    const downloadType = pendingDownloadType;

    setPendingDownloadType(null);
    setIsMissingModalOpen(false);

    if (!downloadType) {
      return;
    }

    await refreshGrades();
    await new Promise((resolve) => setTimeout(resolve, 200));

    if (downloadType === STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE) {
      await handleGenerateCertificate();
      return;
    }

    await handleGenerateReport();
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
      <CompleteMissingGradesModal
        isOpen={isMissingModalOpen}
        toggle={() => setIsMissingModalOpen((prev) => !prev)}
        courseId={courseDetail?.id}
        studentId={selectedStudentId}
        missingItems={missingItems}
        gradingItems={gradingItems}
        gradesByStudent={gradesByStudent}
        gradingPercentages={gradingPercentage}
        notesPercentages={notesPercentages}
        studentName={selectedStudent?.name}
        onCompleted={refreshGrades}
        onSubmit={handleMissingModalSubmit}
        submitLabel={pendingDownloadType === STUDENT_REPORT_CONSTANTS.MESSAGES.CERTIFICATE ? 'Save & Download Certificate' : 'Save & Download Report'}
      />
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
              onClick={handleOpenDownloadModal}
              disabled={!selectedStudent || !courseDetail || isGenerating}
              className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
            >
              <FaFileAlt />
              {isGenerating ? STUDENT_REPORT_CONSTANTS.MESSAGES.GENERATING : 'Download Document'}
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