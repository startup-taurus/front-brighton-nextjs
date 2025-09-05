import TeacherForm from '@/components/own/form/teacher-form';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TeachersTable from '@/components/own/tables/teachers-table';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import TableFilters from '@/components/own/table-filters/table-filters';
import { FiltersProps } from '../../../../Types/types';
import { STATUS_FILTER } from '../../../../utils/constants';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { getAllProfessors } from '../../../../helper/api-data/professor';
import { SelectOption } from 'Types/SelectType';
import { mutate } from 'swr';
import { getFiltersString } from '../../../../utils/utils';

const Teachers = () => {
  const limit = 10;
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const rowPerPage = router.query.rowPerPage ? Number(router.query.rowPerPage) : 10;
  const filters = getFiltersString(router);
  const [professorOptions, setProfessorOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const [professorFilter, setProfessorFilter] = useState<SelectOption | null>(
    null
  );
  const { data: professorsData } = useSWR(
    ['/professor/get-all', page, limit, searchTerm],
    () => getAllProfessors(page, limit, searchTerm ? `name=${searchTerm}` : ''),
    {
      revalidateOnFocus: false,
    }
  );

  const onProfessorScrollBottom = () => {
    if (
      professorsData?.data?.result?.length ||
      professorsData?.data?.length !== 0
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };

  useEffect(() => {
    if (professorsData?.data?.result) {
      const options = professorsData.data.result.map((professor: any) => ({
        label: professor.user.name,
        value: professor.user.name,
      }));

      setProfessorOptions((prevOptions) => {
        const combined = [...prevOptions, ...options];
        return combined.filter(
          (option, index, self) =>
            self.findIndex((options) => options.value === option.value) ===
            index
        );
      });
    }
  }, [professorsData]);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    mutate([
      `/professor/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ]);
    
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/professor/'),
      undefined,
      { revalidate: true }
    );
  };

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Name',
      name: 'name',
      type: 'select',
      items: professorOptions,
      value: professorFilter,
      inputValue: searchTerm,
      onChange: (option) => {
        setProfessorFilter(option);
      },
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
                  title: 'Create Teacher',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <TeachersTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <TeacherForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
        onReload={handleReload}
      />
    </div>
  );
};

export default Teachers;
