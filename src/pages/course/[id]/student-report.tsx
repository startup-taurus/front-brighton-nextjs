import React, { ChangeEvent, ReactElement, useEffect, useState } from 'react';
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
import { getGradesByCourseAndStudent } from '../../../../helper/api-data/student-grades';
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

const StudentReport: NextPageWithLayout = () => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const [selectedStudentId, setSelectedStudentId] = useState('');
  const [selectedStudent, setSelectedStudent] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);

  
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
    const student = courseStudents?.data?.data?.students?.find(
      (s: any) => s.id == value
    );

    setSelectedStudent(student);
  };

  const handleBatchDownloadReports = async () => {
    if (!courseId) return;
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
      await generateBatchReportsZIP([parseInt(courseId as string, 10)]);
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
      await generateBatchCertificatesZIP([parseInt(courseId as string, 10)]);
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
                  name='student'
                  id='studentFilter'
                  className='report-student-filter'
                  defaultValue={selectedStudentId}
                  onChange={changeSelectedStudent}
                >
                  <option value=''>Select the student</option>
                  {courseStudents?.data?.data?.students?.map((student: any) => (
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
                  disabled={isDownloading || !courseId}
                  className={STUDENT_REPORT_CONSTANTS.CSS_CLASSES.ALIGN_ITEMS_CENTER}
                  title="Download all reports of this course"
                >
                  <FaFileAlt size={18} />
                  Download all Reports
                </Button>
                <Button
                  color="primary"
                  onClick={handleBatchDownloadCertificates}
                  disabled={isDownloading || !courseId}
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
