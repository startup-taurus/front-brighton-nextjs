import React from 'react';
import ReactApexChart from 'react-apexcharts';
import { Card, CardBody, Col } from 'reactstrap';
import { CommonHeader } from './CommonHeader';
import useSWR from 'swr';

const AcademicPerformance = () => {
  const {
    data: chartData,
    error,
    isLoading,
  } = useSWR('/course/get-academic-performance', (url) =>
    fetch(`${process.env.API_URL}${url}`)
      .then((res) => res.json())
      .then((res) => res.data)
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
              {!isLoading && chartData && (
                <ReactApexChart
                  options={chartData.options || {}}
                  type='area'
                  series={chartData.series || []}
                  height={230}
                />
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default AcademicPerformance;
