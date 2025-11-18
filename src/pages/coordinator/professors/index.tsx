import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
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
import AsyncSelect from 'react-select/async';
import TableFilters from '@/components/own/table-filters/table-filters';
import { FiltersProps } from 'Types/types';
import { useRouter } from 'next/router';
import { STATUS, STATUS_FILTER, DEFAULT_LABELS } from '../../../../utils/constants';
import { getSimpleFiltersString } from '../../../../utils/utils';

const CoordinatorDashboard = () => {
  const router = useRouter();
  const limit = 12;
  const [page, setPage] = useState(1);
  
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [teacherOptions, setTeacherOptions] = useState<Array<{ label: string; value: string }>>([]);
  const [teacherPage, setTeacherPage] = useState(1);
  const [teacherSearch, setTeacherSearch] = useState('');
  const [teacherHasMore, setTeacherHasMore] = useState(true);
  const [teacherLoading, setTeacherLoading] = useState(false);

  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const apiFilters = {
    name: String(router.query.teacher_name || ''),
    status: String(router.query.status || ''),
  };
  const filtersString = getSimpleFiltersString(apiFilters);

  const { data: response, error } = useSWR(
    ['professors', page, limit, filtersString],
    () => getAllProfessors(page, limit, filtersString),
    {
      revalidateOnFocus: false,
    }
  );

  useEffect(() => {
    setPage(1);
    setTeachers([]);
    setHasMore(true);
    setIsLoadingMore(false);
  }, [filtersString]);

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
        name: professor.user?.name || DEFAULT_LABELS.NO_NAME,
        image: professor.user?.image || '',
        role: professor.user?.role || DEFAULT_LABELS.NO_ROLE,
        students: professor.students_count || 0,
        courses: professor.courses?.length || 0,
        status: professor.status || STATUS.ACTIVE,
        coursesList: Array.isArray(professor.courses)
          ? professor.courses.map((course: any) => ({
              code: course.code || DEFAULT_LABELS.NA,
              name: course.name || DEFAULT_LABELS.NO_NAME,
              schedule: course.schedule || DEFAULT_LABELS.HOURS_NOT_AVAILABLE,
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


    } else {
      if (page === 1) {
        setTeachers([]);
      }
      setHasMore(false);
      setIsLoadingMore(false);
    }
  }, [response, page]);


  useEffect(() => {
    if (!router.query.status && router.isReady) {
      router.push(
        {
          pathname: router.pathname,
          query: { ...router.query, status: STATUS.ACTIVE },
        },
        undefined,
        { shallow: true }
      );
    }
  }, [router.isReady]);

  const filteredTeachers = teachers.filter((teacher) => {
    const teacherNameFilter = router.query.teacher_name as string;
    const teacherNameMatch =
      !teacherNameFilter ||
      teacher.name.toLowerCase().includes(teacherNameFilter.toLowerCase());

    const statusFilter = router.query.status as string;
    const statusMatch = !statusFilter || String(teacher.status || '').toLowerCase() === statusFilter.toLowerCase();

    return teacherNameMatch && statusMatch;
  });

  useEffect(() => {
    if (error) {
      console.error('Error when obtaining teachers:', error);
    }
  }, [error]);

  const statusParam = String(router.query.status || '').trim();


  useEffect(() => {
    setTeacherOptions([]);
    setTeacherPage(1);
    setTeacherHasMore(true);
    setTeacherSearch('');
  }, [router.query.status]);

  const initialTeacherOptions = useMemo(() => {
    const professorsData = response?.data?.result || response?.data;
    if (!Array.isArray(professorsData)) return [];
    const opts = professorsData.map((prof: any) => ({ label: prof.user?.name || DEFAULT_LABELS.NO_NAME, value: prof.user?.name || DEFAULT_LABELS.NO_NAME }));
    return opts.filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i).slice(0, 10);
  }, [response]);

  useEffect(() => {
    setTeacherOptions(initialTeacherOptions);
    setTeacherHasMore(initialTeacherOptions.length === 10);
  }, [initialTeacherOptions]);

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

  const onTeacherOptionsScrollBottom = async () => {
    if (teacherLoading || !teacherHasMore) return;
    setTeacherLoading(true);
    const nextPage = teacherPage + 1;
    const filters = getSimpleFiltersString({ name: teacherSearch, status: statusParam });
    const res = await getAllProfessors(nextPage, 10, filters);
    const data = res?.data?.result || res?.data || [];
    const more = Array.isArray(data)
      ? data.map((prof: any) => ({ label: prof.user?.name || DEFAULT_LABELS.NO_NAME, value: prof.user?.name || DEFAULT_LABELS.NO_NAME }))
      : [];
    setTeacherOptions((prev) => {
      const combined = [...prev, ...more];
      return combined.filter((opt, i, arr) => arr.findIndex((o) => o.value === opt.value) === i);
    });
    setTeacherPage(nextPage);
    setTeacherHasMore(more.length === 10);
    setTeacherLoading(false);
  };

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Teacher',
      name: 'teacher_name',
      type: 'async-select',
      asyncComponent: ({ field, form }: any) => (
        <AsyncSelect
          cacheOptions
          defaultOptions={teacherOptions}
          loadOptions={async (inputValue: string) => {
            const q = String(inputValue || '').trim();
            setTeacherSearch(q);
            const statusParam = String(router.query.status || '').trim();
            const filters = getSimpleFiltersString({ name: q, status: statusParam });
            const res = await getAllProfessors(1, 10, filters);
            const data = res?.data?.result || res?.data || [];
            const opts = Array.isArray(data)
              ? data.map((prof: any) => ({ label: prof.user?.name || DEFAULT_LABELS.NO_NAME, value: prof.user?.name || DEFAULT_LABELS.NO_NAME }))
              : [];
            setTeacherOptions(opts);
            setTeacherPage(1);
            setTeacherHasMore(opts.length === 10);
            return opts;
          }}
          onMenuScrollToBottom={onTeacherOptionsScrollBottom}
          value={field.value ? { label: String(field.value), value: String(field.value) } : null}
          onChange={(selectedOption: any) => {
            const value = selectedOption ? selectedOption.value : '';
            form.setFieldValue('teacher_name', value, false);
          }}
          placeholder='Select a teacher'
          classNamePrefix='select'
          styles={{ menu: (provided: any) => ({ ...provided, zIndex: 9999 }) }}
        />
      ),
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
