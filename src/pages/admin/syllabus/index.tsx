import SyllabusForm from '@/components/own/form/syllabus-form';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import SyllabusTable from '@/components/own/tables/syllabus-table';
import TableFilters from '@/components/own/table-filters/table-filters';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import useSWR from 'swr';
import { getAllLevels } from 'helper/api-data/level';
import { FiltersProps } from '../../../../Types/types';
import { SelectOption } from 'Types/SelectType';

const Syllabus = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [levelSearch, setLevelSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);
  
  const { data: levels } = useSWR(
    ['/level/get-all'],
    () => getAllLevels(1, 100, '', true)
  );

  useEffect(() => {
    if (levels?.data?.results) {
      const options = levels.data.results.map((level: any) => ({
        value: level.id,
        label: level.full_level,
      }));
      setLevelOptions(options);
    }
  }, [levels]);

  const selectFilters: FiltersProps[] = [
    { 
      labelName: 'Syllabus Name', 
      name: 'syllabus_name', 
      type: 'text' 
    },
    {
      labelName: 'Level',
      name: 'level_id',
      type: 'select',
      items: levelOptions,
      value: levelFilter,
      inputValue: levelSearch,
      onChange: (option) => {
        setLevelFilter(option);
      },
      onInputChange: (value) => setLevelSearch(value),
      isAsync: false,
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload(!reload);
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
                  title: 'Create syllabus',
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className='pb-4'>
              <SyllabusTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <SyllabusForm
        isOpen={isOpenModal}
        toggle={toggle}
        data={null}
        onReload={handleReload}
      />
    </div>
  );
};

export default Syllabus;
