import React from 'react';
import { Card, CardBody, Col, Alert } from 'reactstrap';
import DataTable from 'react-data-table-component';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { CommonHeader } from '@/components/Dashboard/SchoolManagenement/AcademicPerformance/CommonHeader';
import { getApprovedTransfers } from 'helper/api-data/transfer-data';
import { StudentTransferData } from '../../../../Types/ProfessorType';
import { ApiResponse } from '../../../../Types/ApiResponse';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { setQueryStringValue, clearQueryString } from '../../../../utils/utils';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const StudentTransferTable: React.FC = () => {
  const router = useRouter();
  const page = parseInt((router.query.transferPage as string) || '1', 10);
  const limit = parseInt((router.query.transferLimit as string) || '10', 10);
  const { canPermission, permissionSet } = usePermission();
  const canViewLastStudentTransfer = !!permissionSet && canPermission(PERMISSIONS.VIEW_DASHBOARD_LAST_STUDENT_TRANSFER);

  const key = canViewLastStudentTransfer ? `/transfer/get-approved?page=${page}&limit=${limit}` : null;
  const { data: response, error } = useSWR<ApiResponse<{
    result: StudentTransferData[];
    totalCount: number;
    page: number;
    limit: number;
  }>>(
    key,
    () => getApprovedTransfers({ page, limit })
  );

  if (!canViewLastStudentTransfer) return null;

  const isLoading = !response && !error;
  const allRows = response?.data?.result || [];
  const totalCount = response?.data?.totalCount || 0;

  return (
    <Col xxl={6} md={7} className='student-transfer-container'>
      <Card>
        <CommonHeader title='Last Student Transfer' />
        <CardBody className='pt-0'>
          {isLoading ? (
            <TableSkeleton
              rows={10}
              columns={4}
              showHeader
              animated
            />
          ) : error ? (
            <Alert color='danger'>
              Error loading the student transfers
            </Alert>
          ) : (
            <DataTable
              columns={[
                {
                  name: '#',
                  selector: (_row, i: any) => (page - 1) * limit + i + 1,
                  width: '60px',
                },
                {
                  name: 'Student',
                  selector: (row) => {
                    const students = row.student_transfers?.map(st => st.student?.user?.name).join(', ') || 'N/A';
                    return students;
                  },
                  sortable: true,
                },
                {
                  name: 'Course',
                  selector: (row) => row.selected_course?.course_name || 'N/A',
                  sortable: true,
                },
                {
                  name: 'Level',
                  selector: (row) => row.selected_level?.full_level || 'N/A',
                  sortable: true,
                },
              ]}
              data={allRows}
              pagination
              paginationServer
              paginationTotalRows={totalCount}
              paginationDefaultPage={page}
              paginationPerPage={limit}
              paginationRowsPerPageOptions={[10, 20, 30, 50]}
              onChangePage={(newPage) => {
                clearQueryString(router);
                setQueryStringValue('transferPage', newPage, router);
              }}
              onChangeRowsPerPage={(newPerPage) => {
                clearQueryString(router);
                setQueryStringValue('transferLimit', newPerPage, router);
              }}
              highlightOnHover
              striped
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default StudentTransferTable;