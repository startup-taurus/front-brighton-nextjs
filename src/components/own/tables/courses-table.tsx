import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import {
  getCourseWithProfessors,
  updateStatusCourse,
  getCourseWithStudents,
} from 'helper/api-data/course';
import { transferAndProgressStudents } from 'helper/api-data/student';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import CourseForm from '../form/course-form';
import StudentTransferForm from '../form/student-transfer-form';
import { getFiltersString } from '../../../../utils/utils';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';
import { UserContext } from 'helper/User';
import { USER_TYPES } from '../../../../utils/constants';
import { FaCertificate, FaFileAlt } from 'react-icons/fa';
import { generateBatchCertificatesZIP, generateBatchReportsZIP } from '../../../../utils/pdfGenerator';
import { toast } from 'react-toastify';

const CoursesTable = ({ reload, loading }: any) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [courseToTransfer, setCourseToTransfer] = useState(null);
  const [studentsToTransfer, setStudentsToTransfer] = useState([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [courseToDuplicate, setCourseToDuplicate] = useState(null);

  const page = Number(router.query.page) || 1;
  const rowPerPage = Number(router.query.rowPerPage) || 10;
  const filters = getFiltersString(router);

  const apiEndpoint = useMemo(() => 
    `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    [page, rowPerPage, filters]
  );

  const refreshData = useCallback(() => {
    mutate([apiEndpoint]);
  }, [apiEndpoint]);

  useEffect(() => {
    refreshData();
  }, [reload, refreshData]);

  const getNewStatus = (currentStatus: string) => currentStatus === 'active' ? 'inactive' : 'active';
  const getStatusAction = (currentStatus: string) => currentStatus === 'active' ? 'deactivate' : 'active';

  const showNoSelectionAlert = (action: string) => {
    Swal.fire({
      title: 'No courses selected',
      text: `Please select at least one course to ${action}.`,
      icon: 'warning',
      confirmButtonText: 'Understood'
    });
  };

  const showSuccessAlert = (action: string, count: number) => {
    Swal.fire({
      title: 'Download completed!',
      text: `${action} for ${count} course(s) have been downloaded in a ZIP file.`,
      icon: 'success',
      confirmButtonText: 'Perfect'
    });
  };

  const showErrorAlert = (action: string) => {
    Swal.fire({
      title: 'Download error',
      text: `There was a problem generating the ${action.toLowerCase()}. Please try again.`,
      icon: 'error',
      confirmButtonText: 'Understood'
    });
  };

  const isCourseCompleted = (row: any) => 
    row.last_class_date && new Date(row.last_class_date) < new Date();

  const toggle = useCallback((data: any) => {
    setSelectedData(data);
    setIsOpen(prev => !prev);
    if (isOpen) refreshData();
  }, [isOpen, refreshData]);

  const handleAlert = useCallback((row: any) => {
    const action = getStatusAction(row?.status);
    
    Swal.fire({
      title: `Are you sure to ${action}?`,
      text: `You are about to ${action} this course`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${action}!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row);
      }
    });
  }, []);

  const updateStatus = useCallback(async (data: any) => {
    try {
      const newStatus = getNewStatus(data?.status);
      const response = await updateStatusCourse(data.id, newStatus);
      
      if (response.statusCode === 200) {
        refreshData();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Error updating course status');
    }
  }, [refreshData]);

  const handleAttendance = useCallback((row: any) => {
    router.push({
      pathname: `/course/${row.id}/attendance`,
      query: { professorId: row.professor?.user_id }
    });
  }, [router]);

  const handleSelectedRowsChange = useCallback((state: any) => {
    setSelectedCourses(state.selectedRows);
  }, []);

  const processBatchDownload = async (downloadFn: Function, actionName: string) => {
    if (selectedCourses.length === 0) {
      showNoSelectionAlert(`download the ${actionName.toLowerCase()}`);
      return;
    }

    setIsDownloading(true);
    
    // Mostrar alerta de progreso
    const progressAlert = Swal.fire({
      title: `Generating ${actionName}...`,
      html: `
        <div style="text-align: left; margin: 20px 0;">
          <p><strong>Processing ${selectedCourses.length} course(s)</strong></p>
          <p>This may take several minutes depending on the number of students.</p>
          <p style="color: #666; font-size: 14px;">Please keep this tab open and wait for completion.</p>
        </div>
        <div style="margin-top: 20px;">
          <div class="spinner-border text-primary" role="status">
            <span class="sr-only">Loading...</span>
          </div>
        </div>
      `,
      allowOutsideClick: false,
      allowEscapeKey: false,
      showConfirmButton: false,
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const courseIds = selectedCourses.map(course => course.id);
      console.log(`🚀 FRONTEND: Starting ${actionName.toLowerCase()} generation`);
      console.log(`📊 FRONTEND: Selected courses count: ${selectedCourses.length}`);
      console.log(`📋 FRONTEND: Selected courses:`, selectedCourses.map(c => ({ 
        id: c.id, 
        name: c.course_name, 
        number: c.course_number 
      })));
      console.log(`🔢 FRONTEND: Course IDs to send:`, courseIds);
      console.log(`🔍 FRONTEND: Course IDs type check:`, courseIds.map(id => ({ id, type: typeof id })));
      
      await downloadFn(courseIds);
      
      // Cerrar alerta de progreso
      Swal.close();
      
      // Mostrar alerta de éxito mejorada
      Swal.fire({
        title: 'Download Completed!',
        html: `
          <div style="text-align: center;">
            <i class="fas fa-check-circle" style="color: #28a745; font-size: 48px; margin-bottom: 15px;"></i>
            <p><strong>${actionName} for ${selectedCourses.length} course(s) have been generated successfully!</strong></p>
            <p style="color: #666;">The ZIP file should start downloading automatically.</p>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Perfect',
        confirmButtonColor: '#28a745'
      });
      
    } catch (error) {
      console.error(`Error downloading ${actionName.toLowerCase()}:`, error);
      
      // Cerrar alerta de progreso
      Swal.close();
      
      // Mostrar alerta de error mejorada
      Swal.fire({
        title: 'Download Failed',
        html: `
          <div style="text-align: center;">
            <i class="fas fa-exclamation-triangle" style="color: #dc3545; font-size: 48px; margin-bottom: 15px;"></i>
            <p><strong>There was an error generating the ${actionName.toLowerCase()}.</strong></p>
            <p style="color: #666;">Please check the browser console for detailed error information.</p>
            <p style="color: #666; font-size: 14px;">You may try again or contact support if the problem persists.</p>
          </div>
        `,
        icon: 'error',
        confirmButtonText: 'Understood',
        confirmButtonColor: '#dc3545'
      });
      
    } finally {
      setIsDownloading(false);
    }
  };

  const handleBatchDownloadReports = useCallback(() => 
    processBatchDownload(generateBatchReportsZIP, 'Reports'), 
    [selectedCourses.length]
  );

  const handleBatchDownloadCertificates = useCallback(() => {
    console.log(`🔍 CALLBACK: Selected courses before processing:`, selectedCourses);
    console.log(`🔍 CALLBACK: Selected courses length:`, selectedCourses.length);
    return processBatchDownload(generateBatchCertificatesZIP, 'Certificates');
  }, [selectedCourses.length]);

  const fetchCourseStudents = async (courseId: number) => {
    const courseData = await getCourseWithStudents(courseId.toString());
    return courseData?.data?.students || [];
  };
  const handleTransferCourseWithStudents = useCallback(async (row: any) => {
    try {
      const students = await fetchCourseStudents(row.id);

      if (students.length === 0) {
        toast.error('No students found in this course to transfer');
        return;
      }

      const courseWithDuplicateInfo = {
        ...row,
        duplicateInfo: {
          students,
          studentsCount: students.length,
          sourceCourse: row,
          isTransfer: true
        }
      };
      
      setCourseToDuplicate(courseWithDuplicateInfo);
      setIsDuplicateModalOpen(true);
    } catch (error) {
      toast.error('Error fetching course students');
    }
  }, []);
  const {
    data: courses,
    error,
    isLoading,
  } = useSWR([apiEndpoint], () => getCourseWithProfessors(page, rowPerPage, filters));

  const showLoading = loading || isLoading;

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US') : '';
  const formatText = (text: string) => text ? text.toUpperCase() : '';
  const getStartDate = (row: any) => formatDate(row.first_class_date || row.start_date);
  const getEndDate = (row: any) => formatDate(row.last_class_date || row.end_date);

  const columns = useMemo(() => [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert(row)}
          onAttendance={user?.role !== USER_TYPES.ADMIN ? () => handleAttendance(row) : undefined}
          onTransfer={isCourseCompleted(row) ? () => handleTransferCourseWithStudents(row) : undefined}
          stauts={row.status !== 'active'}
        />
      ),
      width: '200px',
      sortable: false,
    },
    {
      name: 'N° of course',
      selector: (row: any) => formatText(row.course_number),
      sortable: true,
    },
    {
      name: 'Name',
      selector: (row: any) => formatText(row.course_name),
      sortable: true,
    },
    {
      name: 'Professor',
      selector: (row: any) => formatText(row.professor?.user?.name),
      sortable: true,
    },
    {
      name: 'Classroom',
      selector: (row: any) => formatText(row.classroom),
      sortable: true,
    },
    {
      name: 'Start Date',
      selector: getStartDate,
      sortable: true,
    },
    {
      name: 'End date',
      selector: getEndDate,
      sortable: true,
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <span className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
          {formatText(row?.status)}
        </span>
      ),
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row: any) => formatText(row.course_type),
      sortable: true,
    },
    {
      name: 'Schedule',
      selector: (row: any) => formatText(row.schedule),
      sortable: true,
    },
  ], [user?.role, toggle, handleAlert, handleAttendance, handleTransferCourseWithStudents]);

  const resetTransferModal = useCallback(() => {
    setIsTransferModalOpen(false);
    setCourseToTransfer(null);
    setStudentsToTransfer([]);
  }, []);

  const resetDuplicateModal = useCallback(() => {
    setIsDuplicateModalOpen(false);
    setCourseToDuplicate(null);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, page: newPage },
    });
  }, [router]);

  const handleRowsPerPageChange = useCallback((newPerPage: number) => {
    router.push({
      pathname: router.pathname,
      query: { ...router.query, rowPerPage: newPerPage },
    });
  }, [router]);

  const handleDuplicateSuccess = useCallback(async (newCourseData: any) => {
    try {
      const duplicateInfo = (courseToDuplicate as any)?.duplicateInfo;
      const students = duplicateInfo?.students || [];
      const isTransfer = duplicateInfo?.isTransfer || false;
      
      if (students.length > 0 && newCourseData?.id && isTransfer) {
        const studentIds = students.map((student: any) => student.id);
        const transferResponse = await transferAndProgressStudents(
          studentIds,
          newCourseData.id.toString(),
          null
        );
        
        const message = transferResponse.statusCode === 200
          ? `Course created successfully and ${students.length} students transferred!`
          : 'Course created but error transferring students';
          
        toast[transferResponse.statusCode === 200 ? 'success' : 'error'](message);
      } else {
        const action = isTransfer ? 'created' : 'duplicated';
        const studentInfo = students.length > 0 ? ` with ${students.length} students` : '';
        toast.success(`Course ${action} successfully${studentInfo}!`);
      }
      
      resetDuplicateModal();
      refreshData();
    } catch (error) {
      toast.error('Course created but error adding students');
    }
  }, [courseToDuplicate, resetDuplicateModal, refreshData]);

  const handleTransferSuccess = useCallback(() => {
    toast.success('Students transferred successfully!');
    resetTransferModal();
    refreshData();
  }, [resetTransferModal, refreshData]);

  if (showLoading) {
    return (
      <TableSkeleton
        rows={10}
        columns={12}
        showHeader={true}
        animated={true}
      />
    );
  }

  if (!courses?.data?.result) return null;

  return (
    <div className='table-responsive signal-table'>
      <div className="mb-3 d-flex flex-wrap gap-2 align-items-center">
        <div className="d-flex gap-2">
          <button
            className="btn btn-primary d-flex align-items-center gap-2"
            onClick={handleBatchDownloadReports}
            disabled={isDownloading || selectedCourses.length === 0}
          >
            <FaFileAlt />
            Download Reports ({selectedCourses.length})
          </button>
          <button
            className="btn btn-success d-flex align-items-center gap-2"
            onClick={handleBatchDownloadCertificates}
            disabled={isDownloading || selectedCourses.length === 0}
          >
            <FaCertificate />
            Download Certificates ({selectedCourses.length})
          </button>
        </div>
        {isDownloading && (
          <div className="d-flex align-items-center gap-2 text-muted">
            <div className="spinner-border spinner-border-sm" role="status">
              <span className="visually-hidden">Downloading...</span>
            </div>
            <span>Processing download...</span>
          </div>
        )}
      </div>

      <DataTable
        columns={columns}
        data={courses.data.result}
        progressPending={showLoading}
        paginationDefaultPage={page}
        paginationPerPage={rowPerPage}
        pagination
        paginationServer
        paginationTotalRows={courses.data.totalCount}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
        highlightOnHover
        selectableRows={true}
        onSelectedRowsChange={handleSelectedRowsChange}
        clearSelectedRows={false}
        selectableRowsHighlight={true}
        selectableRowsNoSelectAll={false}
      />
      
      <CourseForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
      />
      
      <CourseForm
        isOpen={isDuplicateModalOpen}
        toggle={resetDuplicateModal}
        data={courseToDuplicate}
        isDuplicateMode={true}
        duplicateInfo={(courseToDuplicate as any)?.duplicateInfo}
        onSuccess={handleDuplicateSuccess}
      />
      
      <StudentTransferForm
        isOpen={isTransferModalOpen}
        toggle={resetTransferModal}
        students={studentsToTransfer}
        isGroupTransfer={true}
        description={`Transfer students from completed course: ${(courseToTransfer as any)?.course_name} (${(courseToTransfer as any)?.course_number})`}
        onSuccess={handleTransferSuccess}
      />
    </div>
  );
};

export default CoursesTable;