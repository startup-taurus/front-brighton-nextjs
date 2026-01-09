import React, { useEffect, useState } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { getFiltersString } from '../../../../utils/utils';
import {
  getAllTransferData,
  rejectTransfer,
} from '../../../../helper/api-data/transfer-data';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { Badge } from 'reactstrap';
import StudentTransferForm from '@/components/own/form/student-transfer-form';
import { getStudentTransfersByTransferDataId } from 'helper/api-data/student-transfer';
import { getActiveCourses, getCourseById } from 'helper/api-data/course';
import { getAllLevels } from 'helper/api-data/level';
import TableActionButtons from '../table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import { USER_ROLES, USER_TYPES } from 'utils/constants';
import { getUserRoleFromLocalStorage } from 'utils/auth';

const TransferStudentsTable = ({ reload }: { reload: boolean }) => {
  const router = useRouter();
  const page = Number(router.query.page || 1);
  const rowPerPage = Number(router.query.rowPerPage || 10);
  const filters = getFiltersString(router);
  const key = `/transfer-data/get-all?page=${page}&limit=${rowPerPage}${filters ? `&${filters}` : ''}`;

  const [selectedTransferId, setSelectedTransferId] = useState<number | null>(
    null
  );
  const [transferStudents, setTransferStudents] = useState<any[]>([]);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [description, setDescription] = useState('');
  const [initialTransferData, setInitialTransferData] = useState<any>(null);
  const [isViewOnly, setIsViewOnly] = useState(false);
  const [isReloading, setIsReloading] = useState(false);
  const userRole = getUserRoleFromLocalStorage();
  const { data: coursesData } = useSWR('/course/get-active', () =>
    getActiveCourses(1, 10)
  );

  interface Level {
    id: number;
    name: string;
  }

  const { data: levelsData } = useSWR(
    ['/level/get-all', page, rowPerPage, filters],
    () => getAllLevels(page, rowPerPage, filters)
  );

  const courseOptions = coursesData?.data?.map((course: any) => ({
    value: course.id,
    label: `${course.course_number} - ${course.course_name}`,
  }));

  const nextLevelOptions = levelsData?.data?.result?.map((level: Level) => ({
    value: level.id,
    label: level.name,
  }));

  const handleOpenTransferDetail = async (id: number, viewOnly = false) => {
    const res = await getStudentTransfersByTransferDataId(id);
    if (res?.data?.length > 0) {
      const transferData = res.data[0]?.transfer_data;
      setTransferStudents(res.data.map((s: any) => s.student));
      setDescription(transferData?.description || '');
      setSelectedTransferId(id);
      setIsViewOnly(viewOnly);

      const selectedCourseOption = courseOptions?.find(
        (option: any) => option.value === transferData.selected_course_id
      );

      const selectedLevelOption = nextLevelOptions?.find(
        (option: any) => option.value === transferData.selected_level_id
      );

      let hydratedCourseLabel: string | undefined =
        selectedCourseOption?.label ||
        transferData.selected_course?.label ||
        (transferData.selected_course?.course_name || transferData.selected_course?.course_number
          ? `${transferData.selected_course?.course_number || ''} - ${transferData.selected_course?.course_name || ''}`
          : undefined);

      if (transferData.selected_course_id) {
        try {
          const courseRes = await getCourseById(String(transferData.selected_course_id));
          const c = courseRes?.data;
          hydratedCourseLabel = c?.course_number && c?.course_name
            ? `${c.course_number} - ${c.course_name}`
            : c?.course_name || hydratedCourseLabel || `ID ${transferData.selected_course_id}`;
        } catch {}
      }

      const initialData = {
        id: transferData?.id || null,
        description: transferData?.description || '',
        is_group: transferData?.is_group || false,
        selected_course: transferData.selected_course_id
          ? selectedCourseOption || {
              value: transferData.selected_course_id,
              label: hydratedCourseLabel || `ID ${transferData.selected_course_id}`,
            }
          : null,
        selected_level: transferData.selected_level_id
          ? selectedLevelOption || {
              value: transferData.selected_level_id,
              label:
                transferData.selected_level?.name ||
                transferData.selected_level?.full_level ||
                `Nivel ${transferData.selected_level_id}`,
            }
          : null,
      };

      setInitialTransferData(initialData);
      setIsDetailOpen(true);
    }
  };

  const handleRejectTransfer = (transferId: number) => {
    Swal.fire({
      title: 'Are you sure you want to reject this transfer?',
      text: 'This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, reject it!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await rejectTransfer(transferId);

          if (response.statusCode === 200) {
            Swal.fire(
              'Rejected!',
              'The transfer has been rejected.',
              'success'
            );
            mutate(key);
          } else {
            Swal.fire(
              'Error!',
              'There was an error rejecting the transfer.',
              'error'
            );
          }
        } catch (error) {
          Swal.fire(
            'Error!',
            'There was an error rejecting the transfer.',
            'error'
          );
        }
      }
    });
  };

  const { data: transfersData, isLoading } = useSWR(key, () =>
    getAllTransferData(page, rowPerPage, filters)
  );

  useEffect(() => {
    setIsReloading(true);
    mutate(key).finally(() => {
      setTimeout(() => setIsReloading(false), 500);
    });
  }, [reload, key]);

  const isLoadingData = isLoading || isReloading;

  if (isLoadingData) {
    return <TableSkeleton rows={10} columns={7} showHeader animated />;
  }

  const data = transfersData?.data?.result || [];

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <div className='d-flex align-items-center gap-2'>
          <TableActionButtons
            blockButtonVariant='danger'
            onBlock={() => handleRejectTransfer(row.id)}
            onTransfer={() => handleOpenTransferDetail(row.id, false)}
            transferTooltip={'Transfer to student'}
            onView={() => handleOpenTransferDetail(row.id, true)}
            status={row.status_level_change === 'n/a'}
            disabled={
              row.status_level_change === 'approved' ||
              row.status_level_change === 'rejected'
            }
            viewDisabled={false}
            module={'TransferStudents'}
          />
        </div>
      ),
      width: '160px',
      minWidth: '160px',
      maxWidth: '160px',
      allowOverflow: true,
      sortable: false,
      center: true,
    },
    {
      name: 'Description',
      selector: (row: any) => row.description,
      sortable: true,
    },
    {
      name: 'Status',
      cell: (row: any) => {
        if (row.status_level_change === 'pending')
          return <Badge color='warning'>Pending</Badge>;
        if (row.status_level_change === 'approved')
          return <Badge color='success'>Approved</Badge>;
        if (row.status_level_change === 'rejected')
          return <Badge color='danger'>Rejected</Badge>;
        return <Badge color='secondary'>{row.status_level_change}</Badge>;
      },
      sortable: true,
    },
    {
      name: 'Course',
      selector: (row: any) =>
        row.selected_course?.course_name ||
        (row.selected_course?.course_name || row.selected_course?.course_number
          ? `${row.selected_course?.course_number || ''} - ${row.selected_course?.course_name || ''}`
          : row.selected_course?.label || (row.selected_course_id ? `ID ${row.selected_course_id}` : '-')),
      sortable: true,
    },
    {
      name: 'Level',
      selector: (row: any) => row.selected_level?.full_level || '-',
      sortable: true,
    },
    {
      name: 'Type',
      selector: (row: any) => (row.is_group ? 'Group' : 'Individual').toUpperCase(),
      sortable: true,
    },
    {
      name: 'Created By',
      selector: (row: any) => (row.created_by?.name || '-').toUpperCase(),
      sortable: true,
    },
    {
      name: 'Created At',
      selector: (row: any) =>
        new Date(row.created_at).toLocaleDateString('en-US', {
          year: 'numeric',
          month: 'short',
          day: 'numeric',
        }).toUpperCase(),
      sortable: true,
    },
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={data}
        progressPending={isLoadingData}
        pagination
        paginationServer
        paginationDefaultPage={page}
        paginationPerPage={rowPerPage}
        paginationTotalRows={transfersData?.data?.totalCount || 0}
        onChangePage={(newPage) => {
          router.push({
            pathname: router.pathname,
            query: { ...router.query, page: newPage },
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

      {isDetailOpen && selectedTransferId && (
        <StudentTransferForm
          isOpen={isDetailOpen}
          toggle={() => setIsDetailOpen(false)}
          students={transferStudents}
          isGroupTransfer={transferStudents.length > 1}
          description={description}
          initialTransferData={initialTransferData}
          isViewOnly={isViewOnly}
          onSuccess={() => {
            mutate(key);
            setIsDetailOpen(false);
          }}
        />
      )}
    </div>
  );
};

export default TransferStudentsTable;
