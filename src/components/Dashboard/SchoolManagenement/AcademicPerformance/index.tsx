import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, Col } from 'reactstrap';
import { CommonHeader } from './CommonHeader';
import useSWR from 'swr';
import { getAcademicPerformance } from 'helper/api-data/course';
import CardSkeleton from '@/components/own/common/card-skeleton';

const AcademicPerformance = () => {
  const { data: performanceData, error } = useSWR(
    ['/course/get-academic-performance'],
    () => getAcademicPerformance()
  );

  if (error)
    return (
      <Col
        xxl={6}
        md={5}
      >
        <div>Failed to load academic performance data</div>
      </Col>
    );
  if (!performanceData)
    return (
      <CardSkeleton
        colProps={{ xxl: 6, md: 5 }}
        height={350}
      />
    );

  return (
    <Col
      xxl={6}
      md={5}
    >
      <Card>
        <CommonHeader title='Academic Performance' />
        <CardBody className='pt-0'>
          <div className='performance-wrap'>
            <div
              id='academic_performance-chart'
              style={{ minHeight: 245 }}
            >
              <ReactApexChart
                options={performanceData.data?.options || {}}
                type='area'
                series={performanceData.data?.series || []}
                height={230}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default AcademicPerformance;
