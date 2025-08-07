import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { getAllSyllabus } from 'helper/api-data/syllabus';
import SyllabusItemsModal from '../form/syllabus-item';
import TableActionButtons from '../table-action-buttons/table-action-buttons';
import SyllabusForm from '../form/syllabus-form';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';
import { getFiltersString } from '../../../../utils/utils';
import { SyllabusTableProps } from '../../../../Types/TableType';

const SyllabusTable: React.FC<SyllabusTableProps> = ({ reload }) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage ? Number(router.query.rowPerPage) : 10;
  const filters = getFiltersString(router);

  const toggle = (syllabus: any, forceUpdate = false) => {
    setIsOpen(!isOpen);
    setSelectedItems(syllabus.items || []);
    setSelectedSyllabus(syllabus.syllabus_name);

    if (isOpen && forceUpdate) {
      mutateData();
    }
  };

  const toggleDetail = (data: any, forceUpdate = false) => {
    setSelectedData(data);
    setIsCopyMode(false);
    setIsOpenDetail(!isOpenDetail);
    
    if (isOpenDetail && forceUpdate) {
      mutateData();
    }
  };

  const handleCopy = (syllabus: any) => {
    const copiedData = { ...syllabus, id: '' };
    setSelectedData(copiedData);
    setIsCopyMode(true);
    setIsOpenDetail(true);
  };

  const mutateData = () => {
    mutate([
      `/syllabus/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
    ]);

    mutate(
      (key) => typeof key === 'string' && key.startsWith('/syllabus/'),
      undefined,
      { revalidate: true }
    );
  };

  useEffect(() => {
    if (reload) {
      mutateData();
    }
  }, [reload]);

  const {
    data: syllabus,
    isLoading,
  } = useSWR(
    `/syllabus/get-all?page=${page}&rowPerPage=${rowPerPage}${
            filters ? `&${filters}` : ''
          }`,
    () => {
      const filter = filters ? 
        Object.fromEntries(new URLSearchParams(filters)) : {};
      return getAllSyllabus(page, rowPerPage, filters);
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: false,
      dedupingInterval: 10000,
      revalidateIfStale: false,
    }
  );

  if (isLoading) {
    return (
      <TableSkeleton rows={10} columns={6} showHeader={true} animated={true} />
    );
  }

  if (!syllabus?.data?.results) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggle(row)}
          onEdit={() => toggleDetail(row)}
          onCopy={() => handleCopy(row)}
        />
      ),
      minWidth: '200px',
      sortable: false,
      center: false,
    },
    {
      name: 'Syllabus Name',
      selector: (row: any) => `${row.syllabus_name}`,
      sortable: true,
      center: false,
    },
    {
      name: 'Level',
      selector: (row: any) => {
        if (!row.level) return '';
        if (typeof row.level === 'string') return row.level;
        if (typeof row.level === 'object') {
          return row.level.name || row.level.full_level || '';
        }
        return '';
      },
      sortable: true,
      center: false,
    },
    {
      name: 'Assig Percentage',
      selector: (row: any) => `${row.percentages?.assig_percentage}%`,
      sortable: true,
      center: false,
    },
    {
      name: 'Test Percentage',
      selector: (row: any) => `${row.percentages?.test_percentage}%`,
      sortable: true,
      center: false,
    },
    {
      name: 'Exam Percentage',
      selector: (row: any) => `${row.percentages?.exam_percentage}%`,
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={syllabus.data.results}
        progressPending={isLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={syllabus.data.totalCount}
        onChangePage={(page) => {
          router.push({
            pathname: router.pathname,
            query: { ...router.query, page },
          });
        }}
        onChangeRowsPerPage={(newPerPage) => {
          router.push({
            pathname: router.pathname,
            query: { ...router.query, rowPerPage: newPerPage },
          });
        }}
        highlightOnHover
        selectableRows={false}
      />
           <SyllabusItemsModal
        isOpen={isOpen}
        toggle={(data: any, shouldReload = false) => toggle(data, shouldReload)}
        syllabusName={selectedSyllabus}
        items={selectedItems}
      />
      <SyllabusForm
        isOpen={isOpenDetail}
        toggle={(data: any, shouldReload = false) => toggleDetail(data, shouldReload)}
        data={selectedData}
        isCopy={isCopyMode}
        onReload={mutateData}
      />
    </div>
  );
};

export default SyllabusTable;
