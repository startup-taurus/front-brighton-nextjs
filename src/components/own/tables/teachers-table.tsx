import React, { useState, useEffect } from "react";
import useSWR, { mutate }  from "swr";
import { useRouter } from "next/router";
import { getAllProfessors, updateStatusProfessor } from "helper/api-data/professor";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import TeacherForm from "../form/teacher-form";

const ProfessorsTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    mutate([`/professor/get-all`, page, rowPerPage]);
  }, [reload]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
  };

  const handleAlert = (row: any) => {
    let status = row?.status === "active" ? "deactivate" : "active";
    Swal.fire({
      title: "Are you sure to " + status + "?",
      text: "You are about to " + status + " this user",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, " + status + "!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        updateStatus(row).then(() => {
          mutate([`/professor/get-all`, page, rowPerPage]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      const response = await updateStatusProfessor(data.id, status);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: professors,
    error,
    isLoading,
  } = useSWR([`/professor/get-all`, page, rowPerPage], () =>
    getAllProfessors(page, rowPerPage)
  );

  if (!professors?.data?.result) return null;

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
      name: "ID",
      selector: (row: any) => `${row.cedula}`,
      sortable: true,
      center: false,
    },
    {
      name: "Names",
      selector: (row: any) => `${row.user.name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Email",
      selector: (row: any) => `${row.email}`,
      sortable: true,
      center: false,
    },
    {
      name: "Phone",
      selector: (row: any) => `${row.phone}`,
      sortable: true,
      center: false,
    },
    {
      name: "Hourly Rate",
      selector: (row: any) => `${row.hourly_rate}`,
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
    {
      name: "Last login",
      selector: (row: any) => new Date(row.user.last_login).toLocaleString(),
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={professors.data.result}
        pagination
        paginationServer
        paginationTotalRows={professors.data.totalCount}
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
      <TeacherForm isOpen={isOpen} toggle={toggle} data={selectedData} />
      {/* <TeacherDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      /> */}
    </div>
  );
};

export default ProfessorsTable;
