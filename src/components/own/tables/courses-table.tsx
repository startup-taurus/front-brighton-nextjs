import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { getAllCourses } from "helper/api-data/course";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";

const CoursesTable = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
  };

  const buttonStyle = Swal.mixin({
    customClass: {
      cancelButton: "btn-danger",
      confirmButton: "btn btn-success",
    },
    buttonsStyling: true,
  });

  const handleAlert = () => {
    buttonStyle.fire({
      title: "Está seguro?",
      text: "Esta acción no se puede revertir!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, desactivar!",
      cancelButtonText: "No, cancelar!",
      reverseButtons: true,
    });
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: courses,
    error,
    isLoading,
  } = useSWR([`/course/get-all`, page, rowPerPage], () =>
    getAllCourses(page, rowPerPage)
  );

  if (!courses?.data?.result) return null;

  const columns = [
    {
      name: "Acción",
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert()}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "Código",
      selector: (row: any) => `${row.course_number}`,
      sortable: true,
      center: false,
    },
    {
      name: "Nombre del Curso",
      selector: (row: any) => `${row.course_name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Fecha de Inicio",
      selector: (row: any) => `${row.start_date}`,
      sortable: true,
      center: false,
    },
    {
      name: "Fecha de Fin",
      selector: (row: any) => `${row.end_date}`,
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
      name: "Nivel",
      selector: (row: any) => `${row.course_type}`,
      sortable: true,
      center: false,
    },
    {
      name: "Horario",
      selector: (row: any) => `${row.schedule}`,
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={courses.data.result}
        pagination
        paginationServer
        paginationTotalRows={courses.data.totalCount}
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
    </div>
  );
};

export default CoursesTable;
