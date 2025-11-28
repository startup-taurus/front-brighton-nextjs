import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { getAllSyllabus } from 'helper/api-data/syllabus';
import SyllabusItemsModal from '../form/syllabus-item';
import TableActionButtons from '../table-action-buttons/table-action-buttons';
import SyllabusForm from '../form/syllabus-form';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';

const SyllabusTable = ({
  syllabuses,
  page,
  rowPerPage,
  filters,
  loading,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);
  

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
    mutate(
      `/syllabus/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
      undefined,
      { revalidate: true }
    );
    
    mutate(
      (key) => typeof key === 'string' && key.startsWith('/syllabus/'),
      undefined,
      { revalidate: true }
    );
  };


  const {
    data: syllabus,
    isLoading,
  } = useSWR(
    syllabuses ? null : `/syllabus/get-all?page=${page}&rowPerPage=${rowPerPage}${
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

  const finalSyllabusData = syllabuses || syllabus;
  const showLoading = loading || (isLoading && !syllabuses);

  if (showLoading) {
    return (
      <TableSkeleton rows={10} columns={6} showHeader={true} animated={true} />
    );
  }

  if (!finalSyllabusData?.data?.results) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggle(row)}
          onEdit={() => toggleDetail(row)}
          onCopy={() => handleCopy(row)}
          module={'Syllabus'}
        />
      ),
      width: '220px',
      minWidth: '220px',
      maxWidth: '220px',
      sortable: false,
      center: true,
    },
    {
      name: 'Syllabus Name',
      selector: (row: any) => `${row.syllabus_name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Level',
      selector: (row: any) => {
        if (!row.level) return '';
        if (typeof row.level === 'string') return row.level.toUpperCase();
        if (typeof row.level === 'object') {
          return (row.level.name || row.level.full_level || '').toUpperCase();
        }
        return '';
      },
      sortable: true,
      center: true,
    },
    {
      name: 'Assig Percentage',
      selector: (row: any) => `${row.percentages?.assig_percentage}%`,
      sortable: true,
      center: true,
    },
    {
      name: 'Test Percentage',
      selector: (row: any) => `${row.percentages?.test_percentage}%`,
      sortable: true,
      center: true,
    },
    {
      name: 'Exam Percentage',
      selector: (row: any) => `${row.percentages?.exam_percentage}%`,
      sortable: true,
      center: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={finalSyllabusData.data.results}
        progressPending={showLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={finalSyllabusData.data.totalCount}
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
