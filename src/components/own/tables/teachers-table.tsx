import React, {useState, useEffect} from 'react';
import useSWR, {mutate} from 'swr';
import {useRouter} from 'next/router';
import {
  getAllProfessors,
  updateStatusProfessor,
} from 'helper/api-data/professor';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import TeacherForm from '../form/teacher-form';
import {getFiltersString} from '../../../../utils/utils';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';

const TeachersTable = ({reload}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;
  const filters = getFiltersString(router);

  const toggle = (data: any, forceUpdate = false) => {
    setSelectedData(data);
    setIsOpen(!isOpen);

    if (isOpen && forceUpdate) {
      mutateData();
    }
  };

  const mutateData = () => {
    mutate([
      `/professor/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters} ` : ''}`,
    ]);

    mutate(
      (key) => typeof key === 'string' && key.startsWith('/professor/'),
      undefined,
      {revalidate: true}
    );
  };

  const handleAlert = (row: any) => {
    let status = row?.status === 'active' ? 'deactivate' : 'active';
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
        updateStatus(row).then(() => {
          mutateData();
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatusProfessor(data.id, status);
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const {
    data: professors,
    error,
    isLoading,
  } = useSWR(
    `/professor/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    () => getAllProfessors(page, rowPerPage, filters)
  );

  if (isLoading) {
    return (
      <TableSkeleton rows={10} columns={8} showHeader={true} animated={true} />
    );
  }

  if (!professors?.data?.result) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onBlock={() => handleAlert(row)}
          onEdit={() => toggle(row)}
          stauts={row.status === 'active' ? false : true}
        />
      ),
      minWidth: '140px',
      sortable: false,
      center: true,
    },
    {
      name: 'ID',
      selector: (row: any) => `${row.cedula}`,
      sortable: true,
      center: true,
    },
    {
      name: 'Names',
      selector: (row: any) => `${row.user.name}`.toUpperCase(),
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
      name: 'Phone',
      selector: (row: any) => `${row.phone}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Hourly Rate',
      selector: (row: any) => `${row.hourly_rate}`.toUpperCase(),
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
      name: 'Last login',
      selector: (row: any) => new Date(row.user.last_login).toLocaleString(),
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={professors.data.result}
        progressPending={isLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={professors.data.totalCount}
        onChangePage={(page) => {
          router.push({
            pathname: router.pathname,
            query: {...router.query, page},
          });
        }}
        onChangeRowsPerPage={(newPerPage) => {
          router.push({
            pathname: router.pathname,
            query: {...router.query, rowPerPage: newPerPage},
          });
        }}
        highlightOnHover
        selectableRows={false}
      />
      <TeacherForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
        onReload={mutateData}
      />
      {/* <TeacherDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      /> */}
    </div>
  );
};

export default TeachersTable;
