import React, { useState, useEffect, useContext } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import {
  getCourseWithProfessors,
  updateStatusCourse,
} from 'helper/api-data/course';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import DataTable from 'react-data-table-component';
import CourseForm from '../form/course-form';
import { getFiltersString } from '../../../../utils/utils';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';
import { UserContext } from 'helper/User';
import { USER_TYPES } from '../../../../utils/constants';

const CoursesTable = ({ reload, loading }: any) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;
  const filters = getFiltersString(router);

  useEffect(() => {
    mutate([
      `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ]);
  }, [reload]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);

    if (isOpen) {
      mutate([
        `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
      ]);
    }
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
          mutate([
            `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
          ]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === 'active' ? 'inactive' : 'active';
      const response = await updateStatusCourse(data.id, status);
      if (response.statusCode === 200) {
        mutate([
          `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
        ]);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    }
  };

  const handleAttendance = (row: any) => {
    router.push({
      pathname: `/course/${row.id}/attendance`,
      query: { professorId: row.professor?.user_id }
    });
  };

  const {
    data: courses,
    error,
    isLoading,
  } = useSWR(
    [
      `/course/get-all-with-professors?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ],
    () => getCourseWithProfessors(page, rowPerPage, filters)
  );

  const showLoading = loading || isLoading;

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

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert(row)}
          onAttendance={user?.role !== USER_TYPES.ADMIN ? () => handleAttendance(row) : undefined}
          stauts={row.status === 'active' ? false : true}
        />
      ),
      width: '200px',
      minWidth: '200px',
      maxWidth: '200px',
      sortable: false,
      center: true,
    },
    {
      name: 'N° of course',
      selector: (row: any) => `${row.course_number}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Name',
      selector: (row: any) => `${row.course_name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Professor',
      selector: (row: any) => `${row.professor?.user?.name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Classroom',
      selector: (row: any) => row.classroom ? `${row.classroom}`.toUpperCase() : '',
      sortable: true,
      center: true,
    },
    {
      name: 'Start date',
      selector: (row: any) => `${row.start_date}`,
      sortable: true,
      center: true,
    },
    {
      name: 'End date',
      selector: (row: any) => {
        if (row.end_date) {
          return `${row.end_date}`;
        } else if (row.start_date) {
          const startDate = new Date(row.start_date);
          const endDate = new Date(startDate);
          endDate.setMonth(endDate.getMonth() + 3);
          return endDate.toISOString().split('T')[0];
        } else {
          return '';
        }
      },
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
      name: 'Type',
      selector: (row: any) => `${row.course_type}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Schedule',
      selector: (row: any) => row.schedule ? `${row.schedule}`.toUpperCase() : '',
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={courses.data.result}
        progressPending={showLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={courses.data.totalCount}
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
      <CourseForm
        isOpen={isOpen}
        toggle={toggle}
        data={selectedData}
      />
    </div>
  );
};

export default CoursesTable;