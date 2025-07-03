import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Swal from 'sweetalert2';
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
import StudentTransferTable from '@/components/Dashboard/SchoolManagenement/StudentsTransferTable';
import StudentPerformanceChart from '@/components/own/charts/student-performance-chart';

const SchoolManagement = () => {
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const { access_denied } = router.query;

  useEffect(() => {
    if (access_denied) {
      let message = "You don't have access to this section";
      
      switch (access_denied) {
        case 'admin':
          message = "You don't have access to the administration section";
          break;
        case 'coordinator':
          message = "You don't have access to the coordinator section";
          break;
        case 'receptionist':
          message = "You don't have access to this section";
          break;
      }

      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: message,
        confirmButtonText: 'Understood'
      }).then(() => {
        const { access_denied, ...cleanQuery } = router.query;
        router.replace({
          pathname: router.pathname,
          query: cleanQuery
        }, undefined, { shallow: true });
      });
    }
  }, [access_denied, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
    if (access_denied) {
      let message = "You don't have access to this section";
      
      switch (access_denied) {
        case 'admin':
          message = "You don't have access to the administration section";
          break;
        case 'coordinator':
          message = "You don't have access to the coordinator section";
          break;
        case 'professor':
          message = "You don't have access to view other professor's information";
          break;
      }

      Swal.fire({
        icon: 'error',
        title: 'Access Denied',
        text: message,
        confirmButtonText: 'Understood'
      }).then(() => {
        const { access_denied, ...cleanQuery } = router.query;
        router.replace({
          pathname: router.pathname,
          query: cleanQuery
        }, undefined, { shallow: true });
      });
    }
  }, [access_denied, router]);

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
                  <Col md={12}>
                    <Row>
                      {[1, 2, 3, 4].map((item) => (
                        <CardSkeleton
                          key={item}
                          colProps={{ md: 3 }}
                          height={190}
                          headerHeight={40}
                        />
                      ))}
                    </Row>
                  </Col>
                  <CardSkeleton
                    colProps={{ xxl: 12, md: 5 }}
                    height={380}
                  />
                </>
              ) : (
                <>
                  <SchoolData />
                  {/* <AcademicPerformance />
                  <SchoolPerformance /> */}

                  <StudentPerformanceChart />
                </>
              )}
            </Row>
          </Col>
          <Col
            xs={12}
            className='box-col-6'
          >
            <Row>
              {loading ? (
                <>
                  <Col xl={6}>
                    <TableSkeleton
                      rows={5}
                      columns={4}
                      showHeader={true}
                      headerHeight={50}
                      rowHeight={40}
                      animated={true}
                    />
                  </Col>
                  <Col xl={6}>
                    <TableSkeleton
                      rows={5}
                      columns={4}
                      showHeader={true}
                      headerHeight={50}
                      rowHeight={40}
                      animated={true}
                    />
                  </Col>
                </>
              ) : (
                <>
                  <ProfessorsTable />
                  <StudentTransferTable />
                </>
              )}
            </Row>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default SchoolManagement;
