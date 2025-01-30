import React, { useState } from "react";
import { mutate } from "swr";
import { useRouter } from "next/router";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import StudentForm from "../form/student-form";
import DataTable from "react-data-table-component";
import { setQueryStringValue } from "../../../../utils/utils";
import { deleteRegisteredStudent } from "../../../../helper/api-data/registered-student";
import RegisteredStudentDetail from "@/components/own/registered-student-detail/registered-student-detail";

const StudentsRegisteredTable = ({
  students,
  page,
  rowPerPage,
  filters,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
    if (isOpen) {
      mutate([
        `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
      ]);
    }
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
  };

  const handleDelete = (row: any) => {
    Swal.fire({
      title: "Are you sure you want to delete this record?",
      text: "This action cannot be reversed",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete!",
      cancelButtonText: "Cancel",
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRegisteredStudent(row).then(() => {
          mutate([
            `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
          ]);
        });
      }
    });
  };

  if (!students?.data?.result) return null;

  const columns = [
    {
      name: "Acción",
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggleDetail(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "ID",
      selector: (row: any) => `${row.id_number}`,
      sortable: true,
      center: false,
    },
    {
      name: "Student name",
      selector: (row: any) =>
        `${row.first_name} ${row.middle_name} ${row.last_name} ${row.second_last_name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Phone",
      selector: (row: any) => `${row.phone_number}`,
      sortable: true,
      center: false,
    },
    {
      name: "Email",
      selector: (row: any) => `${row.email ?? ""}`,
      sortable: true,
      center: false,
    },
    {
      name: "Level",
      selector: (row: any) => `${row.level ?? ""}`,
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
      <RegisteredStudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      />
    </div>
  );
};

export default StudentsRegisteredTable;
