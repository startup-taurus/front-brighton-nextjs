import React, { useEffect, useState } from "react";
import { mutate } from "swr";
import { useRouter } from "next/router";
import { updateStatusStudent } from "helper/api-data/student";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import StudentForm from "../form/student-form";
import StudentDetail from "../student-detail/student-datail";
import DataTable from "react-data-table-component";
import { setQueryStringValue } from "../../../../utils/utils";

const StudentsTable = ({ students, page, rowPerPage, filters }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
    if (isOpen) {
      mutate([
        `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
      ]);
    }
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
          mutate([
            `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
          ]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      const response = await updateStatusStudent(data.id, status);
      if (response.statusCode === 200) {
        mutate([
          `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
        ]);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  if (!students?.data?.result) return null;

  const columns = [
    {
      name: "Acción",
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggleDetail(row)}
          onBlock={() => handleAlert(row)}
          onEdit={() => toggle(row)}
          status={row.status === "active" ? false : true}
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
      name: "Student name",
      selector: (row: any) => `${row.user.name}`,
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
      name: "Course",
      selector: (row: any) =>
        row.course[0]?.course_name ? row.course[0].course_name : "",
      sortable: true,
      center: false,
    },
    {
      name: "Level",
      selector: (row: any) => `${row.level}`,
      sortable: true,
      center: false,
    },
    {
      name: "Promotion",
      selector: (row: any) => `${row.promotion ?? ""}`,
      sortable: true,
      center: false,
    },
    {
      name: "Status payment",
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
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={students?.data.result}
        pagination
        paginationServer
        paginationTotalRows={students.data.totalCount}
        onChangePage={(page) => setQueryStringValue("page", page, router)}
        onChangeRowsPerPage={(newPerPage) =>
          setQueryStringValue("newPerPage", newPerPage, router)
        }
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
