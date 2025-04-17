import React, { useEffect, useMemo, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
import { toast } from 'react-toastify';
import DataTable from 'react-data-table-component';
import { FaUsers } from 'react-icons/fa6';

import {
  updateStatusStudent,
  updateStudentLevelChangeStatus,
  getPendingStudentTransfers,
} from 'helper/api-data/student';

import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import StudentForm from '../form/student-form';
import StudentDetail from '../student-detail/student-datail';
import StudentTransferForm from '../form/student-transfer-form';

import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import usePermission from '../../../../hooks/usePermission';
import { USER_TYPES } from '../../../../utils/constants';
import { getUserRoleFromLocalStorage } from '../../../../utils/auth';
import { setQueryStringValue, clearQueryString } from '../../../../utils/utils';
import { getNextLevel } from 'utils/levelProgression';
import { FaUser } from 'react-icons/fa';

const StudentsTable = ({
  students,
  page,
  rowPerPage,
  filters,
  loading,
  onSelectedStudentsChange,
}: any) => {
  const router = useRouter();
  const { userRole } = usePermission();
  const isCoordinator = userRole === USER_TYPES.COORDINATOR;

  // Estados para modales
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<any[]>([]);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [isGroupTransfer, setIsGroupTransfer] = useState(false);

  // Para limpiar la selección de filas en DataTable
  const [toggleClearRows, setToggleClearRows] = useState(false);


 

  // Limpia la selección de filas
  const clearSelections = () => {
    setSelectedStudents([]);
    setToggleClearRows((prev) => !prev);
    if (onSelectedStudentsChange) {
      onSelectedStudentsChange(0);
    }
  };

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
    if (!isOpen) clearSelections();
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
    if (!isOpenDetail) clearSelections();
  };

  // Actualiza estado del estudiante (activo/inactivo)
  const updateStatus = async (data: any) => {
    try {
      const newStatus = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatusStudent(data.id, newStatus);
      if (response.statusCode === 200) {
        // Limpia query + recarga
        clearQueryString(router);
        mutate([
          `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${
            filters ? `&${filters}` : ''
          }`,
        ]);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
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

  // Transferencia individual
  const handleTransferIndividual = (row: any) => {
    setSelectedData(row);
    setIsGroupTransfer(false);
    setIsTransferModalOpen(true);
    clearSelections();
  };

  // Transferencia grupal
  const handleTransferGroup = () => {
    if (selectedStudents.length < 5) {
      Swal.fire({
        title: 'Error',
        text: 'You need to select at least 5 students for group transfer',
        icon: 'error',
        confirmButtonText: 'OK',
      });
      return;
    }
    // Validar que todos estén en el mismo level
    const levels = selectedStudents.map((s) =>
      typeof s.level === 'object'
        ? s.level?.name || s.level?.full_level
        : s.level
    );
    const uniqueLevels = Array.from(new Set(levels));

    if (uniqueLevels.length > 1) {
      Swal.fire({
        title: 'Warning',
        text: 'All selected students must be from the same level for group transfer',
        icon: 'warning',
        confirmButtonText: 'OK',
      });
      return;
    }

    setIsGroupTransfer(true);
    setIsTransferModalOpen(true);
  };

  // Aprobación / Rechazo a nivel grupal
  const handleGroupAction = (action: 'approved' | 'rejected') => {
    if (selectedStudents.length < 5) {
      toast.error(
        `You need to select at least 5 students to ${
          action === 'approved' ? 'approve' : 'reject'
        } level change`
      );
      return;
    }
    const levels = selectedStudents.map((s) => s.level);
    const uniqueLevels = Array.from(new Set(levels));

    if (uniqueLevels.length > 1) {
      toast.warning(
        `All selected students must be from the same level for group ${
          action === 'approved' ? 'approval' : 'rejection'
        }`
      );
      return;
    }

    const allPending = selectedStudents.every(
      (student) => student.status_level_change === 'pending'
    );
    if (!allPending) {
      toast.warning(
        'All selected students must have pending status for group action'
      );
      return;
    }

    Swal.fire({
      title: `${action === 'approved' ? 'Approve' : 'Reject'} Level Change`,
      text:
        action === 'approved'
          ? `Are you sure you want to approve level change for ${
              selectedStudents.length
            } students from ${uniqueLevels[0]} to ${getNextLevel(uniqueLevels[0])}?`
          : `Are you sure you want to reject level change for ${selectedStudents.length} students?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${
        action === 'approved' ? 'approve' : 'reject'
      }!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const promises = selectedStudents.map((student) =>
            updateStudentLevelChangeStatus(student.id, action)
          );
          await Promise.all(promises);

          // Limpia query + recarga
          clearQueryString(router);
          mutate([
            `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${
              filters ? `&${filters}` : ''
            }`,
          ]);

          Swal.fire({
            title: 'Success!',
            text:
              action === 'approved'
                ? `${selectedStudents.length} students approved for level change from ${
                    uniqueLevels[0]
                  } to ${getNextLevel(uniqueLevels[0])}`
                : `${selectedStudents.length} students rejected for level change`,
            icon: 'success',
            confirmButtonText: 'OK',
          });
          setSelectedStudents([]);
        } catch (error) {
          console.error(
            `Error ${
              action === 'approved' ? 'approving' : 'rejecting'
            } students:`,
            error
          );
          toast.error(
            `Error ${
              action === 'approved' ? 'approving' : 'rejecting'
            } students`
          );
        }
      }
    });
  };

  const handleGroupApprove = () => handleGroupAction('approved');
  const handleGroupReject = () => handleGroupAction('rejected');

  // Aprobaciones individuales
  const handleApproveReject = (row: any, action: 'approved' | 'rejected') => {
    if (action === 'approved' && !canApproveLevel(row.level)) {
      toast.warning(
        'Need at least 5 pending students of the same level to approve'
      );
      return;
    }

    Swal.fire({
      title: `Are you sure you want to ${
        action === 'approved' ? 'approve' : 'reject'
      } this student?`,
      text: `You are about to ${
        action === 'approved' ? 'approve' : 'reject'
      } the level change for this student`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: `Yes, ${
        action === 'approved' ? 'approve' : 'reject'
      }!`,
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStudentLevelChangeStatus(row.id, action).then(() => {
          // Limpia query + recarga
          clearQueryString(router);
          mutate([
            `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${
              filters ? `&${filters}` : ''
            }`,
          ]);
          toast.success(`Student ${action} successfully`);
          if (action === 'approved') {
            Swal.fire({
              title: 'Level Change Approved!',
              text: `The student has been approved for level change from ${row.level} to ${getNextLevel(
                row.level
              )}`,
              icon: 'success',
              confirmButtonText: 'OK',
            });
          }
        });
      } else {
        clearSelections();
      }
    });
  };

  const countPendingStudentsByLevel = (level: string) => {
    if (!students?.data?.result) return 0;
    return students.data.result.filter(
      (student: any) =>
        student.level === level && student.status_level_change === 'pending'
    ).length;
  };

  const canApproveLevel = (level: string) => {
    return countPendingStudentsByLevel(level) >= 5;
  };

  // Callback cuando cambian las filas seleccionadas en DataTable
  const handleRowSelected = (state: any) => {
    setSelectedStudents(state.selectedRows);
    if (onSelectedStudentsChange) {
      onSelectedStudentsChange(state.selectedRows.length);
    }
  };

  if (loading) {
    return (
      <TableSkeleton
        rows={10}
        columns={12}
        showHeader
        animated
      />
    );
  }

  if (!students?.data?.result) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => {

        return (
          <div className='d-flex align-items-center gap-2'>
            <TableActionButtons
              onView={() => toggleDetail(row)}
              onBlock={() => handleAlert(row)}
              onEdit={() => toggle(row)}
              onTransfer={() => handleTransferIndividual(row)}
              status={row.status === 'active' ? false : true}
            />
          </div>
        );
      },
      minWidth: '240px',
      sortable: false,
      center: false,
    },
    {
      name: 'ID',
      selector: (row: any) => row.cedula,
      sortable: true,
      center: false,
    },
    {
      name: 'Student name',
      selector: (row: any) => row.user.name,
      sortable: true,
      center: false,
    },
    {
      name: 'Email',
      selector: (row: any) => row.user.email,
      sortable: true,
      center: false,
    },
    {
      name: 'Phone',
      selector: (row: any) =>
        row.phone_number?.trim() ? row.phone_number : 'No phone number',
      sortable: true,
      center: false,
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
      center: false,
    },
    {
      name: 'Course',
      selector: (row: any) =>
        row.course[0]?.course_name ? row.course[0].course_name : '',
      sortable: true,
      center: false,
    },
    {
      name: 'Course No',
      selector: (row: any) =>
        row.course[0]?.course_number ? row.course[0].course_number : '',
      sortable: true,
      center: false,
    },
    {
      name: 'Level',
      selector: (row: any) => {
        if (!row.level) return '';
        if (typeof row.level === 'string') return row.level;
        if (typeof row.level === 'object') {
          return row.level.name || row.level.full_level || '';
        }
        return '';
      },
      sortable: true,
      center: false,
    },
    {
      name: 'Promotion',
      selector: (row: any) => row.promotion ?? '',
      sortable: true,
      center: false,
    },
    {
      name: 'Age Category',
      selector: (row: any) => row.age_category ?? '',
      sortable: true,
      center: false,
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
      center: false,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      {/* Opciones de grupo solo para Coordinador */}
      {isCoordinator && (
        <div className='mb-3'>
          <div className='d-flex justify-content-between'>
            <div className='btn-group'>
              <button
                className='btn btn-primary'
                onClick={handleTransferGroup}
                disabled={selectedStudents.length < 5}
                title={
                  selectedStudents.length < 5
                    ? 'Select at least 5 students for group transfer'
                    : ''
                }
                id='transferGroupBtn'
              >
                Transfer Selected Students ({selectedStudents.length})
              </button>
              <button
                className='btn btn-success ml-2'
                onClick={handleGroupApprove}
                disabled={selectedStudents.length < 5}
              >
                Approve Level Change
              </button>
              <button
                className='btn btn-danger ml-2'
                onClick={handleGroupReject}
                disabled={selectedStudents.length < 5}
              >
                Reject Level Change
              </button>
            </div>
            <div>
              {selectedStudents.length > 0 && (
                <div className='alert alert-info p-2 mb-0'>
                  {selectedStudents.length < 5 ? (
                    <small>Select at least 5 students for group transfer</small>
                  ) : (
                    <small>Ready for group transfer</small>
                  )}
                </div>
              )}
            </div>
          </div>
          {selectedStudents.length >= 5 && (
            <div className='mt-2 alert alert-warning p-2'>
              <small>
                <strong>Note:</strong> For level change approval, all selected
                students must be from the same level and have pending status.
              </small>
            </div>
          )}
        </div>
      )}

      {/* Opciones de grupo para otros roles */}
      {!isCoordinator && (
        <div className='mb-3 d-flex justify-content-between align-items-center'>
          <button
            className='btn btn-primary'
            onClick={handleTransferGroup}
            disabled={selectedStudents.length < 5}
            title={
              selectedStudents.length < 5
                ? 'Select at least 5 students for group transfer'
                : ''
            }
            id='transferGroupBtn'
          >
            Transfer Selected Students ({selectedStudents.length})
          </button>
          {selectedStudents.length > 0 && (
            <div className='alert alert-info p-2 mb-0'>
              {selectedStudents.length < 5 ? (
                <small>Select at least 5 students for group transfer</small>
              ) : (
                <small>Ready for group transfer</small>
              )}
            </div>
          )}
        </div>
      )}

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
        onSelectedRowsChange={handleRowSelected}
        clearSelectedRows={toggleClearRows}
      />

      {/* Modal crear/editar Student */}
      <StudentForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
        onReload={() => {
          // Limpia query + recarga
          clearQueryString(router);
          mutate([
            `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${
              filters ? `&${filters}` : ''
            }&order=desc&orderBy=createdAt`,
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

      {/* Modal Transferencia */}
      {isTransferModalOpen && (
        <StudentTransferForm
          isOpen={isTransferModalOpen}
          toggle={() => {
            setIsTransferModalOpen(false);
            clearSelections();
          }}
          students={isGroupTransfer ? selectedStudents : [selectedData]}
          isGroupTransfer={isGroupTransfer}
          onSuccess={() => {
            // Limpia query + recarga
            clearQueryString(router);
            mutate([
              `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${
                filters ? `&${filters}` : ''
              }&order=desc&orderBy=createdAt`,
            ]);

            const userRole = getUserRoleFromLocalStorage();
            Swal.fire({
              title: 'Success!',
              text:
                userRole === USER_TYPES.RECEPTIONIST
                  ? 'Transfer request successfully submitted'
                  : `${isGroupTransfer ? selectedStudents.length : 1} student${
                      isGroupTransfer && selectedStudents.length > 1 ? 's' : ''
                    } transferred successfully`,
              icon: 'success',
              confirmButtonText: 'OK',
            });
            setSelectedStudents([]);
            clearSelections();
          }}
        />
      )}
    </div>
  );
};

export default StudentsTable;
