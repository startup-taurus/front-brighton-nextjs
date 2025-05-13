import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import useSWR, { mutate } from 'swr';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import StudentForm from '@/components/own/form/student-form';
import { FiltersProps } from '../../../../Types/types';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getFiltersString } from '../../../../utils/utils';
import { getAllRegisteredStudents } from '../../../../helper/api-data/registered-student';
import { getAllLevels } from '../../../../helper/api-data/level';
import { PROMOTION_FILTER, STATUS_FILTER } from '../../../../utils/constants';
import StudentsRegisteredTable from '@/components/own/tables/students-registered-table';

const Students = () => {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const limit = 10;
  const [levelPage, setLevelPage] = useState(1);
  const [levelSearchTerm, setLevelSearchTerm] = useState('');
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);

  const filters = getFiltersString(router);

  const students = useSWR(
    [
      `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ],
    () => getAllRegisteredStudents(page, rowPerPage, filters)
  );

  const { data: levels } = useSWR(
    ['/level/get-all', levelPage, limit, levelSearchTerm],
    () => getAllLevels(levelPage, limit, levelSearchTerm)
  );

  const onLevelScrollToBottom = () => {
    if (levels?.data?.length !== 0) {
      const nextPage = levelPage + 1;
      setLevelPage(nextPage);
    }
  };

  useEffect(() => {
    if (levels?.data) {
      // Manejar tanto la estructura antigua como la nueva
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
      labelName: 'ID  Number',
      name: 'id_number',
      type: 'text',
    },
    {
      labelName: 'Level',
      name: 'level_id',
      type: 'select',
      items: levelOptions.length > 0 ? levelOptions : [],
      value: levelFilter,
      inputValue: levelSearchTerm,
      onChange: (opt: any) => {
        setLevelFilter(opt);
      },
      onInputChange: (inputValue: string) => setLevelSearchTerm(inputValue),
      onMenuScrollToBottom: onLevelScrollToBottom,
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    mutate([
      `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
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
              <TableHeaderActions onReload={handleReload} />
            </CardHeader>
            <div className='pb-4'>
              <StudentsRegisteredTable
                page={page}
                rowPerPage={rowPerPage}
                students={students?.data}
                filters={filters}
                loading={students?.isLoading}
              />
            </div>
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default Students;
