import React, { useState, useEffect } from "react";
import useSWR, { mutate } from "swr";
import { useRouter } from "next/router";
import {
  getCourseWithProfessors,
  updateStatusCourse,
} from "helper/api-data/course";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import Swal from "sweetalert2";
import DataTable from "react-data-table-component";
import CourseForm from "../form/course-form";

const CoursesTable = ({ reload }: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [selectedData, setSelectedData] = useState(null);

  useEffect(() => {
    mutate([`/course/get-all-with-professors`, page, rowPerPage]);
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
          mutate([`/course/get-all-with-professors`, page, rowPerPage]);
        });
      }
    });
  };

  const updateStatus = async (data: any) => {
    try {
      let status = data?.status === "active" ? "inactive" : "active";
      const response = await updateStatusCourse(data.id, status);
      if (response.statusCode === 200) {
        mutate([`/course/get-all-with-professors`, page, rowPerPage]);
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const {
    data: courses,
    error,
    isLoading,
  } = useSWR([`/course/get-all-with-professors`, page, rowPerPage], () =>
    getCourseWithProfessors(page, rowPerPage)
  );

  if (!courses?.data?.result) return null;

  const columns = [
    {
      name: "Acción",
      cell: (row: any) => (
        <TableActionButtons
          onEdit={() => toggle(row)}
          onBlock={() => handleAlert(row)}
          stauts={row.status === "active" ? false : true}
        />
      ),
      sortable: false,
      center: false,
    },
    {
      name: "N° of course",
      selector: (row: any) => `${row.course_number}`,
      sortable: true,
      center: false,
    },
    {
      name: "Name",
      selector: (row: any) => `${row.course_name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Professor",
      selector: (row: any) => `${row.professor?.user?.name}`,
      sortable: true,
      center: false,
    },
    {
      name: "Start date",
      selector: (row: any) => `${row.start_date}`,
      sortable: true,
      center: false,
    },
    {
      name: "End date",
      selector: (row: any) => `${row.end_date}`,
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
      name: "Type",
      selector: (row: any) => `${row.course_type}`,
      sortable: true,
      center: false,
    },
    {
      name: "Schedule",
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
      <CourseForm isOpen={isOpen} toggle={toggle} data={selectedData} />
    </div>
  );
};

export default CoursesTable;
