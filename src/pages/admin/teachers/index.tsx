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

const Teachers = () => {
  const limit = 10;
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const [professorOptions, setProfessorOptions] = useState<
    Array<{ label: string; value: string }>
  >([]);
  const [searchTerm, setSearchTerm] = useState('');

  const { data: professorsData } = useSWR(
    ['/professor/get-all', page, limit, searchTerm],
    () => getAllProfessors(page, limit, searchTerm),
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

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Name',
      name: 'name',
      type: 'select',
      items: professorOptions,
      placeholder: 'Select teacher name',
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
      />
    </div>
  );
};

export default Teachers;
