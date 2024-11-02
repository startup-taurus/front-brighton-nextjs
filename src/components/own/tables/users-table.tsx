import React, { useState } from "react";
import useSWR from "swr";
import { useRouter } from "next/router";
import { getAllUsers } from "helper/api-data/user";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import UserForm from "../form/user-form";

const UsersTable = () => {
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
    data: users,
    error,
    isLoading,
  } = useSWR([`/user/get-all`, page, rowPerPage], () =>
    getAllUsers(page, rowPerPage)
  );

  if (!users?.data?.result) return null;

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
      name: "Nombre",
      selector: (row: any) => `${row.name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Username",
      selector: (row: any) => `${row.username}`,
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
      name: "Rol",
      selector: (row: any) => `${row.role}`,
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
      name: "Intentos Fallidos",
      selector: (row: any) =>
        row.failed_attempts != null ? row.failed_attempts : 0,
      sortable: true,
      center: false,
    },
    {
      name: "Creado en",
      selector: (row: any) => new Date(row.created_at).toLocaleString(),
      sortable: true,
      center: false,
    },
    {
      name: "Último inicio de sesión",
      selector: (row: any) => new Date(row.last_login).toLocaleString(),
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
      <UserForm isOpen={isOpen} toggle={toggle} data={selectedData} />
      {/* <StudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      /> */}
    </div>
  );
};

export default UsersTable;
