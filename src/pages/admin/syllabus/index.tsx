import React, { useState, useEffect, useRef } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import SyllabusTable from '@/components/own/tables/syllabus-table';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import SyllabusForm from '@/components/own/form/syllabus-form';
import { useRouter } from 'next/router';
import { FiltersProps } from '../../../../Types/types';
import TableFilters from '@/components/own/table-filters/table-filters';
import { getFiltersString } from '../../../../utils/utils';
import useSWR, { mutate } from 'swr';
import { getAllSyllabus } from '../../../../helper/api-data/syllabus';
import { getAllLevels } from '../../../../helper/api-data/level';
import { SelectOption } from 'Types/SelectType';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import { APP_PATHS } from 'utils/constants';

const Syllabus = () => {
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

  const syllabuses = useSWR(
    [
      `/syllabus/get-all?page=${page}&limit=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ],
    () =>
      getAllSyllabus(
        page,
        rowPerPage,
        filters || undefined
      )
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
      type: 'text',
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
    mutate([
      `/syllabus/get-all?page=${page}&limit=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ]);
  };

  const { canPermission, permissionSet } = usePermission();
  const canCreateSyllabus = canPermission(PERMISSIONS.CREATE_SYLLABUS);
  const canViewSyllabus = canPermission(PERMISSIONS.VIEW_SYLLABUS);
  useEffect(() => {
    if (permissionSet && !canViewSyllabus) {
      router.replace(APP_PATHS.DASHBOARD);
    }
  }, [permissionSet, canViewSyllabus, router]);

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
                <TableHeaderActions
                  onReload={handleReload}
                  addButton={
                    canCreateSyllabus
                      ? {
                          title: 'Create Syllabus',
                          onClick: () => toggle(),
                        }
                      : undefined
                  }
                />
              </div>
            </CardHeader>
            <div className='pb-4'>
              <SyllabusTable
                page={page}
                rowPerPage={rowPerPage}
                syllabuses={syllabuses?.data}
                filters={filters}
                loading={syllabuses.isLoading || syllabuses.isValidating}
              />
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
