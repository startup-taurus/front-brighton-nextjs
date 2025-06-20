import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardBody, CardHeader, Col, Row } from 'reactstrap';
import Select from 'react-select';
import { getBestStudentsByCourse } from 'helper/api-data/student';
import { getActiveCourses } from 'helper/api-data/course';
import useSWR from 'swr';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ChartDataLabels
);

interface Option {
  label: string;
  value: number;
  levelId: number;
  levelLabel: string;
}

interface StudentPerformanceChartProps {
  title?: string;
  height?: string;
  className?: string;
}

const StudentPerformanceChart: React.FC<StudentPerformanceChartProps> = ({
  title = 'Student Performance by Course',
  height = '400px',
  className = '',
}) => {
  const [selectedCourse, setSelectedCourse] = useState<Option | null>(null);
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [studentData, setStudentData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [hasMoreCourses, setHasMoreCourses] = useState(true);

  const limit = 10;

  const { data: coursesData, isLoading: isLoadingCourses } = useSWR(
    [`/course/get-active`, coursePage, limit, courseSearchTerm],
    () => getActiveCourses(coursePage, limit, courseSearchTerm)
  );

  useEffect(() => {
    if (coursesData?.data) {
      const newOptions = coursesData.data.map(
        (course: any) =>
          ({
            value: course.id,
            label: `${course.course_number} - ${course.course_name} - ${course.syllabus.level.full_level}`,
            levelId: course.syllabus.level.id,
            levelLabel: course.syllabus.level.full_level,
          }) as Option
      );

      if (coursePage === 1) {
        setCourseOptions(newOptions);
      } else {
        setCourseOptions((prevOpts) => {
          const existingValues = new Set(
            prevOpts.map((option) => option.value)
          );
          const filteredNewOpts = newOptions.filter(
            (opt: any) => !existingValues.has(opt.value)
          );
          return [...prevOpts, ...filteredNewOpts];
        });
      }
      setHasMoreCourses(newOptions.length === limit);
    }
  }, [coursesData, coursePage, limit]);

  const handleCourseChange = (opt: Option | null) => setSelectedCourse(opt);

  const handleCourseScrollToBottom = useCallback(() => {
    if (hasMoreCourses && !isLoadingCourses) {
      setCoursePage((prevPage) => prevPage + 1);
    }
  }, [hasMoreCourses, isLoadingCourses]);

  const handleCourseInputChange = (inputValue: string) => {
    setCourseSearchTerm(inputValue);
    setCoursePage(1);
    setCourseOptions([]);
    setHasMoreCourses(true);
  };

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      try {
        const res = await getBestStudentsByCourse(
          selectedCourse?.value,
          selectedCourse?.levelId,
          10
        );
        setStudentData(res.data?.result || []);
      } catch {
        setStudentData([]);
      } finally {
        setIsLoading(false);
      }
    };
    if (selectedCourse) fetchData();
  }, [selectedCourse]);

  const fullValues = {
    Exam: studentData.map((student) => parseFloat(student.exam_percent)),
    Test: studentData.map((student) => parseFloat(student.test_percent)),
    Assignment: studentData.map((student) =>
      parseFloat(student.assignment_percent)
    ),
  };

  const chartData = {
    labels: studentData.map((student) => {
      const name = student.name || 'Unnamed';
      return name.length > 15 ? `${name.substring(0, 15)}...` : name;
    }),
    datasets: [
      {
        label: 'Exam (70%)',
        data: studentData.map((student) =>
          Number(
            ((parseFloat(student.exam_percent) / 100) * 0.7 * 10).toFixed(2)
          )
        ),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
        stack: 'Stack 0',
      },
      {
        label: 'Test (20%)',
        data: studentData.map((student) =>
          Number(
            ((parseFloat(student.test_percent) / 100) * 0.2 * 10).toFixed(2)
          )
        ),
        backgroundColor: 'rgba(255, 206, 86, 0.6)',
        stack: 'Stack 0',
      },
      {
        label: 'Assignment (10%)',
        data: studentData.map((student) =>
          Number(
            ((parseFloat(student.assignment_percent) / 100) * 0.1 * 10).toFixed(
              2
            )
          )
        ),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        stack: 'Stack 0',
      },
    ],
  };

  const chartOptions: any = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { position: 'top' as const },
      title: { display: true, text: title },
      tooltip: {
        callbacks: {
          label: function (context: any) {
            const idx = context.dataIndex;
            const dataset = context.dataset;
            const weighted = context.formattedValue;
            const type = dataset.label.split(' ')[0] as keyof typeof fullValues;
            const full = fullValues[type][idx] / 10;
            return [
              `${dataset.label}: ${weighted}%  `,
              `${type}: ${full.toFixed(2)}%`,
            ];
          },
        },
      },
      datalabels: {
        display: (ctx: any) =>
          ctx.datasetIndex === ctx.chart.data.datasets.length - 1,
        anchor: 'end',
        align: 'end',
        formatter: (_: any, ctx: any) =>
          (parseFloat(studentData[ctx.dataIndex].total_percent) / 10).toFixed(
            2
          ) + '%',
        font: { weight: 'bold' },
        color: '#000',
      },
    },
    scales: {
      x: { stacked: true },
      y: {
        stacked: true,
        beginAtZero: true,
        max: 100,
        title: { display: true, text: 'Percentage (%)' },
      },
    },
  };

  return (
    <Card className={className}>
      <CardHeader>
        <h5>{title}</h5>
      </CardHeader>
      <CardBody>
        <Row className='mb-3'>
          <Col md='6'>
            <label>Filter by Course</label>
            <Select
              options={courseOptions}
              value={selectedCourse}
              onChange={handleCourseChange}
              placeholder='Select course...'
              isClearable
              isSearchable
              onMenuScrollToBottom={handleCourseScrollToBottom}
              onInputChange={handleCourseInputChange}
              isLoading={isLoadingCourses}
              filterOption={null}
            />
          </Col>
        </Row>
        <div style={{ height }}>
          {studentData.length > 0 ? (
            <Bar
              data={chartData}
              options={chartOptions}
            />
          ) : (
            <div className='d-flex justify-content-center align-items-center h-100'>
              <p className='text-muted'>
                {isLoading
                  ? 'Loading data...'
                  : 'No data available. Select a course to view results.'}
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default StudentPerformanceChart;
