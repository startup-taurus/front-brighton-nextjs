import React, { useState } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import StudentsTable from '@/components/own/tables/students-table';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import StudentForm from '@/components/own/form/student-form';
import { useRouter } from 'next/router';
import { FiltersProps } from '../../../../Types/types';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getFiltersString } from '../../../../utils/utils';
import useSWR, { mutate } from 'swr';
import { getAllStudent } from '../../../../helper/api-data/student';
import { getAllCourses } from '../../../../helper/api-data/course';
import {
  LEVEL_FILTER,
  PROMOTION_FILTER,
  STATUS_FILTER,
} from '../../../../utils/constants';

const Students = () => {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const filters = getFiltersString(router);

  const students = useSWR(
    [
      `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}&order=desc&orderBy=createdAt`,
    ],
    () =>
      getAllStudent(
        page,
        rowPerPage,
        filters
          ? `${filters}&order=desc&orderBy=createdAt`
          : 'order=desc&orderBy=createdAt'
      )
  );

  const course = useSWR(`/course/get-all`, () => getAllCourses());

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'ID',
      name: 'cedula',
      type: 'text',
    },
    {
      labelName: 'Name',
      name: 'name',
      type: 'text',
    },
    {
      labelName: 'Status',
      name: 'status',
      type: 'select',
      items: STATUS_FILTER,
    },
    {
      labelName: 'Course No',
      name: 'course',
      type: 'select',
      items: course?.data
        ? course?.data?.data?.result?.map((item: any) => ({
            label: item.course_number,
            value: item.id,
          }))
        : [],
    },
    {
      labelName: 'Level',
      name: 'level',
      items: LEVEL_FILTER,
    },
    {
      labelName: 'Promotion',
      name: 'promotion',
      items: PROMOTION_FILTER,
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    mutate([
      `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}&order=desc&orderBy=createdAt`,
    ]);
  };

  return (
    <div className='page-body'>
      <Container
        className='basic_table'
        fluid
      >
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: 'Create Student',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <StudentsTable
                page={page}
                rowPerPage={rowPerPage}
                students={students?.data}
                filters={filters}
                loading={students.isLoading}
              />
            </div>
          </Card>
        </Row>
      </Container>
      {isOpenModal && (
        <StudentForm isOpen={isOpenModal} toggle={toggle} data={null} />
      )}
    </div>
  );
};

export default Students;
