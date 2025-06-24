import React, { useState, useEffect, useRef, useCallback } from 'react';
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
import TableFilters from '@/components/own/table-filters/table-filters';
import { FiltersProps } from 'Types/types';
import { useRouter } from 'next/router';
import { STATUS_FILTER } from '../../../../utils/constants';

const CoordinatorDashboard = () => {
  const router = useRouter();
  const limit = 12;
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [professorOptions, setProfessorOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);

  const { data: response, error } = useSWR(
    ['professors', page, limit, searchTerm],
    () => getAllProfessors(page, limit, searchTerm),
    {
      revalidateOnFocus: false,
    }
  );

  const loading = !response && !error;

  const onProfessorScrollBottom = () => {
    if (
      (response?.data?.result?.length !== 0 || response?.data?.length !== 0) &&
      hasMore &&
      !isLoadingMore &&
      !loading
    ) {
      setIsLoadingMore(true);
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };

  useEffect(() => {
    const professorsData = response?.data?.result || response?.data;

    if (Array.isArray(professorsData)) {
      const formattedTeachers = professorsData.map((professor: any) => ({
        id: professor.id,
        name: professor.user?.name || 'No name',
        image: professor.user?.image || '',
        role: professor.user?.role || 'No role',
        students: professor.students_count || 0,
        courses: professor.courses?.length || 0,
        status: professor.status || 'active',
        coursesList: Array.isArray(professor.courses)
          ? professor.courses.map((course: any) => ({
              code: course.code || 'N/A',
              name: course.name || 'No name',
              schedule: course.schedule || 'Hours not available',
            }))
          : [],
        user: {
          id: professor.user?.id,
        },
      }));

      const hasMoreData = formattedTeachers.length === limit;
      setHasMore(hasMoreData);

      if (page === 1) {
        setTeachers(formattedTeachers);
      } else {
        setTeachers((prevTeachers) => [...prevTeachers, ...formattedTeachers]);
      }
      setIsLoadingMore(false);

      const options = professorsData.map((professor: any) => ({
        label: professor.user?.name || 'No name',
        value: professor.user?.name || 'No name',
      }));

      setProfessorOptions((prevOptions) => {
        const combined = [...prevOptions, ...options];
        return combined.filter(
          (option, index, self) =>
            self.findIndex((o) => o.value === option.value) === index
        );
      });
    } else {
      if (page === 1) {
        setTeachers([]);
      }
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [response, page]);

  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm.length >= 2 || searchTerm.length === 0) {
        setDebouncedSearchTerm(searchTerm);
        setPage(1);
        setHasMore(true);
        setIsLoadingMore(false);
      }
    }, 300);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  useEffect(() => {
    if (!router.query.status && router.isReady) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, status: 'active' },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady]);

  const filteredTeachers = teachers.filter((teacher) => {
    const nameMatch = teacher.name
      .toLowerCase()
      .includes(debouncedSearchTerm.toLowerCase());

    const teacherNameFilter = router.query.teacher_name as string;
    const teacherNameMatch =
      !teacherNameFilter ||
      teacher.name.toLowerCase().includes(teacherNameFilter.toLowerCase());

    const statusFilter = router.query.status as string;
    const statusMatch = !statusFilter || teacher.status === statusFilter;

    return nameMatch && teacherNameMatch && statusMatch;
  });

  useEffect(() => {
    if (error) {
      console.error('Error when obtaining teachers:', error);
    }
  }, [error]);

  const loadMoreCallback = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasMore && !isLoadingMore && !loading) {
        onProfessorScrollBottom();
      }
    },
    [hasMore, isLoadingMore, loading, onProfessorScrollBottom]
  );

  useEffect(() => {
    const observer = new IntersectionObserver(loadMoreCallback, {
      root: null,
      rootMargin: '100px',
      threshold: 0.1,
    });

    observerRef.current = observer;

    const currentLoadMoreRef = loadMoreRef.current;
    if (currentLoadMoreRef && hasMore) {
      observer.observe(currentLoadMoreRef);
    }

    return () => {
      if (currentLoadMoreRef) {
        observer.unobserve(currentLoadMoreRef);
      }
      observer.disconnect();
    };
  }, [loadMoreCallback, hasMore]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Teacher',
      name: 'teacher_name',
      type: 'select',
      items: professorOptions,
      placeholder: 'Select a teacher',
      onInputChange: (inputValue: string) => {
        setSearchTerm(inputValue);
      },
      onMenuScrollToBottom: onProfessorScrollBottom,
    },
    {
      labelName: 'Status',
      name: 'status',
      type: 'select',
      items: STATUS_FILTER,
    },
  ];

  return (
    <div className='page-body'>
      <Breadcrumbs
        title='Coordinator Dashboard'
        mainTitle='Teacher Management'
        parent='Coordinator'
      />
      <Container fluid={true}>
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>

        <Row>
          {loading && page === 1 ? (
            Array.from({ length: 12 }).map((_, index) => (
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
            <>
              {filteredTeachers.map((teacher) => (
                <Col
                  key={teacher.id}
                  md={6}
                  lg={4}
                  xl={3}
                  className='mb-4'
                >
                  <TeacherCard teacher={teacher} />
                </Col>
              ))}

              {/* Skeletons para carga de más profesores */}
              {isLoadingMore && (
                <>
                  {Array.from({ length: 4 }).map((_, index) => (
                    <Col
                      key={`loading-more-${index}`}
                      md={6}
                      lg={4}
                      xl={3}
                      className='mb-4'
                    >
                      <CardSkeleton height={250} />
                    </Col>
                  ))}
                </>
              )}

              <div
                ref={loadMoreRef}
                className='load-more-trigger'
                style={{ height: '20px' }}
              />
            </>
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
