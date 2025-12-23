import React, {useEffect, useMemo, useState} from 'react';
import useSWR, {mutate} from 'swr';
import {useRouter} from 'next/router';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import {updateStatusStudent, deleteStudent, getStudent} from 'helper/api-data/student';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import StudentForm from '../form/student-form';
import StudentDetail from '../student-detail/student-datail';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';

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

  const [toggleClearRows, setToggleClearRows] = useState(false);
  const { canPermission } = usePermission();
  const canView = canPermission(PERMISSIONS.VIEW_STUDENTS);
  const canEdit = canPermission(PERMISSIONS.EDIT_STUDENT);
  const canDelete = canPermission(PERMISSIONS.DELETE_STUDENT);
  const showActions = canView || canEdit || canDelete;

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

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
    if (!isOpenDetail) clearSelections();
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
              return (
                <div className='d-flex align-items-center gap-2 justify-content-end'>
                  <TableActionButtons
                    onView={canView ? () => toggleDetail(row) : undefined}
                    onBlock={canEdit ? () => handleAlert(row) : undefined}
                    onEdit={canEdit ? () => toggle(row) : undefined}
                    onDelete={canDelete ? () => handleDeleteAlert(row) : undefined}
                    status={row.status === 'active' ? false : true}
                    module={'Students'}
                  />
                </div>
              );
            },
            width: '200px',
            minWidth: '200px',
            maxWidth: '200px',
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
    </div>
  );
};

export default StudentsTable;
