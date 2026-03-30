import React, { ChangeEvent, ReactElement, useEffect, useMemo, useState } from 'react';
import { Button, Card, CardBody, Col, Input, Row } from 'reactstrap';
import { NextPageWithLayout } from '@/pages/_app';

import CourseLayout from '@/components/own/course-layout/course-layout';
import TabsTeachers from '@/components/own/tabs-teachers/tabs-teachers';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import Swal from 'sweetalert2';
import { FaCertificate, FaFileAlt } from 'react-icons/fa';
import {
  getCourseById,
  getCourseWithStudents,
  getGradingItems,
  getGradingPercentageBySyllabus,
} from '../../../../helper/api-data/course';
import { getAttendanceByCourseAndStudent } from '../../../../helper/api-data/attendance';
import { getGradesByCourse, getGradesByCourseAndStudent } from '../../../../helper/api-data/student-grades';
import StudentReportTable from '@/components/own/tables/student-report-table';
import Image from 'next/image';
import { ImgPath } from '../../../../utils/Constant';
import { getFinalPercentageBySyllabusId } from '../../../../helper/api-data/syllabus';
import useFilteredGradingItems from '../../../../hooks/useFilteredGradingItems';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import { COURSE_TAB_NAMES, APP_PATHS } from 'utils/constants';
import { generateBatchCertificatesZIP, generateBatchReportsZIP } from '../../../../utils/pdfGenerator';
import { STUDENT_REPORT_CONSTANTS } from '../../../../utils/studentReportConstants';
import {
  formatMissingItemsHtml,
  getMissingGradeItemsByStudent,
} from '../../../../utils/emissionValidation';
import {
  buildGradebookStructure,
  calculateFinalGradingStatus,
  calculateTotalAverage,
  formatGradebookComponents,
} from '../../../../utils/utils';

const StudentReport: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const [statusFilter, setStatusFilter] = useState(
    STUDENT_REPORT_CONSTANTS.FILTERS.ALL
  );

  
  const { canPermission, permissionSet } = usePermission();
  const canViewStudentReports = canPermission(PERMISSIONS.VIEW_STUDENT_REPORTS);
  
  const courseDetail = useSWR(
    courseId ? `/course/get-one/${courseId}` : null,
    () => getCourseById(courseId)
  );
  
  useEffect(() => {
    if (permissionSet && !canViewStudentReports) {
      router.replace(APP_PATHS.DASHBOARD);
    }
  }, [permissionSet, canViewStudentReports, router]);

  const courseStudents = useSWR(
    courseId ? `/course/get-students/${courseId}` : null,
    () => getCourseWithStudents(courseId!.toString())
  );

  const studentAttendance = useSWR(
    courseId && selectedStudentId
      ? `/attendance/get-attendance-by-student/course/${courseId}/student/${selectedStudentId}`
      : null,
    () =>
      getAttendanceByCourseAndStudent(courseId!.toString(), selectedStudentId)
  );

  const gradesByStudent = useSWR(
    courseId && selectedStudentId
      ? `/student-grades/get-grades-by-course-and-student/${courseId}/${selectedStudentId}`
      : null,
    () => getGradesByCourseAndStudent(courseId!.toString(), selectedStudentId)
  );

  const gradesByCourse = useSWR(
    courseId ? `/student-grades/get-grades-by-course/${courseId}` : null,
    () => getGradesByCourse(courseId!.toString())
  );

  const gradingItems = useSWR(
    courseId ? `/course/get-grading-items/${courseId}` : null,
    () => getGradingItems(courseId)
  );

  const filteredGradingItems = useFilteredGradingItems(
    gradingItems?.data?.data
  );

  const gradingPercentage = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/student-grades/get-grades-by-course/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getGradingPercentageBySyllabus(
        courseDetail?.data?.data?.syllabus_id!.toString()
      )
  );

  const notesPercentages = useSWR(
    courseDetail?.data?.data?.syllabus_id
      ? `/syllabus/get-percentages-by-syllabus/${courseDetail?.data?.data?.syllabus_id}`
      : null,
    () =>
      getFinalPercentageBySyllabusId(
        courseDetail?.data?.data?.syllabus_id!.toString()
      )
  );

  const changeSelectedStudent = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSelectedStudentId(value);
    const student = filteredStudents?.find(
      (s: any) => s.id == value
    );

    setSelectedStudent(student);
  };

  const normalizeStatus = (value?: string) =>
    (value || '')
      .toUpperCase()
      .replace(/[_\s]+/g, ' ')
      .trim();

  const isPassStatus = (status?: string) => {
    const normalized = normalizeStatus(status);
    const passLabel = normalizeStatus(STUDENT_REPORT_CONSTANTS.STATUS.PASS);
    return normalized === passLabel || normalized.startsWith(`${passLabel} (`);
  };

  const isFailStatus = (status?: string) => {
    const normalized = normalizeStatus(status);
    const failLabel = normalizeStatus(STUDENT_REPORT_CONSTANTS.STATUS.FAIL);
    return (
      normalized === failLabel ||
      normalized.startsWith(`${failLabel} (`) ||
      normalized.startsWith('FAILED')
    );
  };

  const isNotReportedStatus = (status?: string) => {
    const normalized = normalizeStatus(status);
    const notReported = normalizeStatus(STUDENT_REPORT_CONSTANTS.STATUS.NOT_REPORTED);
    const notResulted = normalizeStatus(STUDENT_REPORT_CONSTANTS.STATUS.NOT_RESULTED);

    return (
      normalized === notReported ||
      normalized === notResulted ||
      normalized.startsWith(notReported) ||
      normalized.startsWith(notResulted)
    );
  };

  const allStudents = courseStudents?.data?.data?.students || [];

  const componentsGradebook = useMemo(
    () => formatGradebookComponents(filteredGradingItems),
    [filteredGradingItems]
  );

  const gradebookStructure = useMemo(
    () =>
      buildGradebookStructure(
        filteredGradingItems,
        allStudents,
        gradesByCourse?.data?.data || []
      ),
    [filteredGradingItems, allStudents, gradesByCourse?.data?.data]
  );

  const studentStatusMap = useMemo(() => {
    if (!allStudents?.length) return {};
    if (!gradingPercentage?.data?.data || !notesPercentages?.data?.data) return {};

    return allStudents.reduce((acc: Record<string, string>, student: any) => {
      const totalAverage = calculateTotalAverage(
        gradebookStructure,
        componentsGradebook,
        String(student.id),
        gradingPercentage.data.data
      );
      const status = calculateFinalGradingStatus(
        notesPercentages.data.data,
        totalAverage
      );
      acc[String(student.id)] = status;
      return acc;
    }, {});
  }, [
    allStudents,
    gradingPercentage?.data?.data,
    notesPercentages?.data?.data,
    gradebookStructure,
    componentsGradebook,
  ]);

  const filteredStudents = useMemo(() => {
    if (statusFilter === STUDENT_REPORT_CONSTANTS.FILTERS.ALL) {
      return allStudents;
    }

    return allStudents.filter((student: any) => {
      const studentStatus = studentStatusMap[String(student.id)] || '';

      if (statusFilter === STUDENT_REPORT_CONSTANTS.FILTERS.PASS) {
        return isPassStatus(studentStatus);
      }

      if (statusFilter === STUDENT_REPORT_CONSTANTS.FILTERS.FAIL) {
        return isFailStatus(studentStatus);
      }

      if (statusFilter === STUDENT_REPORT_CONSTANTS.FILTERS.NOT_REPORTED) {
        return isNotReportedStatus(studentStatus);
      }

      return true;
    });
  }, [allStudents, statusFilter, studentStatusMap]);

  useEffect(() => {
    if (!selectedStudentId) return;
    const existsInFilteredList = filteredStudents.some(
      (student: any) => String(student.id) === String(selectedStudentId)
    );

    if (!existsInFilteredList) {
      setSelectedStudentId('');
      setSelectedStudent('');
    }
  }, [filteredStudents, selectedStudentId]);

  const selectedCourseNumericId = Number(courseId);
  const filteredStudentIdsForBatch = filteredStudents
    .map((student: any) => Number(student.id))
    .filter((id: number) => Number.isFinite(id));

  const shouldApplyBatchFilter =
    Number.isFinite(selectedCourseNumericId) &&
    allStudents.length > 0 &&
    filteredStudentIdsForBatch.length >= 0;

  const batchFilterOptions = shouldApplyBatchFilter
    ? {
        studentIdsByCourse: {
          [selectedCourseNumericId]: filteredStudentIdsForBatch,
        },
      }
    : undefined;

  const handleBatchDownloadReports = async () => {
    if (!courseId) return;

    const missingByStudent = filteredStudents
      .map((student: any) => {
        const missingItems = getMissingGradeItemsByStudent(
          filteredGradingItems,
          gradesByCourse?.data?.data || [],
          student.id
        );
        return {
          student,
          missingItems,
        };
      })
      .filter((entry: any) => entry.missingItems.length > 0);

    if (missingByStudent.length > 0) {
      const html = missingByStudent
        .map(({ student, missingItems }: any) => {
          const studentName = student?.name || `Student ${student?.id}`;
          return `<div style="text-align:left;margin-bottom:12px;"><p style="margin:0 0 6px 0;"><strong>${studentName}</strong></p>${formatMissingItemsHtml(missingItems)}</div>`;
        })
        .join('');

      await Swal.fire({
        title: 'Missing grades detected',
        html: `<p style="text-align:left;">Complete missing grades before generating reports:</p>${html}`,
        icon: 'warning',
        confirmButtonText: 'Understood',
      });
      return;
    }

    setIsDownloading(true);
    Swal.fire({
      title: 'Generating Reports...',
      text: `Processing 1 course. This may take several minutes depending on the number of students. Please keep this tab open and wait for completion.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showClass: { popup: '' },
      hideClass: { popup: '' },
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      await generateBatchReportsZIP(
        [parseInt(courseId as string, 10)],
        batchFilterOptions
      );
      Swal.close();
      Swal.fire({
        title: 'Download Completed!',
        text: `Reports have been generated successfully. The ZIP file should start downloading automatically.`,
        icon: 'success',
        confirmButtonText: 'Perfect',
        confirmButtonColor: '#28a745',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    } catch (error) {
      console.error('Error downloading reports:', error);
      Swal.close();
      Swal.fire({
        title: 'Download Failed',
        text: `We couldn't generate reports. Please try again or contact support.`,
        icon: 'error',
        confirmButtonText: 'Understood',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    }
    setIsDownloading(false);
  };

  const handleBatchDownloadCertificates = async () => {
    if (!courseId) return;

    const missingByStudent = filteredStudents
      .map((student: any) => {
        const missingItems = getMissingGradeItemsByStudent(
          filteredGradingItems,
          gradesByCourse?.data?.data || [],
          student.id
        );
        return {
          student,
          missingItems,
        };
      })
      .filter((entry: any) => entry.missingItems.length > 0);

    if (missingByStudent.length > 0) {
      const html = missingByStudent
        .map(({ student, missingItems }: any) => {
          const studentName = student?.name || `Student ${student?.id}`;
          return `<div style="text-align:left;margin-bottom:12px;"><p style="margin:0 0 6px 0;"><strong>${studentName}</strong></p>${formatMissingItemsHtml(missingItems)}</div>`;
        })
        .join('');

      await Swal.fire({
        title: 'Missing grades detected',
        html: `<p style="text-align:left;">Complete missing grades before generating certificates:</p>${html}`,
        icon: 'warning',
        confirmButtonText: 'Understood',
      });
      return;
    }

    setIsDownloading(true);
    Swal.fire({
      title: 'Generating Certificates...',
      text: `Processing 1 course. This may take several minutes depending on the number of students. Please keep this tab open and wait for completion.`,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      showClass: { popup: '' },
      hideClass: { popup: '' },
      didOpen: () => {
        Swal.showLoading();
      }
    });
    try {
      await generateBatchCertificatesZIP(
        [parseInt(courseId as string, 10)],
        batchFilterOptions
      );
      Swal.close();
      Swal.fire({
        title: 'Download Completed!',
        text: `Certificates have been generated successfully. The ZIP file should start downloading automatically.`,
        icon: 'success',
        confirmButtonText: 'Perfect',
        confirmButtonColor: '#28a745',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    } catch (error) {
      console.error('Error downloading certificates:', error);
      Swal.close();
      Swal.fire({
        title: 'Download Failed',
        text: `We couldn't generate certificates. Please try again or contact support.`,
        icon: 'error',
        confirmButtonText: 'Understood',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    }
    setIsDownloading(false);
  };

  const shouldRenderStudentReport =
    courseStudents?.data?.data &&
    gradingPercentage?.data?.data &&
    filteredGradingItems.length > 0 &&
    gradesByStudent?.data?.data &&
    courseDetail?.data?.data &&
    notesPercentages?.data?.data &&
    selectedStudentId;
  return permissionSet && canViewStudentReports ? (
    <Card tag='section'>
      <CardBody>
        {courseDetail?.data?.data && (
          <TabsTeachers
            numberOfClass={courseDetail?.data?.data?.course_number}
            tabsName={COURSE_TAB_NAMES.STUDENT_REPORT}
          />
        )}

        <div className='report-container'>
          <Row className='align-items-center'>
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={8}
            >
              <div className='student-selector'>
                <p className='field-description'>STUDENT</p>

                <Input
                  type='select'
                  name='statusFilter'
                  id='statusFilter'
                  className='report-student-filter'
                  value={statusFilter}
                  onChange={(e: ChangeEvent<HTMLInputElement>) =>
                    setStatusFilter(e.target.value)
                  }
                >
                  {STUDENT_REPORT_CONSTANTS.FILTERS.OPTIONS.map((option) => (
                    <option
                      key={`student-report-status-filter-${option.value}`}
                      value={option.value}
                    >
                      {option.label}
                    </option>
                  ))}
                </Input>

                <Input
                  type='select'
                  name='student'
                  id='studentFilter'
                  className='report-student-filter'
                  value={selectedStudentId}
                  onChange={changeSelectedStudent}
                >
                  <option value=''>Select the student</option>
                  {filteredStudents?.map((student: any) => (
                    <option
                      value={student?.id}
                      key={`student-report-${student?.id}`}
                    >
                      {student?.name?.toUpperCase()}
                    </option>
                  ))}
                </Input>
                <Image
                  className='warning-logo'
                  src={`${ImgPath}/course/warning-icon.png`}
                  alt='logo'
                  width={50}
                  height={70}
                />
              </div>
            </Col>
            <Col
              xs={12}
              sm={12}
              md={12}
              lg={4}
            >
              <div className={`${STUDENT_REPORT_CONSTANTS.CSS_CLASSES.DOWNLOAD_CONTAINER} mt-2 mt-lg-2 justify-content-lg-end ms-lg-3`}>
                <Button
                  color="secondary"
                  onClick={handleBatchDownloadReports}
                  disabled={isDownloading || !courseId || filteredStudents.length === 0}
                  className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
                  title="Download all reports of this course"
                >
                  <FaFileAlt size={18} />
                  Download all Reports
                </Button>
                <Button
                  color="primary"
                  onClick={handleBatchDownloadCertificates}
                  disabled={isDownloading || !courseId || filteredStudents.length === 0}
                  className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
                  title="Download all certificates of this course"
                >
                  <FaCertificate size={18} />
                  Download all Certificates
                </Button>
              </div>
            </Col>

            {shouldRenderStudentReport && (
              <StudentReportTable
                courseDetail={courseDetail?.data?.data}
                students={courseStudents?.data?.data?.students}
                studentAttendance={studentAttendance?.data?.data}
                gradingPercentage={gradingPercentage?.data?.data}
                gradingItems={filteredGradingItems}
                gradesByStudent={gradesByStudent?.data?.data}
                notesPercentages={notesPercentages?.data?.data}
                selectedStudentId={selectedStudentId}
                setSelectedStudentId={selectedStudentId}
                selectedStudent={selectedStudent}
              />
            )}
          </Row>
        </div>
      </CardBody>
    </Card>
  ) : null;
};

StudentReport.getLayout = function getLayout(page: ReactElement) {
  return <CourseLayout>{page}</CourseLayout>;
};

export default StudentReport;
