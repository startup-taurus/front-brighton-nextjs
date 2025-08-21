import React, { useEffect, useState } from 'react';
import { Card, CardBody, Col, Alert } from 'reactstrap';
import DataTable from 'react-data-table-component';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';
import { CommonHeader } from '@/components/Dashboard/SchoolManagenement/AcademicPerformance/CommonHeader';
import { getConsecutiveAbsencesReport } from 'helper/api-data/attendance';
import { Badge } from 'reactstrap';
import { AbsenceReportData } from '../../../../Types/ReportTypes';


const AbsenceReportTable: React.FC = () => {
  const [reportData, setReportData] = useState<AbsenceReportData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchReportData = async () => {
      try {
        setLoading(true);
        const data = await getConsecutiveAbsencesReport();
        
        if (Array.isArray(data)) {
          setReportData(data);
        } else {
          setError('No se pudieron cargar los datos del reporte');
        }
      } catch (err) {
        console.error('Error fetching absence report:', err);
        setError('Error al cargar el reporte de ausencias');
      } finally {
        setLoading(false);
      }
    };

    fetchReportData();
  }, []);

  const getBadgeColor = (absences: number) => {
    if (absences >= 5) return 'danger';
    if (absences >= 3) return 'warning';
    return 'info';
  };

  return (
    <Col
      xxl={6}
      md={7}
    >
      <Card>
        <CommonHeader title='Report of Consecutive Absences' />
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
              {error}
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
              data={reportData}
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