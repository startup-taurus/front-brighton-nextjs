import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import DataTable from "react-data-table-component";
import { getAllSyllabus } from "helper/api-data/syllabus";
import SyllabusItemsModal from "../form/syllabus-item";
import TableActionButtons from "../table-action-buttons/table-action-buttons";
import SyllabusForm from "../form/syllabus-form";

const SyllabusTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const [selectedItems, setSelectedItems] = useState([]);
  const [selectedSyllabus, setSelectedSyllabus] = useState(null);
  const [selectedData, setSelectedData] = useState(null);

  const toggle = (syllabus: any) => {
    setIsOpen(!isOpen);
    setSelectedItems(syllabus.items || []);
    setSelectedSyllabus(syllabus.syllabus_name);

    if (isOpen) {
      mutate([`/syllabus/get-all`, page, rowPerPage]);
    }
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
    if (isOpenDetail) {
      mutate([`/syllabus/get-all`, page, rowPerPage]);
    }
  };

  useEffect(() => {
    mutate([`/syllabus/get-all`, page, rowPerPage]);
  }, [reload]);

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: syllabus,
    error,
    isLoading,
  } = useSWR([`/syllabus/get-all`, page, rowPerPage], () =>
    getAllSyllabus(page, rowPerPage)
  );

  if (!syllabus?.data) return null;

  const columns = [
    {
      name: "Actions",
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggle(row)}
          onEdit={() => toggleDetail(row)}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "Syllabus Name",
      selector: (row: any) => `${row.syllabus_name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Assig Percentage",
      selector: (row: any) => `${row.percentages?.assig_percentage}%`,
      sortable: true,
      center: false,
    },
    {
      name: "Test Percentage",
      selector: (row: any) => `${row.percentages?.test_percentage}%`,
      sortable: true,
      center: false,
    },
    {
      name: "Exam Percentage",
      selector: (row: any) => `${row.percentages?.exam_percentage}%`,
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className="table-responsive syllabus-table">
      <DataTable
        columns={columns}
        data={syllabus.data}
        pagination
        paginationServer
        paginationTotalRows={syllabus.totalCount}
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
      />
    </div>
  );
};

export default SyllabusTable;
