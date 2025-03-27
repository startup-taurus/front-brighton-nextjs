import React from 'react';
import useSWR from 'swr';
import { Card, CardBody, Col, Table, Spinner, Alert } from 'reactstrap';
import { CommonHeader } from './AcademicPerformance/CommonHeader';
import { getProfessorsCoursesAndStudents } from 'helper/api-data/professor';

// Define a TypeScript interface for the professor data
interface ProfessorData {
  id: string | number;
  professorName: string;
  totalCourses: number;
  totalStudents: number;
}

const ProfessorsTable: React.FC = () => {
  const {
    data: professors,
    error,
    isLoading,
  } = useSWR<ProfessorData[]>('professorData', getProfessorsCoursesAndStudents);

  if (isLoading) {
    return (
      <Col xl={12}>
        <Card>
          <CommonHeader title='Professors' />
          <CardBody className='d-flex justify-content-center align-items-center'>
            <Spinner color='primary' />
          </CardBody>
        </Card>
      </Col>
    );
  }

  if (error) {
    return (
      <Col xl={12}>
        <Card>
          <CommonHeader title='Professors' />
          <CardBody>
            <Alert color='danger'>
              Failed to load professors data. Please try again later.
            </Alert>
          </CardBody>
        </Card>
      </Col>
    );
  }

  return (
    <Col xl={12}>
      <Card>
        <CommonHeader title='Professors' />
        <CardBody className='pt-0'>
          <Table
            responsive
            striped
          >
            <thead>
              <tr>
                <th>#</th>
                <th>Professors</th>
                <th>Total Courses</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {professors && professors.length > 0 ? (
                professors.map((prof, index) => (
                  <tr key={prof.id || `professor-${index}`}>
                    <td>{index + 1}</td>
                    <td>{prof.professorName}</td>
                    <td>{prof.totalCourses}</td>
                    <td>{prof.totalStudents}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={4}
                    className='text-center'
                  >
                    No professors found
                  </td>
                </tr>
              )}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ProfessorsTable;
