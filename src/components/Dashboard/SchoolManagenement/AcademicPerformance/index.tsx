import React from 'react';
import { Card, CardBody, Col } from 'reactstrap';
import { CommonHeader } from './CommonHeader';
import useSWR from 'swr';
import { getAcademicPerformance } from 'helper/api-data/course';
import CardSkeleton from '@/components/own/common/card-skeleton';
import { Chart } from 'react-google-charts';

const transformDataForGoogleCharts = (chartData: any) => {
  if (!chartData || !chartData.series || !chartData.options) {
    return [
      ['Period', 'Performance'],
      ['No Data', 0],
    ];
  }

  const header = [
    'Period',
    ...chartData.series.map((s: any) => s.name || 'Performance'),
  ];

  const categories = Array.isArray(chartData.options.xaxis.categories)
    ? chartData.options.xaxis.categories
    : chartData.series[0].data.map((_: any, i: number) => `Period ${i + 1}`);

  const rows = categories.map((category: string, index: number) => {
    return [
      category,
      ...chartData.series.map((s: any) =>
        s.data && s.data[index] !== undefined ? s.data[index] : 0
      ),
    ];
  });

  return [header, ...rows];
};

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
              <Chart
                chartType='AreaChart'
                width='100%'
                height={230}
                data={transformDataForGoogleCharts(performanceData.data)}
                options={{
                  hAxis: { titleTextStyle: { color: '#333' } },
                  vAxis: { minValue: 0 },
                  colors: performanceData.data?.options?.colors || [
                    '#7366FF',
                    '#FF3364',
                  ],
                  chartArea: { width: '80%', height: '60%' },
                  backgroundColor: 'transparent',
                }}
              />
            </div>
          </div>
        </CardBody>
      </Card>
    </Col>
  );
};

export default AcademicPerformance;
