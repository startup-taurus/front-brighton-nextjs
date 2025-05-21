import useSWR from 'swr';
import {
  Card,
  CardBody,
  Col,
  Modal,
  ModalHeader,
  ModalBody,
  Table,
} from 'reactstrap';
import { getDashboardData } from 'helper/api-data/user';
import DashboardHead from '../../DashboardCommon/DashboardHead';
import Image from 'next/image';
import { ImgPath } from 'utils/Constant';
import { useState, useEffect } from 'react';
import { getProfessorsCourses } from 'helper/api-data/professor';
import { Clock } from 'react-feather';
import { Course, Professor } from 'Types/DashboardType';

const SchoolData = () => {
  const { data: schoolCardData } = useSWR([`/get-dashboard-data/get-all`], () =>
    getDashboardData()
  );

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
          setError('Error fetching courses');
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
    <>
      {schoolCardData?.data?.map((schoolCardItem: any) => (
        <Col
          md={3}
          className={schoolCardItem.smallScreenClass ? 'col-sm-6' : ''}
          key={`school-card-${schoolCardItem.header?.toLowerCase().replace(/\s+/g, '-')}`}
        >
          <Card className='widget-hover overflow-hidden'>
            <DashboardHead
              title={schoolCardItem.header}
              headClass='card-no-border pb-2'
            />
            <CardBody className='pt-0 count-student'>
              <div className='school-wrapper'>
                <div className='school-header'>
                  <h4 className={`txt-${schoolCardItem?.amountClass}`}>
                    {schoolCardItem.amount}
                  </h4>
                  <div className='d-flex gap-1 align-items-center flex-wrap pt-xxl-0 pt-2'>
                    <i className='icon-arrow-up f-light' />
                    <span className='f-w-500 f-light'>
                      {schoolCardItem.growth}
                    </span>
                    <p className='text-muted'>than last month</p>
                  </div>
                </div>
                <div className='school-body'>
                  <Image
                    height={59}
                    width={70}
                    src={`${ImgPath}/dashboard-7/${schoolCardItem.imageName}`}
                    alt='total teachers'
                  />
                </div>
              </div>
            </CardBody>
          </Card>
        </Col>
      ))}

      <Col md={3}>
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
        </Card>
      </Col>

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
    </>
  );
};

export default SchoolData;
