import React, { useState, useEffect } from "react";
import useSWR, { mutate }  from "swr";
import { useRouter } from "next/router";
import { getAllStudent } from "helper/api-data/student";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import StudentForm from "../form/student-form";
import StudentDetail from "../student-detail/student-datail";
import DataTable from "react-data-table-component";

const StudentsTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    mutate([`/student/get-all`, page, rowPerPage]);
  }, [reload]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
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
          mutate([`/student/get-all`, page, rowPerPage]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      //const response = await updateStatusProfessor(data.id, status);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: users,
    error,
    isLoading,
  } = useSWR([`/student/get-all`, page, rowPerPage], () =>
    getAllStudent(page, rowPerPage)
  );

  if (!users?.data?.result) return null;

  const columns = [
    {
      name: "Acción",
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggleDetail(row)}
          onBlock={() => handleAlert(row)}
          onEdit={() => toggle(row)}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "CI",
      selector: (row: any) => `${row.cedula}`,
      sortable: true,
      center: false,
    },
    {
      name: "Estudiante",
      selector: (row: any) => `${row.user.name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Estado",
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
      name: "Estado de pago",
      cell: (row: any) => (
        <span
          className={`badge ${row.pending_payments ? "badge-success" : "badge-danger"}`}
        >
          {row.pending_payments ? "Pagado" : "No Pagado"}
        </span>
      ),
      sortable: true,
      center: false,
    },
    {
      name: "Curso",
      selector: (row: any) =>
        row.course[0]?.course_name ? row.course[0].course_name : "",
      sortable: true,
      center: false,
    },
    {
      name: "Nivel",
      selector: (row: any) => `${row.level}`,
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={users.data.result}
        pagination
        paginationServer
        paginationTotalRows={users.data.totalCount}
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
      <StudentForm isOpen={isOpen} toggle={toggle} data={selectedData} />
      <StudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      />
    </div>
  );
};

export default StudentsTable;
