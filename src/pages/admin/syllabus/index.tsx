import SyllabusForm from '@/components/own/form/syllabus-form';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import SyllabusTable from '@/components/own/tables/syllabus-table';
import TableFilters from '@/components/own/table-filters/table-filters';
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import { getAllLevels } from 'helper/api-data/level';
import { FiltersProps } from '../../../../Types/types';
import { SelectOption } from 'Types/SelectType';
import { getFiltersString } from '../../../../utils/utils';

const Syllabus = () => {
  const router = useRouter();
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  
  const limit = 10;
  const [levelPage, setLevelPage] = useState(1);
  const [levelSearchTerm, setLevelSearchTerm] = useState('');
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [levelSearch, setLevelSearch] = useState('');
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);
  
  const filters = getFiltersString(router);
  
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
      labelName: 'Syllabus Name', 
      name: 'syllabus_name', 
      type: 'text' 
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
