import React, { useState, useEffect, useRef } from 'react';
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
import { getAllLevels } from '../../../../helper/api-data/level';
import {
  getAllCourses,
  getActiveCourses,
} from '../../../../helper/api-data/course';
import {
  PROMOTION_FILTER,
  STATUS_FILTER,
  STATUS_LEVEL_CHANGE,
} from '../../../../utils/constants';
import { SelectOption } from 'Types/SelectType';

const Students = () => {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [selectedStudentsCount, setSelectedStudentsCount] = useState(0);
  const transferButtonRef = useRef(null);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const limit = 10;
  const [coursePage, setCoursePage] = useState(1);
  const [levelPage, setLevelPage] = useState(1);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [levelSearchTerm, setLevelSearchTerm] = useState('');
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [courseNoFilter, setCourseNoFilter] = useState<SelectOption | null>(
    null
  );
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);
  const [statusFilter, setStatusFilter] = useState<SelectOption | null>(null);

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

  const { data: course } = useSWR(
    ['/course/get-active', coursePage, limit, courseSearchTerm],
    () => getActiveCourses(coursePage, limit, courseSearchTerm)
  );

  const { data: levels } = useSWR(
    ['/level/get-all', levelPage, limit, levelSearchTerm],
    () => getAllLevels(levelPage, limit, levelSearchTerm)
  );

  const onCourseScrollToBottom = () => {
    if (course?.data?.length !== 0) {
      const nextPage = coursePage + 1;
      setCoursePage(nextPage);
    }
  };

  const onLevelScrollToBottom = () => {
    if (levels?.data?.length !== 0) {
      const nextPage = levelPage + 1;
      setLevelPage(nextPage);
    }
  };

  useEffect(() => {
    if (course?.data) {
      const courseResults = Array.isArray(course.data)
        ? course.data
        : course.data.result;
      if (courseResults) {
        const options = courseResults.map((courseItem: any) => ({
          value: courseItem.id,
          label: `${courseItem.course_number} `,
        }));

        setCourseOptions((prevOptions) => {
          const combined = [...prevOptions, ...options];
          return combined.filter(
            (option, index, self) =>
              self.findIndex((options) => options.value === option.value) ===
              index
          );
        });
      }
    }
  }, [course]);

  useEffect(() => {
    if (levels?.data) {
      const levelData = Array.isArray(levels.data)
        ? levels.data
        : levels.data?.result || [];

      const options = levelData.map((item: any) => ({
        value: typeof item === 'string' ? item : item.id || item.level || item,
        label:
          typeof item === 'string'
            ? item
            : item.full_level || item.level || item,
      }));

      setLevelOptions((prevOptions) => {
        const combined = [...prevOptions, ...options];
        return combined.filter(
          (option, index, self) =>
            self.findIndex((options) => options.value === option.value) ===
            index
        );
      });
    }
  }, [levels]);

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
      value: statusFilter,
      onChange: (selectedOption: any) => {
        setStatusFilter(selectedOption);
      },
    },
    {
      labelName: 'Course No',
      name: 'course',
      type: 'select',
      items: courseOptions.length > 0 ? courseOptions : [],
      value: courseNoFilter,
      onChange: (option) => {
        setCourseNoFilter(option);
      },
      onMenuScrollToBottom: onCourseScrollToBottom,
    },
    {
      labelName: 'Level',
      name: 'level_id',
      type: 'select',
      items: levelOptions.length > 0 ? levelOptions : [],
      value: levelFilter,
      onChange: (option) => {
        setLevelFilter(option);
      },
      onMenuScrollToBottom: onLevelScrollToBottom,
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
              <div className='d-flex align-items-center'>
                <div
                  className='mr-3'
                  id='transferTooltip'
                ></div>
                <TableHeaderActions
                  onReload={handleReload}
                  addButton={{
                    title: 'Create Student',
                    onClick: () => toggle(),
                  }}
                />
              </div>
            </CardHeader>
            <div className='pb-4'>
              <StudentsTable
                page={page}
                rowPerPage={rowPerPage}
                students={students?.data}
                filters={filters}
                loading={students.isLoading || students.isValidating}
                onSelectedStudentsChange={setSelectedStudentsCount}
              />
            </div>
          </Card>
        </Row>
      </Container>
      <StudentForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
        onReload={handleReload}
      />
    </div>
  );
};

export default Students;
