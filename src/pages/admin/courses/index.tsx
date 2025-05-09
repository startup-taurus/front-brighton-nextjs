import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import CoursesTable from '@/components/own/tables/courses-table';
import CourseForm from '@/components/own/form/course-form';
import { FiltersProps } from '../../../../Types/types';
import { COURSE_TYPE_FILTER, STATUS_FILTER } from '../../../../utils/constants';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getActiveProfessors } from '../../../../helper/api-data/professor';
import { getAllCourses } from '../../../../helper/api-data/course';
import useSWR from 'swr';

const Students = () => {
  const limit = 10;
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);

  const [professorOptions, setProfessorOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [teacherFilter, setTeacherFilter] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [statusFilter, setStatusFilter] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [course, setCourse] = useState<{
    value: string;
    label: string;
  } | null>(null);
  const [nameCourse, setNameCourse] = useState<{
    value: string;
    label: string;
  } | null>(null);

  const { data: professorsData } = useSWR(
    ['/professor/get-active', page, limit, searchTerm],
    () => getActiveProfessors(page, limit, searchTerm),
    {
      revalidateOnFocus: false,
    }
  );

  const onProfessorScrollBottom = () => {
    if (
      professorsData?.data?.result?.length != 0 ||
      professorsData?.data?.length != 0
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };
  const onCourseScrollBottom = () => {
    if (
      coursesData?.data?.result?.length != 0 ||
      coursesData?.data?.length != 0
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };

  useEffect(() => {
    if (professorsData?.data) {
      const options = professorsData.data.map((professor: any) => ({
        label: professor.user.name,
        value: professor.user.name,
      }));
      setProfessorOptions((prevOptions) => {
        const combined = [...prevOptions, ...options];
        return combined.filter(
          (option, index, self) =>
            self.findIndex((o) => o.value === option.value) === index
        );
      });
    }
  }, [professorsData]);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload(!reload);
  };

  const { data: coursesData } = useSWR(
    '/course/get-all',
    () => getAllCourses(),
    {
      revalidateOnFocus: false,
    }
  );

  const courseNumberOptions = React.useMemo(() => {
    if (!coursesData?.data?.result) return [];

    const uniqueCourseNumbers = Array.from(
      new Set(
        coursesData.data.result.map((course: any) => course.course_number)
      )
    );

    return uniqueCourseNumbers.map((courseNumber) => ({
      label: courseNumber as string,
      value: courseNumber as string,
    }));
  }, [coursesData]);

  const courseNameOptions = React.useMemo(() => {
    if (!coursesData?.data?.result) return [];

    const uniqueCourseName = Array.from(
      new Set(coursesData.data.result.map((course: any) => course.course_name))
    );

    return uniqueCourseName.map((courseName) => ({
      label: courseName as string,
      value: courseName as string,
    }));
  }, [coursesData]);

  const selectFilters: FiltersProps[] = [
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
      name: 'course_number',
      type: 'select',
      items: courseNumberOptions,
      value: course,
      onChange: (selectedOption: any) => {
        setCourse(selectedOption);
      },
      onMenuScrollToBottom: onCourseScrollBottom,
    },
    {
      labelName: 'Name of course',
      name: 'course_name',
      type: 'select',
      items: courseNameOptions,
      value: nameCourse,
      onChange: (selectedOption: any) => {
        setNameCourse(selectedOption);
      },
      onMenuScrollToBottom: onCourseScrollBottom,
    },
    {
      labelName: 'Teacher',
      name: 'teacher_name',
      type: 'select',
      items: professorOptions,
      value: teacherFilter,
      onChange: (selectedOption: any) => {
        setTeacherFilter(selectedOption);
      },
      onMenuScrollToBottom: onProfessorScrollBottom,
    },
    {
      labelName: 'Type',
      name: 'course_type',
      type: 'select',
      items: COURSE_TYPE_FILTER,
    },
  ];

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
                  title: 'Create Course',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <CoursesTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <CourseForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
      />
    </div>
  );
};

export default Students;
