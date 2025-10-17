import React, { useState, useEffect } from 'react';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { updateStatusUser, resetFailedAttempts } from 'helper/api-data/user';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import UserForm from '../form/user-form';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { USER_TYPES } from 'utils/constants';
import { setQueryStringValue, clearQueryString } from '../../../../utils/utils';

const UsersTable = ({
  users,
  page,
  rowPerPage,
  filters,
  loading,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
  };

  const updateStatus = async (data: any) => {
    try {
      const newStatus = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatusUser(data.id, newStatus);
      if (response.statusCode === 200) {
        const currentUserType = router.query.user_type;
        if (currentUserType) {
          router.push({
            pathname: router.pathname,
            query: { user_type: currentUserType }
          }, undefined, { shallow: true });
        } else {
          clearQueryString(router);
        }
        mutate([
          `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
        ]);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const activateUser = async (data: any) => {
    try {
      const response = await resetFailedAttempts(data.id);
      if (response.statusCode === 200) {
        const currentUserType = router.query.user_type;
        if (currentUserType) {
          router.push({
            pathname: router.pathname,
            query: { user_type: currentUserType }
          }, undefined, { shallow: true });
        } else {
          clearQueryString(router);
        }
        mutate([
          `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
        ]);
      }
    } catch (error) {
      console.error('Error al activar usuario:', error);
    }
  };

  const handleAlert = (row: any) => {
    if (row.status === 'inactive' && row.failed_attempts >= 5) {
      Swal.fire({
        title: 'Are you sure you want to unlock this user?',
        text: 'This will activate the user and reset failed attempts ',
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, unlock!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
      }).then((result) => {
        if (result.isConfirmed) {
          activateUser(row);
        }
      });
    } else {
      const status = row?.status === 'active' ? 'deactivate' : 'activate';
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
      });
    }
  };

  if (loading) {
    return <TableSkeleton rows={10} columns={9} showHeader animated />;
  }

  if (!users?.data?.result) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert(row)}
          status={row.status === 'active' ? false : true}
        />
      ),
      width: '200px',
      minWidth: '200px',
      maxWidth: '200px',
      sortable: false,
      center: true,
    },
    {
      name: 'Names',
      selector: (row: any) => `${row.name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Username',
      selector: (row: any) => `${row.username}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Email',
      selector: (row: any) => `${row.email}`,
      sortable: true,
      center: true,
    },
    {
      name: 'Rol',
      cell: (row: any) => (
        <span
          className={`badge ${
            row.role === USER_TYPES.PROFESSOR
              ? 'badge-primary'
              : row.role === USER_TYPES.STUDENT
                ? 'badge-info'
                : row.role === USER_TYPES.ADMIN
                  ? 'badge-warning'
                  : 'badge-secondary'
          }`}
        >
          {row.role.charAt(0).toUpperCase() +
            row.role.slice(1).replace('_', ' ')}
        </span>
      ),
      sortable: true,
      center: true,
    },
    {
      name: 'Status',
      cell: (row: any) => (
        <span
          className={`badge ${row.status === 'active' ? 'badge-success' : 'badge-danger'}`}
        >
          {row?.status?.charAt(0).toUpperCase() + row?.status?.slice(1)}
        </span>
      ),
      sortable: true,
      center: true,
    },
    {
      name: 'Failed Attempts',
      selector: (row: any) =>
        row.failed_attempts != null ? row.failed_attempts : 0,
      sortable: true,
      center: true,
    },
    {
      name: 'Created At',
      selector: (row: any) => new Date(row.created_at).toLocaleString(),
      sortable: true,
      center: true,
    },
    {
      name: 'Last Login',
      selector: (row: any) => new Date(row.last_login).toLocaleString(),
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={users.data.result}
        pagination
        paginationServer
        paginationTotalRows={users.data.totalCount}
        progressPending={loading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        onChangePage={(newPage) => setQueryStringValue('page', newPage, router)}
        onChangeRowsPerPage={(newPerPage) =>
          setQueryStringValue('rowPerPage', newPerPage, router)
        }
        highlightOnHover
        selectableRows={false}
      />
      <UserForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
      />
    </div>
  );
};

export default UsersTable;