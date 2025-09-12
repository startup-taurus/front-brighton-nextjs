import React, { useState, useEffect, useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import { getAllHolidays, updateHolidayStatus } from 'helper/api-data/holidays';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import HolidaysForm from '../form/holidays-form';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import { Alert } from 'reactstrap';
import { toast } from 'react-toastify';
import { USER_TYPES } from 'utils/constants';
import { HolidaysTableProps } from '../../../../Types/TableType';

const HolidaysTable = ({ 
  page: propPage,
  rowPerPage: propRowPerPage,
  holidays: propHolidays,
  loading: propLoading,
  reload 
}: HolidaysTableProps) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const { user } = useContext(UserContext);
  const { can } = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const canCreateHoliday = can(PERMISSIONS.CREATE_HOLIDAY);
  const canEditHoliday = can(PERMISSIONS.EDIT_HOLIDAY);
  const canDeleteHoliday = can(PERMISSIONS.DELETE_HOLIDAY);

  const page = propPage ?? (router.query.page ? Number(router.query.page) : 1);
  const rowPerPage = propRowPerPage ?? (router.query.rowPerPage ? Number(router.query.rowPerPage) : 10);

  const {
    data: holidays,
    error,
    isLoading,
  } = useSWR(
    propHolidays && propHolidays.result ? null : [`/holidays/get-all`, page, rowPerPage], 
    () => getAllHolidays(page, rowPerPage)
  );

  useEffect(() => {
    if (!propHolidays || !propHolidays.result) {
      mutate([`/holidays/get-all`, page, rowPerPage]);
    }
  }, [reload, page, rowPerPage, propHolidays]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
    if (isOpen) {
      mutate([`/holidays/get-all`, page, rowPerPage]);
    }
  };

  const handleAlert = (row: any) => {
    let status = row?.status === 'active' ? 'deactivate' : 'activate';
    Swal.fire({
      title: 'Are you sure to ' + status + ' this holiday?',
      text: 'You are about to ' + status + ' this holiday',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, ' + status + '!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row).then(() => {
          mutate([`/holidays/get-all`, page, rowPerPage]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateHolidayStatus(data.id, status);
      if (response.statusCode === 200) {
        mutate([`/holidays/get-all`, page, rowPerPage]);
      }
    } catch (error) {
      console.error('Error updating holiday status:', error);
    }
  };

  const isLoadingData = propLoading ?? isLoading;

  if (isLoadingData) {
    return (
      <TableSkeleton
        rows={10}
        columns={6}
        showHeader={true}
        animated={true}
      />
    );
  }

  const holidaysData = (propHolidays && propHolidays.result) 
    ? propHolidays 
    : holidays?.data;

  if (!holidaysData?.result) return null;

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
      width: '180px',
      minWidth: '180px',
      maxWidth: '180px',
      sortable: false,
      center: true,
    },
    {
      name: 'Holiday Name',
      selector: (row: any) => `${row.holiday_name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Holiday Date',
      selector: (row: any) => `${row.holiday_date}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Description',
      selector: (row: any) => `${row.description || ''}`.toUpperCase(),
      sortable: false,
      center: true,
    },
    {
      name: 'Type',
      selector: (row: any) => `${row.holiday_type}`.toUpperCase(),
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
  ];

  return (
    <div className='table-responsive holidays-table'>
      <DataTable
        columns={columns}
        data={holidaysData.result}
        progressPending={isLoadingData}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={holidaysData.totalCount}
        onChangePage={(page) => {
          router.push({
            pathname: router.pathname,
            query: { ...router.query, page },
          });
        }}
        onChangeRowsPerPage={(newPerPage) => {
          router.push({
            pathname: router.pathname,
            query: { ...router.query, rowPerPage: newPerPage },
          });
        }}
        highlightOnHover
        selectableRows={false}
      />
      <HolidaysForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
      />
    </div>
  );
};

export default HolidaysTable;