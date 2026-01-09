import React from 'react';
import useSWR from 'swr';
import { useRouter } from 'next/router';
import { Card, CardBody, Col, Alert } from 'reactstrap';
import DataTable from 'react-data-table-component';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { CommonHeader } from './AcademicPerformance/CommonHeader';
import { getProfessorsCoursesAndStudents } from 'helper/api-data/professor';
import { ApiResponse } from 'Types/ApiResponse';
import { ProfessorData, PaginatedProfessors } from 'Types/ProfessorType';
import { setQueryStringValue, clearQueryString } from '../../../../utils/utils';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

 

const ProfessorsTable: React.FC = () => {
  const router = useRouter();
  const page = parseInt((router.query.professorPage as string) || '1', 10);
  const limit = parseInt((router.query.professorLimit as string) || '10', 10);
  const { canPermission, permissionSet } = usePermission();
  const canViewProfessorsSummary = !!permissionSet && canPermission(PERMISSIONS.VIEW_DASHBOARD_PROFESSORS_SUMMARY);

  const key = canViewProfessorsSummary ? `/professor/get-courses-and-students?page=${page}&limit=${limit}` : null;
  const { data: response, error } = useSWR<ApiResponse<PaginatedProfessors>>(
    key,
    () => getProfessorsCoursesAndStudents(page, limit)
  );

  if (!canViewProfessorsSummary) return null;

  const loading = !response && !error;
  const professors = response?.data.result ?? [];
  const totalCount = response?.data.totalCount ?? 0;

  return (
    <Col
      xxl={6}
      md={7}
      className='student-transfer-container'
    >
      <Card>
        <CommonHeader title='Professors' />
        <CardBody className='pt-0'>
          {loading ? (
            <TableSkeleton
              rows={10}
              columns={4}
              showHeader
              animated
            />
          ) : error ? (
            <Alert color='danger'>
              Failed to load professors data. Please try again later.
            </Alert>
          ) : (
            <DataTable
              columns={[
                {
                  name: '#',
                  selector: (_row, i: any) => (page - 1) * limit + i + 1,
                  width: '60px',
                  center: true,
                },
                {
                  name: 'Professor',
                  selector: (row) => row.professorName.toUpperCase(),
                  sortable: true,
                  center: true,
                },
                {
                  name: 'Total Courses',
                  selector: (row) => row.totalCourses,
                  sortable: true,
                  center: true,
                },
                {
                  name: 'Total Students',
                  selector: (row) => row.totalStudents,
                  sortable: true,
                  center: true,
                },
              ]}
              data={professors}
              pagination
              paginationServer
              paginationTotalRows={totalCount}
              paginationDefaultPage={page}
              paginationPerPage={limit}
              onChangePage={(newPage) => {
                clearQueryString(router);
                setQueryStringValue('professorPage', newPage, router);
              }}
              onChangeRowsPerPage={(newPerPage) => {
                clearQueryString(router);
                setQueryStringValue('professorLimit', newPerPage, router);
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

export default ProfessorsTable;
