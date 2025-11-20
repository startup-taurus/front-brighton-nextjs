import React, { useState, useEffect } from 'react';
import {
  Card,
  CardBody,
  Table,
  Modal,
  ModalHeader,
  ModalBody,
} from 'reactstrap';
import { getProfessorsCourses } from 'helper/api-data/professor';
import { Clock } from 'react-feather';
import DashboardHead from '@/components/Dashboard/DashboardCommon/DashboardHead';
import { Course, Professor } from 'Types/DashboardType';

const EndingSoonCourses = () => {
  const [endingSoonCourses, setEndingSoonCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await getProfessorsCourses();

        if (response.statusCode === 200) {
          const allCourses: Course[] = [];
          response.data.professors.forEach((professor: Professor) => {
            professor.courses.forEach((course: Course) => {
              if (course.options.endsInTwoWeeks) {
                allCourses.push({
                  ...course,
                  professor_name: professor.professor_name,
                });
              }
            });
          });

          setEndingSoonCourses(allCourses);
        } else {
          setError('Error loading courses');
        }
      } catch (err) {
        setError('Error fetching courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  const toggleModal = () => setIsOpen(!isOpen);

  return (
    <Card className='widget-hover overflow-hidden'>
      <DashboardHead
        title='Courses to be completed soon'
        headClass='card-no-border pb-2'
        icon={<Clock size={18} />}
      />
      <CardBody
        className='pt-0 text-center'
        onClick={toggleModal}
        style={{ cursor: 'pointer' }}
      >
        {loading ? (
          <div className='p-3'>Loading...</div>
        ) : error ? (
          <div className='p-3 text-danger'>{error}</div>
        ) : (
          <div className='p-3'>
            <h2 className='mb-0'>{endingSoonCourses.length}</h2>
            <p className='mb-0'>Courses will end in 2 weeks</p>
          </div>
        )}
      </CardBody>

      <Modal
        isOpen={isOpen}
        toggle={toggleModal}
        size='lg'
      >
        <ModalHeader toggle={toggleModal}>
          Courses to be completed in 2 weeks
        </ModalHeader>
        <ModalBody>
          {endingSoonCourses.length > 0 ? (
            <Table
              responsive
              striped
            >
              <thead>
                <tr>
                  <th>Course</th>
                  <th>Code</th>
                  <th>Professor</th>
                  <th>Student</th>
                  <th>Schedule</th>
                  <th style={{ minWidth: '120px' }}>End Date</th>
                </tr>
              </thead>
              <tbody>
                {endingSoonCourses.map((course) => (
                  <tr key={course.course_id}>
                    <td>{course.course_name}</td>
                    <td>{course.course_number}</td>
                    <td>{course.professor_name}</td>
                    <td>{course.student_count}</td>
                    <td>{course.classSchedule}</td>
                    <td style={{ minWidth: '120px' }}>
                      {course.end_date ? 
                        new Date(course.end_date + 'T00:00:00').toLocaleDateString('en-US') : 
                        'N/A'
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          ) : (
            <p className='text-center'>
              There are no courses ending in the next 2 weeks.
            </p>
          )}
        </ModalBody>
      </Modal>
    </Card>
  );
};

export default EndingSoonCourses;
