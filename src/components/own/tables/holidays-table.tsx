import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import { getAllHolidays, updateHolidayStatus } from "helper/api-data/holidays";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import HolidaysForm from "../form/holidays-form";
import TableSkeleton from "../common/TableSkeleton";

const HolidaysTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    mutate([`/holidays/get-all`, page, rowPerPage]);
  }, [reload]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
    if (isOpen) {
      mutate([`/holidays/get-all`, page, rowPerPage]);
    }
  };

  const handleAlert = (row: any) => {
    let status = row?.status === "active" ? "deactivate" : "activate";
    Swal.fire({
      title: "Are you sure to " + status + " this holiday?",
      text: "You are about to " + status + " this holiday",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, " + status + "!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row).then(() => {
          mutate([`/holidays/get-all`, page, rowPerPage]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      const response = await updateHolidayStatus(data.id, status);
      if (response.statusCode === 200) {
        mutate([`/holidays/get-all`, page, rowPerPage]);
      }
    } catch (error) {
      console.error("Error updating holiday status:", error);
    }
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: holidays,
    error,
    isLoading,
  } = useSWR([`/holidays/get-all`, page, rowPerPage], () =>
    getAllHolidays(page, rowPerPage),
  );

  if (isLoading) {
    return (
      <TableSkeleton
        rows={10}
        columns={6}
        showHeader={true}
        animated={true}
      />
    ); 
  }

  if (!holidays?.data?.result) return null;

  const columns = [
    {
      name: "Actions",
      cell: (row: any) => (
        <TableActionButtons
          onBlock={() => handleAlert(row)}
          onEdit={() => toggle(row)}
          stauts={row.status === "active" ? false : true}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "Holiday Name",
      selector: (row: any) => `${row.holiday_name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Holiday Date",
      selector: (row: any) => `${row.holiday_date}`,
      sortable: true,
      center: false,
    },
    {
      name: "Description",
      selector: (row: any) => `${row.description || ""}`,
      sortable: false,
      center: false,
    },
    {
      name: "Type",
      selector: (row: any) =>
        `${row.holiday_type.charAt(0).toUpperCase() + row.holiday_type.slice(1)}`,
      sortable: true,
      center: false,
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span
          className={`badge ${row.status === "active" ? "badge-success" : "badge-danger"}`}
        >
          {row?.status?.charAt(0).toUpperCase() + row?.status?.slice(1)}
        </span>
      ),
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className="table-responsive">
      <DataTable
        columns={columns}
        data={holidays.data.result}
        progressPending={isLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        pagination
        paginationServer
        paginationTotalRows={holidays.data.totalCount}
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
      <HolidaysForm isOpen={isOpen} toggle={toggle} data={selectedData} />
    </div>
  );
};

export default HolidaysTable;
