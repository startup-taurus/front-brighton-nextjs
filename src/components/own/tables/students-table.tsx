import React, {useEffect, useMemo, useState} from 'react';
import useSWR, {mutate} from 'swr';
import {useRouter} from 'next/router';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import {updateStatusStudent, deleteStudent, getStudent} from 'helper/api-data/student';
import { getCourseById, getGradingItems, getGradingPercentageBySyllabus } from 'helper/api-data/course';
import { getGradesByCourseAndStudent } from 'helper/api-data/student-grades';
import { getFinalPercentageBySyllabusId } from 'helper/api-data/syllabus';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import StudentForm from '../form/student-form';
import StudentDetail from '../student-detail/student-datail';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import {
  generateCertificatePDF,
  generateRealStudentData,
  generateReportPDF,
} from '../../../../utils/pdfGenerator';
import {
  formatMissingItemsHtml,
  getMissingGradeItems,
  MissingGradeItem,
} from '../../../../utils/emissionValidation';
import CompleteMissingGradesModal from '@/components/own/modals/complete-missing-grades-modal';

import {setQueryStringValue, clearQueryString} from '../../../../utils/utils';

const StudentsTable = ({
  students,
  page,
  rowPerPage,
  filters,
  loading,
  onSelectedStudentsChange,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [isLoadingStudent, setIsLoadingStudent] = useState(false);
  const [isEmitting, setIsEmitting] = useState<string>('');
  const [missingModalData, setMissingModalData] = useState<{
    isOpen: boolean;
    courseId: number | null;
    studentId: number | null;
    missingItems: MissingGradeItem[];
    gradingItems: any[];
    gradesByStudent: any[];
    gradingPercentages: any;
    notesPercentages: any;
    studentName: string;
    pendingType: 'certificate' | 'report' | null;
    rowData: any;
  }>({
    isOpen: false,
    courseId: null,
    studentId: null,
    missingItems: [],
    gradingItems: [],
    gradesByStudent: [],
    gradingPercentages: null,
    notesPercentages: null,
    studentName: '',
    pendingType: null,
    rowData: null,
  });

  const [toggleClearRows, setToggleClearRows] = useState(false);
  const { canPermission } = usePermission();
  const canView = canPermission(PERMISSIONS.VIEW_STUDENTS);
  const canEdit = canPermission(PERMISSIONS.EDIT_STUDENT);
  const canDelete = canPermission(PERMISSIONS.DELETE_STUDENT);
  const canBlock = canPermission(PERMISSIONS.TOGGLE_STUDENT_STATUS);
  const canDownloadDocument = canPermission(PERMISSIONS.DOWNLOAD_STUDENT_DOCUMENT);
  const showActions = canView || canEdit || canDelete || canBlock || canDownloadDocument;

  const clearSelections = () => {
    setToggleClearRows((prev) => !prev);
    if (onSelectedStudentsChange) {
      onSelectedStudentsChange(0);
    }
  };

  const toggle = async (data: any) => {
    try {
      setIsLoadingStudent(true);
      if (!data.id) {
        setSelectedData(data);
        setIsOpen(!isOpen);
        if (!isOpen) clearSelections();
        return;
      }
      
      const response = await getStudent(data.id);
      if (response.statusCode === 200) {
        setSelectedData(response.data);
        setIsOpen(!isOpen);
        if (!isOpen) clearSelections();
      }
    } catch (error) {
      setSelectedData(data);
      setIsOpen(!isOpen);
      if (!isOpen) clearSelections();
    } finally {
      setIsLoadingStudent(false);
    }
  };

  const toggleDetail = async (data: any) => {
    try {
      setIsLoadingStudent(true);
      if (!data.id) {
        setSelectedData(data);
      } else {
        const response = await getStudent(data.id);
        if (response.statusCode === 200) {
          setSelectedData(response.data);
        } else {
          setSelectedData(data);
        }
      }
    } catch (error) {
      setSelectedData(data);
    } finally {
      setIsLoadingStudent(false);
      setIsOpenDetail(!isOpenDetail);
      if (!isOpenDetail) clearSelections();
    }
  };

  const updateStatus = async (data: any) => {
    try {
      const newStatus = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatusStudent(data.id, newStatus);
      if (response.statusCode === 200) {
        clearQueryString(router);
        mutate([
          `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}&order=desc&orderBy=createdAt`,
        ]);
        clearSelections();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const deleteStudentHandler = async (data: any) => {
    try {
      const response = await deleteStudent(data.id);
      if (response.statusCode === 200) {
        clearQueryString(router);
        mutate([
          `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}&order=desc&orderBy=createdAt`,
        ]);
        clearSelections();
      }
    } catch (error) {
      console.error('Error al eliminar estudiante:', error);
    }
  };

  const getActiveCourseId = (studentRow: any): number | null => {
    if (!Array.isArray(studentRow?.course) || studentRow.course.length === 0) {
      return null;
    }

    const activeCourse =
      studentRow.course.find((course: any) => course?.is_retired === false) ||
      studentRow.course[0];

    const parsed = Number(activeCourse?.id);
    return Number.isFinite(parsed) ? parsed : null;
  };

  const emitDocument = async (row: any, type: 'certificate' | 'report') => {
    const courseId = getActiveCourseId(row);

    if (!courseId) {
      await Swal.fire({
        title: 'No active course',
        text: 'This student does not have an active course to issue documents.',
        icon: 'warning',
        confirmButtonText: 'Understood',
      });
      return;
    }

    const studentId = Number(row?.id);
    if (!Number.isFinite(studentId)) {
      await Swal.fire({
        title: 'Invalid student',
        text: 'Could not identify the selected student.',
        icon: 'error',
        confirmButtonText: 'Understood',
      });
      return;
    }

    const key = `${type}-${studentId}`;
    setIsEmitting(key);

    try {
      const [courseResponse, gradingItemsResponse, gradesResponse] = await Promise.all([
        getCourseById(String(courseId)),
        getGradingItems(String(courseId)),
        getGradesByCourseAndStudent(String(courseId), String(studentId)),
      ]);

      const courseData = courseResponse?.data;
      const gradingItems = gradingItemsResponse?.data || [];
      const gradesByStudent = gradesResponse?.data || [];

      const [gradingPercentagesResponse, notesPercentagesResponse] = await Promise.all([
        getGradingPercentageBySyllabus(String(courseData?.syllabus_id || '')),
        getFinalPercentageBySyllabusId(String(courseData?.syllabus_id || '')),
      ]);

      const gradingPercentages = gradingPercentagesResponse?.data;
      const notesPercentages = notesPercentagesResponse?.data;

      const missingItems = getMissingGradeItems(gradingItems, gradesByStudent);
      if (missingItems.length > 0) {
        const decision = await Swal.fire({
          title: 'Missing grades detected',
          html: `<p style="text-align:left;">You need to complete the following grades before issuing this document:</p>${formatMissingItemsHtml(missingItems)}`,
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
          setMissingModalData({
            isOpen: true,
            courseId,
            studentId,
            missingItems,
            gradingItems,
            gradesByStudent,
            gradingPercentages,
            notesPercentages,
            studentName: row?.user?.name || row?.name || '',
            pendingType: type,
            rowData: row,
          });
        }
        return;
      }

      const studentPayload = {
        ...row,
        name:
          row?.name ||
          row?.user?.name ||
          `${row?.first_name || ''} ${row?.last_name || ''}`.trim(),
      };

      const studentData = await generateRealStudentData(
        studentPayload,
        courseData,
        type === 'certificate'
      );

      if (type === 'certificate') {
        await generateCertificatePDF(studentData);
      } else {
        await generateReportPDF(studentData);
      }

      await Swal.fire({
        title: 'Document generated',
        text:
          type === 'certificate'
            ? 'Certificate generated successfully.'
            : 'Report generated successfully.',
        icon: 'success',
        confirmButtonText: 'Perfect',
      });
    } catch (error) {
      await Swal.fire({
        title: 'Generation failed',
        text: 'We could not generate this document. Please try again.',
        icon: 'error',
        confirmButtonText: 'Understood',
      });
    } finally {
      setIsEmitting('');
    }
  };

  const openDownloadTypeModal = async (row: any) => {
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
      await emitDocument(row, 'certificate');
      return;
    }

    if (decision.isDenied) {
      await emitDocument(row, 'report');
    }
  };

  const handleMissingModalSubmit = async () => {
    const pendingType = missingModalData.pendingType;
    const rowData = missingModalData.rowData;

    setMissingModalData((prev) => ({
      ...prev,
      isOpen: false,
      pendingType: null,
      rowData: null,
    }));

    if (!pendingType || !rowData) {
      return;
    }

    await emitDocument(rowData, pendingType);
  };

  const handleAlert = (row: any) => {
    const status = row?.status === 'active' ? 'deactivate' : 'active';
    Swal.fire({
      title: 'Are you sure to ' + status + '?',
      text: 'You are about to ' + status + ' this user',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, ' + status + '!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row);
      }
      clearSelections();
    });
  };

  const handleDeleteAlert = (data: any) => {
    Swal.fire({
      title: 'Are you sure you want to delete this student?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
    }).then((result) => {
      if (result.isConfirmed) {
        deleteStudentHandler(data);
      }
    });
  };

  if (loading) {
    return <TableSkeleton rows={10} columns={12} showHeader animated />;
  }

  if (!students?.data?.result) return null;

  

  const columns = [
    {
      ...(showActions
        ? {
            name: 'Actions',
            cell: (row: any) => {
              const studentKey = String(row?.id || '');
              const isEmittingCertificate = isEmitting === `certificate-${studentKey}`;
              const isEmittingReport = isEmitting === `report-${studentKey}`;

              return (
                <div className='d-flex align-items-center gap-2 justify-content-start flex-nowrap'>
                  <TableActionButtons
                    onView={canView ? () => toggleDetail(row) : undefined}
                    onBlock={canBlock ? () => handleAlert(row) : undefined}
                    onEdit={canEdit ? () => toggle(row) : undefined}
                    onDelete={canDelete ? () => handleDeleteAlert(row) : undefined}
                    onDownload={canDownloadDocument ? () => openDownloadTypeModal(row) : undefined}
                    downloadDisabled={isEmittingCertificate || isEmittingReport}
                    status={row.status === 'active' ? false : true}
                    module={'Students'}
                  />
                </div>
              );
            },
            width: '320px',
            minWidth: '320px',
            maxWidth: '320px',
            sortable: false,
            right: true,
            center: true,
          }
        : {}),
    } as any,
    {
      name: 'ID',
      selector: (row: any) => row.cedula,
      sortable: true,
      center: true,
    },
    {
      name: 'Student name',
      selector: (row: any) =>
        row.user?.name ? row.user.name.toUpperCase() : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Email',
      selector: (row: any) => row.user?.email,
      sortable: true,
      center: true,
    },
    {
      name: 'Phone',
      selector: (row: any) =>
        row.phone_number?.trim()
          ? row.phone_number.toUpperCase()
          : 'NO PHONE NUMBER',
      sortable: true,
      center: true,
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <span
          className={`badge ${
            row.status === 'active' ? 'badge-success' : 'badge-danger'
          }`}
        >
          {row?.status?.charAt(0).toUpperCase() + row?.status?.slice(1)}
        </span>
      ),
      sortable: true,
      center: true,
    },
    {
      name: 'Course',
      selector: (row: any) =>
        row.course[0]?.course_name
          ? row.course[0].course_name.toUpperCase()
          : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Course No',
      selector: (row: any) =>
        row.course[0]?.course_number
          ? row.course[0].course_number.toUpperCase()
          : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Level',
      selector: (row: any) => {
        if (!row.level) return '';
        if (typeof row.level === 'string') return row.level.toUpperCase();
        if (typeof row.level === 'object') {
          return (row.level.name || row.level.full_level || '').toUpperCase();
        }
        return '';
      },
      sortable: true,
      center: true,
    },
    {
      name: 'Promotion',
      selector: (row: any) =>
        row.promotion ? row.promotion.toUpperCase() : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Age Category',
      selector: (row: any) =>
        row.age_category ? row.age_category.toUpperCase() : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Status payment',
      cell: (row: any) => (
        <span
          className={`badge ${
            row.pending_payments ? 'badge-success' : 'badge-danger'
          }`}
        >
          {row.pending_payments ? 'Pagado' : 'No Pagado'}
        </span>
      ),
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={students?.data.result}
        pagination
        paginationServer
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        paginationTotalRows={students.data.totalCount}
        onChangePage={(newPage) => setQueryStringValue('page', newPage, router)}
        onChangeRowsPerPage={(newPerPage) =>
          setQueryStringValue('rowPerPage', newPerPage, router)
        }
        progressPending={loading}
        highlightOnHover
        selectableRowsHighlight
        clearSelectedRows={toggleClearRows}
      />

      {/* Modal crear/editar Student */}
      <StudentForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
        onReload={() => {
          clearQueryString(router);
          mutate([
            `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}&order=desc&orderBy=createdAt`,
          ]);
          clearSelections();
        }}
      />

      {/* Modal ver detalle Student */}
      <StudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      />

      <CompleteMissingGradesModal
        isOpen={missingModalData.isOpen}
        toggle={() =>
          setMissingModalData((prev) => ({
            ...prev,
            isOpen: !prev.isOpen,
          }))
        }
        courseId={missingModalData.courseId || 0}
        studentId={missingModalData.studentId || 0}
        missingItems={missingModalData.missingItems}
        gradingItems={missingModalData.gradingItems}
        gradesByStudent={missingModalData.gradesByStudent}
        gradingPercentages={missingModalData.gradingPercentages}
        notesPercentages={missingModalData.notesPercentages}
        studentName={missingModalData.studentName}
        onSubmit={handleMissingModalSubmit}
        submitLabel={missingModalData.pendingType === 'certificate' ? 'Save & Download Certificate' : 'Save & Download Report'}
      />
    </div>
  );
};

export default StudentsTable;
