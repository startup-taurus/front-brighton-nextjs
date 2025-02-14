import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import { Card, CardBody, Col } from "reactstrap";
import { CommonHeader } from "./CommonHeader";
import { getFetcher } from "helper/api";

const AcademicPerformance = () => {
  const [chartData, setChartData] = useState({
    series: [],
    options: {},
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getFetcher("/course/get-academic-performance", false)
      .then((response) => {
        setChartData(response.data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err);
        setLoading(false);
      });
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    <Col xxl={6} md={5}>
      <Card>
        <CommonHeader title="Academic Performance" />
        <CardBody className="pt-0">
          <div className="performance-wrap">
            <div id="academic_performance-chart" style={{ minHeight: 245 }}>
              <ReactApexChart
                options={chartData.options}
                type="area"
                series={chartData.series}
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
