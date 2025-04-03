import React, { useState, useEffect } from 'react';
import {
  Container,
  Row,
  Col,
  Card,
  CardBody,
  Input,
  InputGroup,
} from 'reactstrap';
import { Search } from 'react-feather';
import Breadcrumbs from 'CommonElements/Breadcrumbs';
import TeacherCard from '@/components/own/teacher-card';
import { getAllProfessors } from 'helper/api-data/professor';
import CardSkeleton from '@/components/own/common/card-skeleton';
import { Teacher } from 'Types/TeacherType';
import useSWR from 'swr';

const CoordinatorDashboard = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const { data: response, error } = useSWR('professors', () =>
    getAllProfessors(1, 100, '')
  );

  const loading = !response && !error;

  const teachers: Teacher[] = response?.data?.result
    ? response.data.result.map((professor: any) => ({
        id: professor.id,
        name: professor.user?.name || 'No name',
        image: professor.user?.image || '',
        role: professor.user?.role || 'No role',
        students: professor.students_count || 0,
        courses: professor.courses?.length || 0,
        coursesList:
          professor.courses?.map((course: any) => ({
            code: course.code || 'N/A',
            name: course.name || 'No name',
            schedule: course.schedule || 'Hours not available',
          })) || [],
        user: {
          id: professor.user?.id,
        },
      }))
    : [];

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const filteredTeachers = teachers.filter((teacher) =>
    teacher.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
  );

  useEffect(() => {
    if (error) {
      console.error('Error when obtaining teachers:', error);
    }
  }, [error]);

  return (
    <div className='page-body'>
      <Breadcrumbs
        title='Coordinator Dashboard'
        mainTitle='Teacher Management'
        parent='Coordinator'
      />
      <Container fluid={true}>
        <Row>
          <Col
            xs={12}
            className='mb-4'
          >
            <Card>
              <CardBody className='pt-3'>
                <div className='position-relative'>
                  <InputGroup className='pt-2'>
                    <span className='input-group-text bg-primary'>
                      <Search
                        size={14}
                        className='text-white'
                      />
                    </span>
                    <Input
                      type='text'
                      placeholder='Search for teacher...'
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </InputGroup>
                </div>
              </CardBody>
            </Card>
          </Col>
        </Row>

        <Row>
          {loading ? (
            Array.from({ length: 8 }).map((_, index) => (
              <Col
                key={index}
                md={6}
                lg={4}
                xl={3}
              >
                <CardSkeleton height={250} />
              </Col>
            ))
          ) : filteredTeachers.length > 0 ? (
            filteredTeachers.map((teacher) => (
              <Col
                key={teacher.id}
                md={6}
                lg={4}
                xl={3}
                className='mb-4'
              >
                <TeacherCard teacher={teacher} />
              </Col>
            ))
          ) : (
            <Col xs={12}>
              <Card>
                <CardBody className='text-center py-5'>
                  <h3>No teachers found</h3>
                  <p className='text-muted'>Try another search term</p>
                </CardBody>
              </Card>
            </Col>
          )}
        </Row>
      </Container>
    </div>
  );
};

export default CoordinatorDashboard;
