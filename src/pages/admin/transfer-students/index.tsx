import React, { useState, useEffect } from 'react';
import {
  Card,
  CardHeader,
  Container,
  Row,
  Table,
  Badge,
  Spinner,
} from 'reactstrap';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import { FiltersProps } from '../../../../Types/types';
import { getFiltersString } from '../../../../utils/utils';
import { getAllTransferData } from '../../../../helper/api-data/transfer-data';
import { getAllLevels } from '../../../../helper/api-data/level';
import { getActiveCourses } from '../../../../helper/api-data/course';
import { STATUS_LEVEL_CHANGE } from '../../../../utils/constants';

const TransferStudents = () => {
  const router = useRouter();
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
  const [selectedTransfers, setSelectedTransfers] = useState<number[]>([]);

  const filters = getFiltersString(router);

  const {
    data: transfersData,
    error,
    isLoading,
  } = useSWR(
    [
      `/transfer-data/get-all?page=${page}&limit=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ],
    () => getAllTransferData(page, rowPerPage, filters || '')
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
              self.findIndex((o) => o.value === option.value) === index
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
            self.findIndex((o) => o.value === option.value) === index
        );
      });
    }
  }, [levels]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Status',
      name: 'status_level_change',
      type: 'select',
      items: STATUS_LEVEL_CHANGE,
    },
    {
      labelName: 'Description',
      name: 'description',
      type: 'text',
    },
    {
      labelName: 'Group Transfer',
      name: 'is_group',
      type: 'select',
      items: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
    },
    {
      labelName: 'Course',
      name: 'course_name',
      type: 'select',
      items: courseOptions.length > 0 ? courseOptions : [],
      onInputChange: (inputValue: string) => setCourseSearchTerm(inputValue),
      onMenuScrollToBottom: onCourseScrollToBottom,
    },
    {
      labelName: 'Level',
      name: 'level_name',
      type: 'select',
      items: levelOptions.length > 0 ? levelOptions : [],
      onInputChange: (inputValue: string) => setLevelSearchTerm(inputValue),
      onMenuScrollToBottom: onLevelScrollToBottom,
    },
    {
      labelName: 'Created From',
      name: 'created_at_from',
      type: 'date',
    },
    {
      labelName: 'Created To',
      name: 'created_at_to',
      type: 'date',
    },
  ];

  const handleReload = () => {
    mutate([
      `/transfer-data/get-all?page=${page}&limit=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ]);
  };

  const handleCheckboxChange = (transferId: number) => {
    setSelectedTransfers((prev) => {
      if (prev.includes(transferId)) {
        return prev.filter((id) => id !== transferId);
      } else {
        return [...prev, transferId];
      }
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge color='warning'>Pending</Badge>;
      case 'approved':
        return <Badge color='success'>Approved</Badge>;
      case 'rejected':
        return <Badge color='danger'>Rejected</Badge>;
      default:
        return <Badge color='secondary'>{status}</Badge>;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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
            <CardHeader className='d-flex justify-content-between'>
              <h5>Student Transfers</h5>
              <TableHeaderActions onReload={handleReload} />
            </CardHeader>
            <div className='table-responsive'>
              {isLoading ? (
                <div className='text-center p-5'>
                  <Spinner color='primary' />
                </div>
              ) : (
                <Table className='table-hover'>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Description</th>
                      <th>Status</th>
                      <th>Course</th>
                      <th>Level</th>
                      <th>Group</th>
                      <th>Created By</th>
                      <th>Created At</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transfersData?.data?.length > 0 ? (
                      transfersData.data.map((transfer: any) => (
                        <tr key={transfer.id}>
                          <td>{transfer.id}</td>
                          <td>{transfer.description}</td>
                          <td>
                            {getStatusBadge(transfer.status_level_change)}
                          </td>
                          <td>
                            {transfer.selected_course?.course_name || '-'}
                          </td>
                          <td>{transfer.selected_level?.full_level || '-'}</td>
                          <td>{transfer.is_group ? 'Yes' : 'No'}</td>
                          <td>{transfer.created_by?.name || '-'}</td>
                          <td>{formatDate(transfer.created_at)}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={8}
                          className='text-center'
                        >
                          No transfers found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              )}
            </div>
            {transfersData?.totalPages > 0 && (
              <div className='d-flex justify-content-end p-3'>
                <div>
                  Page {page} of {transfersData.totalPages} | Total:{' '}
                  {transfersData.totalCount} transfers
                </div>
              </div>
            )}
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default TransferStudents;
