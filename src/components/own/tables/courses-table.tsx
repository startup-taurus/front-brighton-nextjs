import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import {
  getCourseWithProfessors,
  updateStatusCourse,
  getCourseWithStudents,
  getGradingItems,
} from 'helper/api-data/course';
import { getGradesByCourse } from 'helper/api-data/student-grades';
import { transferAndProgressStudents } from 'helper/api-data/student';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import CourseForm from '../form/course-form';
import StudentTransferForm from '../form/student-transfer-form';
import { getFiltersString } from '../../../../utils/utils';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';
import { UserContext } from 'helper/User';
import { USER_TYPES, STATUS, COURSE_CLIENT_PAGINATION_STATUSES, COURSE_TYPES, PRIVATE_COURSE_TYPES } from '../../../../utils/constants';
import { getClassroomLabel } from '../../../../utils/courseUtils';
import { FaCertificate, FaFileAlt } from 'react-icons/fa';
import { generateBatchCertificatesZIP, generateBatchReportsZIP } from '../../../../utils/pdfGenerator';
import { toast } from 'react-toastify';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const CoursesTable = ({ reload, loading }: any) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { canPermission, permissionSet } = usePermission();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedCourses, setSelectedCourses] = useState<any[]>([]);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [courseToTransfer, setCourseToTransfer] = useState(null);
  const [studentsToTransfer, setStudentsToTransfer] = useState([]);
  const [isDuplicateModalOpen, setIsDuplicateModalOpen] = useState(false);
  const [courseToDuplicate, setCourseToDuplicate] = useState(null);
  const [lastTransferredCourseId, setLastTransferredCourseId] = useState<number | null>(null);
  const [pendingBlockCourseId, setPendingBlockCourseId] = useState<number | null>(null);

  const page = Number(router.query.page) || 1;
  const rowPerPage = Number(router.query.rowPerPage) || 10;
  const statusQuery = typeof router.query.status === 'string' ? router.query.status : '';

  const clientPagination =
    statusQuery === STATUS.COMPLETED ||
    statusQuery === STATUS.INACTIVE ||
    statusQuery === STATUS.ACTIVE;

  const rawFilters = getFiltersString(router);
  const filters =
    statusQuery === STATUS.COMPLETED
      ? rawFilters
          .split('&')
          .filter((kv) => !kv.startsWith('status='))
          .join('&')
      : rawFilters;

  const apiPage = clientPagination ? 1 : page;
  const apiRowPerPage = clientPagination ? 1000 : rowPerPage;

  const apiEndpoint = useMemo(
    () =>
      `/course/get-all-with-professors?page=${apiPage}&rowPerPage=${apiRowPerPage}${filters ? `&${filters}` : ''}`,
    [apiPage, apiRowPerPage, filters]
  );

  const refreshData = useCallback(() => {
    mutate([apiEndpoint]);
  }, [apiEndpoint]);

  useEffect(() => {
    refreshData();
  }, [reload, refreshData]);

  const getNewStatus = (currentStatus: string) => currentStatus === STATUS.ACTIVE ? STATUS.INACTIVE : STATUS.ACTIVE;
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
      text: `${action} for ${count} course(s) have been generated successfully. The ZIP file should start downloading automatically.`,
      icon: 'success',
      confirmButtonText: 'Perfect',
      showClass: { popup: '' },
      hideClass: { popup: '' }
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

  const debugLog = (...args: any[]) => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('[CoursesTable]', ...args);
    }
  };

  const normalizeStatus = (status: any) =>
    typeof status === 'string' ? status.trim().toLowerCase() : '';

  const isCourseCompleted = (row: any) => {
    const normalizedStatus = normalizeStatus(row?.status);

    if (normalizedStatus === STATUS.TRANSFERRED) return false;
    if (normalizedStatus === STATUS.COMPLETED) return true;

    return Boolean(
      row.last_class_date &&
      new Date(row.last_class_date) < new Date()
    );
  };
  
  const isCourseTransferred = (row: any) =>
    normalizeStatus(row?.status) === STATUS.TRANSFERRED;
  
  const hasActiveStudents = (row: any) =>
    typeof row.active_student_count === 'number' && row.active_student_count > 0;

  const isTransferredView = statusQuery === STATUS.TRANSFERRED;

  const toggle = useCallback((data: any) => {
    setSelectedData(data);
    setIsOpen(prev => !prev);
    if (isOpen) refreshData();
  }, [isOpen, refreshData]);

  const getMissingGradesSummary = useCallback(async (courseId: number) => {
    try {
      const [studentsResponse, gradingItemsResponse, gradesResponse] = await Promise.all([
        getCourseWithStudents(String(courseId)),
        getGradingItems(String(courseId)),
        getGradesByCourse(String(courseId)),
      ]);

      const students = Array.isArray(studentsResponse?.data?.students)
        ? studentsResponse.data.students
        : Array.isArray(studentsResponse?.data?.data?.students)
        ? studentsResponse.data.data.students
        : [];

      const isStudentRetired = (student: any) => {
        const retiredValue = student?.is_retired;
        const normalized = String(retiredValue ?? '').toLowerCase();
        return (
          retiredValue === true ||
          retiredValue === 1 ||
          normalized === '1' ||
          normalized === 'true'
        );
      };

      const activeStudents = students.filter((student: any) => {
        const status = String(student?.status || '').toLowerCase();
        return !isStudentRetired(student) && status !== STATUS.INACTIVE;
      });

      const gradingItems = Array.isArray(gradingItemsResponse?.data?.data)
        ? gradingItemsResponse.data.data
        : Array.isArray(gradingItemsResponse?.data)
        ? gradingItemsResponse.data
        : [];

      const gradingItemIds = gradingItems
        .map((item: any) => Number(item?.item_id))
        .filter((id: number) => Number.isFinite(id));

      if (activeStudents.length === 0 || gradingItemIds.length === 0) {
        return { missingCount: 0, studentsWithMissing: 0 };
      }

      const grades = Array.isArray(gradesResponse?.data?.data)
        ? gradesResponse.data.data
        : Array.isArray(gradesResponse?.data)
        ? gradesResponse.data
        : [];

      const gradeMap = new Map<string, any>();
      grades.forEach((gradeRow: any) => {
        const key = `${Number(gradeRow?.student_id)}-${Number(
          gradeRow?.grading_item_id
        )}`;
        gradeMap.set(key, gradeRow?.grade);
      });

      let missingCount = 0;
      const studentsWithMissing = new Set<number>();

      activeStudents.forEach((student: any) => {
        const studentId = Number(student?.id);
        gradingItemIds.forEach((gradingItemId: number) => {
          const key = `${studentId}-${gradingItemId}`;
          const value = gradeMap.get(key);

          if (value === undefined || value === null || value === '') {
            missingCount += 1;
            studentsWithMissing.add(studentId);
          }
        });
      });

      const summary = {
        missingCount,
        studentsWithMissing: studentsWithMissing.size,
      };

      return summary;
    } catch (error) {
      console.error('Error checking missing grades before closing course:', error);
      return null;
    }
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

  const handleAlert = useCallback(async (row: any) => {
    const courseId = Number(row?.id);

    if (!Number.isFinite(courseId)) {
      return;
    }

    setPendingBlockCourseId(courseId);

    const action = getStatusAction(row?.status);
    const willCloseCourse =
      String(row?.status || '').toLowerCase() === STATUS.ACTIVE;

    let missingSummary: { missingCount: number; studentsWithMissing: number } | null = null;

    try {
      if (willCloseCourse) {
        missingSummary = await getMissingGradesSummary(courseId);
      }
    } finally {
      setPendingBlockCourseId(null);
    }

    const showMissingGradesWarning =
      willCloseCourse &&
      !!missingSummary &&
      missingSummary.missingCount > 0;
    
    Swal.fire({
      title: `Are you sure to ${action}?`,
      html: showMissingGradesWarning
        ? `You are about to ${action} this course.<br/><br/><strong>⚠️ Warning:</strong> There are <strong>${missingSummary?.missingCount}</strong> unentered grades in <strong>${missingSummary?.studentsWithMissing}</strong> student(s).`
        : `You are about to ${action} this course.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: willCloseCourse ? `Yes, close anyway` : `Yes, ${action}!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row);
      }
    });
  }, [getMissingGradesSummary, updateStatus]);

  const handleAttendance = useCallback((row: any) => {
    router.push({
      pathname: `/course/${row.id}/attendance`,
      query: { professorId: row.professor?.user_id }
    });
  }, [router]);

  const handleGradebook = useCallback((row: any) => {
    router.push({
      pathname: `/course/${row.id}/gradebook`,
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

    Swal.fire({
      title: `Generating ${actionName}...`,
      text: `Processing ${selectedCourses.length} course(s). This may take several minutes depending on the number of students. Please keep this tab open and wait for completion.`,
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
      const courseIds = selectedCourses.map(course => course.id);
      await downloadFn(courseIds);
  
      Swal.close();
  
      Swal.fire({
        title: 'Download Completed!',
        text: `${actionName} for ${selectedCourses.length} course(s) have been generated successfully. The ZIP file should start downloading automatically.`,
        icon: 'success',
        confirmButtonText: 'Perfect',
        confirmButtonColor: '#28a745',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    } catch (error) {
      console.error(`Error downloading ${actionName.toLowerCase()}:`, error);
  
      Swal.close();
      Swal.fire({
        title: 'Download Failed',
        text: `We couldn't generate ${actionName.toLowerCase()}. Please try again or contact support.`,
        icon: 'error',
        confirmButtonText: 'Understood',
        showClass: { popup: '' },
        hideClass: { popup: '' }
      });
    }
    
    setIsDownloading(false);
  };

  const handleBatchDownloadReports = useCallback(() => 
    processBatchDownload(generateBatchReportsZIP, 'Reports'), 
    [selectedCourses.length]
  );

  const handleBatchDownloadCertificates = useCallback(() => {
    return processBatchDownload(generateBatchCertificatesZIP, 'Certificates');
  }, [selectedCourses.length]);

  const fetchCourseStudents = async (courseId: number) => {
    const courseData = await getCourseWithStudents(courseId.toString());
    return courseData?.data?.students || [];
  };
  const handleTransferCourseWithStudents = useCallback(async (row: any) => {
    try {
      if (isCourseTransferred(row)) {
        toast.info('This course is already transferred. Transfer is disabled.');
        return;
      }
      const students = await fetchCourseStudents(row.id);
      const activeStudents = (students || []).filter(
        (s: any) => s?.status?.toLowerCase() === STATUS.ACTIVE && !s?.is_retired
      );
  
      if (activeStudents.length === 0) {
        toast.error('No hay estudiantes activos para transferir (inactivos/retirados excluidos).');
        return;
      }
  
      const courseWithDuplicateInfo = {
        ...row,
        duplicateInfo: {
          students: activeStudents,
          studentsCount: activeStudents.length,
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
  } = useSWR([apiEndpoint], () => getCourseWithProfessors(apiPage, apiRowPerPage, filters));

  const baseData = courses?.data?.result || [];
  const preFilteredData = baseData;
  const statusPredicateMap: Record<string, (row: any) => boolean> = {
    [STATUS.COMPLETED]: (row: any) => isCourseCompleted(row),
    [STATUS.INACTIVE]: (row: any) => !isCourseCompleted(row) && normalizeStatus(row?.status) === STATUS.INACTIVE,
    [STATUS.ACTIVE]: (row: any) => !isCourseCompleted(row) && normalizeStatus(row?.status) === STATUS.ACTIVE,
    [STATUS.TRANSFERRED]: (row: any) => isCourseTransferred(row),
  };

  const displayedData = useMemo(() => {
    const predicate = statusQuery ? statusPredicateMap[statusQuery] : undefined;
    return preFilteredData.filter(predicate ?? (() => true));
  }, [preFilteredData, statusQuery]);
  const getTransferredSortKey = (row: any) => {
    const last = row.last_class_date ? new Date(row.last_class_date).getTime() : 0;
    const end = row.end_date ? new Date(row.end_date).getTime() : 0;
    return last || end;
  };

  const sortedData = useMemo(() => {
    if (!isTransferredView) return displayedData;
    return [...displayedData].sort((a: any, b: any) => {
      if (lastTransferredCourseId) {
        if (a.id === lastTransferredCourseId) return -1;
        if (b.id === lastTransferredCourseId) return 1;
      }
      return getTransferredSortKey(b) - getTransferredSortKey(a) || (b.id || 0) - (a.id || 0);
    });
  }, [displayedData, isTransferredView, lastTransferredCourseId]);
  const showLoading = loading || isLoading;

  const formatDate = (date: string) => date ? new Date(date).toLocaleDateString('en-US') : '';
  const formatText = (text: string) => text ? text.toUpperCase() : '';
  
  const getStartDate = (row: any) => formatDate(row.first_class_date || row.start_date);
  const getEndDate = (row: any) => formatDate(row.last_class_date || row.end_date);

  const getStatusBadgeClass = (row: any) => {
    if (isCourseTransferred(row)) return 'badge-info';
    if (isCourseCompleted(row)) return 'badge-warning';
    const status = normalizeStatus(row?.status);

    debugLog('status-badge-evaluation', {
      id: row?.id,
      rawStatus: row?.status,
      normalizedStatus: status,
      lastClassDate: row?.last_class_date,
      resolvedCompleted: isCourseCompleted(row),
    });

    return status === STATUS.ACTIVE ? 'badge-success' : 'badge-danger';
  };

  const getStatusBadgeLabel = (row: any) => {
    if (isCourseTransferred(row)) return 'TRANSFERRED';
    if (isCourseCompleted(row)) return 'COMPLETED';
    return formatText(row?.status);
  };

  const columns = useMemo(() => [
    {
      name: 'Actions',
      cell: (row: any) => {
        const transferred = isCourseTransferred(row);
        const canEdit = canPermission(PERMISSIONS.EDIT_COURSE);
        const canBlock = canPermission(PERMISSIONS.TOGGLE_COURSE_STATUS);
        const canAttendance = canPermission(PERMISSIONS.VIEW_ATTENDANCE);
        const canGradebook = canPermission(PERMISSIONS.VIEW_GRADEBOOK);
        const canTransfer = canPermission(PERMISSIONS.TRANSFER_COURSE);
        const showActions =
          canEdit || canBlock || canAttendance || (transferred && canGradebook) || canTransfer;
        return (
          showActions ? (
            <TableActionButtons
              onEdit={canEdit && !transferred ? () => toggle(row) : undefined}
              onBlock={canBlock && !transferred ? () => handleAlert(row) : undefined}
              onAttendance={canAttendance ? () => handleAttendance(row) : undefined}
              onGradebook={canGradebook && transferred && user?.role !== USER_TYPES.ADMIN ? () => handleGradebook(row) : undefined}
              onTransfer={
                canTransfer && !transferred && isCourseCompleted(row) && hasActiveStudents(row)
                  ? () => handleTransferCourseWithStudents(row)
                  : undefined
              }
              blockLoading={pendingBlockCourseId === Number(row.id)}
              status={row.status !== 'active'}
              module='Courses'
            />
          ) : null
        );
      },
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
      selector: getClassroomLabel,
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
        <span className={`badge ${getStatusBadgeClass(row)}`}>
          {getStatusBadgeLabel(row)}
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
  ], [user?.role, toggle, handleAlert, handleAttendance, handleTransferCourseWithStudents, permissionSet, pendingBlockCourseId]);

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
        const levelIdFromSource = (courseToDuplicate as any)?.duplicateInfo?.sourceCourse?.syllabus?.level?.id ?? null;
        const transferResponse = await transferAndProgressStudents(
          studentIds,
          newCourseData.id.toString(),
          levelIdFromSource
        );
        if (transferResponse.statusCode === 200) {
          const sourceCourseId = (courseToDuplicate as any)?.duplicateInfo?.sourceCourse?.id;
          if (sourceCourseId) {
            await updateStatusCourse(sourceCourseId, STATUS.TRANSFERRED);
            setLastTransferredCourseId(sourceCourseId);
          }
        }
        
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
    if ((courseToTransfer as any)?.id) {
      setLastTransferredCourseId((courseToTransfer as any).id);
    }
    resetTransferModal();
    refreshData();
  }, [courseToTransfer, resetTransferModal, refreshData]);

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
        data={sortedData}
        progressPending={showLoading}
        paginationDefaultPage={page}
        paginationPerPage={rowPerPage}
        pagination
        paginationServer={!clientPagination}
        paginationTotalRows={clientPagination ? sortedData.length : courses.data.totalCount}
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
