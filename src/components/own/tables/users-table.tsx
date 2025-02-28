import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import { getAllUsers, updateStatusUser } from "helper/api-data/user";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import UserForm from "../form/user-form";
import { getFiltersString } from "../../../../utils/utils";

const UsersTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    mutate([
      `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ]);
  }, [reload]);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);

    if (isOpen) {
      mutate([
        `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
      ]);
    }
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
          mutate([
            `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
          ]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      const response = await updateStatusUser(data.id, status);
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;
  const filters = getFiltersString(router);

  const {
    data: users,
    error,
    isLoading,
  } = useSWR(
    [
      `/user/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ],
    () => getAllUsers(page, rowPerPage, filters),
  );

  if (!users?.data?.result) return null;

  const columns = [
    {
      name: "Actions",
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert(row)}
          stauts={row.status === "active" ? false : true}
        />
      ),
      minWidth: "180px",
      sortable: false,
      center: false,
    },
    {
      name: "Names",
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
      cell: (row: any) => (
        <span
          className={`badge ${
            row.role === "professor"
              ? "badge-primary"
              : row.role === "student"
                ? "badge-info"
                : row.role === "admin_staff"
                  ? "badge-warning"
                  : "badge-secondary"
          }`}
        >
          {row.role.charAt(0).toUpperCase() +
            row.role.slice(1).replace("_", " ")}
        </span>
      ),
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
      name: "Failed Attempts",
      selector: (row: any) =>
        row.failed_attempts != null ? row.failed_attempts : 0,
      sortable: true,
      center: false,
    },
    {
      name: "Created At",
      selector: (row: any) => new Date(row.created_at).toLocaleString(),
      sortable: true,
      center: false,
    },
    {
      name: "Last Login",
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
        progressPending={isLoading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
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
