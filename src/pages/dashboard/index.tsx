import { useEffect, useState } from 'react';
import EventCalendar from '@/components/Dashboard/SchoolManagenement/EventCalendar';
import NoticeBoard from '@/components/Dashboard/SchoolManagenement/NoticeBoard';
import SchoolData from '@/components/Dashboard/SchoolManagenement/SchoolData';
import ProfessorsTable from '@/components/Dashboard/SchoolManagenement/ProfessorsTable';
import TodayTask from '@/components/Dashboard/SchoolManagenement/TodayTask';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import dynamic from 'next/dynamic';
import { Col, Container, Row } from 'reactstrap';
import { SchoolManage, SchoolManagementHeading } from 'utils/Constant';
import CardSkeleton from '@/components/own/common/card-skeleton';
import TableSkeleton from '@/components/own/common/table-skeleton/TableSkeleton';

const SchoolManagement = () => {
  const [loading, setLoading] = useState(true);

  const AcademicPerformance = dynamic(
    () =>
      import('@/components/Dashboard/SchoolManagenement/AcademicPerformance'),
    { ssr: false }
  );
  const SchoolPerformance = dynamic(
    () => import('@/components/Dashboard/SchoolManagenement/SchoolPerformance'),
    { ssr: false }
  );
  const SchoolIncome = dynamic(
    () => import('@/components/Dashboard/SchoolManagenement/SchoolIncome'),
    { ssr: false }
  );

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='page-body'>
      <Breadcrumbs
        title={SchoolManage}
        mainTitle={SchoolManagementHeading}
        parent='Dashboard'
      />
      <Container fluid={true}>
        <Row>
          <Col
            xxl={12}
            className='box-col-12'
          >
            <Row>
              {loading ? (
                <>
                  <CardSkeleton
                    colProps={{ xxl: 6, md: 5 }}
                    height={350}
                  />
                  <CardSkeleton
                    colProps={{ xxl: 6, md: 7 }}
                    height={350}
                  />
                  <Col md={12}>
                    <Row>
                      {[1, 2, 3].map((item) => (
                        <CardSkeleton
                          key={item}
                          colProps={{ md: 4 }}
                          height={180}
                          headerHeight={40}
                        />
                      ))}
                    </Row>
                  </Col>
                </>
              ) : (
                <>
                  <AcademicPerformance />
                  <SchoolPerformance />
                  <SchoolData />
                </>
              )}
            </Row>
          </Col>
          <Col
            xs={12}
            className='box-col-12'
          >
            <Row>
              {loading ? (
                <Col xl={12}>
                  <TableSkeleton
                    rows={5}
                    columns={4}
                    showHeader={true}
                    headerHeight={50}
                    rowHeight={40}
                    animated={true}
                  />
                </Col>
              ) : (
                <ProfessorsTable />
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SchoolManagement;
