import React, { useState, useEffect } from 'react';
import useSWR, { mutate } from 'swr';
import { useRouter } from 'next/router';
import DataTable from 'react-data-table-component';
import { getAllSyllabus } from 'helper/api-data/syllabus';
import SyllabusItemsModal from '../form/syllabus-item';
import TableActionButtons from '../table-action-buttons/table-action-buttons';
import SyllabusForm from '../form/syllabus-form';
import TableSkeleton from '../common/table-skeleton/TableSkeleton';

const SyllabusTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedData, setSelectedData] = useState(null);
  const [isCopyMode, setIsCopyMode] = useState(false);

  const [page, rowPerPage] = React.useMemo(
    () => [
      router.query.page ? Number(router.query.page) : 1,
      router.query.rowPerPage ? Number(router.query.rowPerPage) : 10,
    ],
    [router.query.page, router.query.rowPerPage]
  );

  const syllabusKey = `/syllabus/get-all?page=${page}&limit=${rowPerPage}`;

  const toggle = (syllabus: any) => {
    setIsOpen(!isOpen);
    setSelectedItems(syllabus.items || []);
    setSelectedSyllabus(syllabus.syllabus_name);

    if (isOpen) {
      mutate(syllabusKey);
    }
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsCopyMode(false);
    setIsOpenDetail(!isOpenDetail);
    if (isOpenDetail) {
      mutate(syllabusKey);
    }
  };

  const handleCopy = (syllabus: any) => {
    const copiedData = { ...syllabus, id: '' };
    setSelectedData(copiedData);
    setIsCopyMode(true);
    setIsOpenDetail(true);
  };

  useEffect(() => {
    if (syllabusKey) {
      mutate(syllabusKey);
    }
  }, [reload, syllabusKey]);

  const {
    data: syllabus,
    error,
    isLoading,
  } = useSWR(syllabusKey, () => getAllSyllabus(page, rowPerPage), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 10000,
    revalidateIfStale: false,
  });

  if (isLoading) {
    return (
      <TableSkeleton
        rows={10}
        columns={5}
        showHeader={true}
        animated={true}
      />
    );
  }

  if (!syllabus?.data) return null;

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
    <div className='table-responsive syllabus-table'>
      <DataTable
        columns={columns}
        data={syllabus.data?.results}
        progressPending={isLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={syllabus?.data?.totalCount}
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
        toggle={toggle}
        syllabusName={selectedSyllabus}
        items={selectedItems}
      />
      <SyllabusForm
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
        isCopy={isCopyMode}
        onReload={() => mutate(syllabusKey)}
      />
    </div>
  );
};

export default SyllabusTable;
