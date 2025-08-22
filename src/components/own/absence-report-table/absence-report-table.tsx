import React from 'react';
import { Card, CardBody, Col, Alert } from 'reactstrap';
import DataTable from 'react-data-table-component';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { CommonHeader } from '@/components/Dashboard/SchoolManagenement/AcademicPerformance/CommonHeader';
import { getConsecutiveAbsencesReport } from 'helper/api-data/attendance';
import { Badge } from 'reactstrap';
import { AbsenceReportData } from '../../../../Types/ReportTypes';
import useSWR from 'swr';

const AbsenceReportTable: React.FC = () => {
  const { data: reportData, error, isLoading } = useSWR<AbsenceReportData[]>(
    '/attendance/consecutive-absences-report',
    getConsecutiveAbsencesReport
  );

  const getBadgeColor = (absences: number) => {
    if (absences >= 5) return 'danger';
    if (absences >= 3) return 'warning';
    return 'info';
  };

  return (
    <Col xxl={6} md={7}>
      <Card>
        <CommonHeader title='Report of Consecutive Absences' />
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
              Error al cargar el reporte de ausencias
            </Alert>
          ) : (
            <DataTable
              columns={[
                {
                  name: '#',
                  selector: (_row, i: any) => i + 1,
                  width: '60px',
                },
                {
                  name: 'Course Code',
                  selector: (row) => row.course_code,
                  sortable: true,
                },
                {
                  name: 'Course Name',
                  selector: (row) => row.course_name,
                  sortable: true,
                },
                {
                  name: 'Student Name',
                  selector: (row) => row.student_name.toUpperCase(),
                  sortable: true,
                },
                {
                  name: 'Consecutive Absences',
                  selector: (row) => row.consecutive_absences,
                  sortable: true,
                  cell: (row) => (
                    <Badge color={getBadgeColor(row.consecutive_absences)}>
                      {row.consecutive_absences}
                    </Badge>
                  ),
                },
              ]}
              data={reportData || []}
              pagination
              paginationPerPage={10}
              highlightOnHover
              striped
            />
          )}
        </CardBody>
      </Card>
    </Col>
  );
};

export default AbsenceReportTable;