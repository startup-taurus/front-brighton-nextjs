import React, { useState } from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";
import StudentsTable from "@/components/own/tables/students-table";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import StudentForm from "@/components/own/form/student-form";
import { useRouter } from "next/router";
import { FiltersProps } from "../../../../Types/types";
import TableFilters from "@/components/own/table-filters/table-filters";
import { getFiltersString, setQueryStringValue } from "../../../../utils/utils";
import useSWR from "swr";
import { getAllStudent } from "../../../../helper/api-data/student";

const Students = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);

  const filterStatus = router?.query.status ? String(router?.query.status) : "";
  const filterCourse = router?.query.course ? String(router?.query.course) : "";
  const filterLevel = router?.query.level ? String(router?.query.level) : "";
  const filterPromotion = router?.query.promotion
    ? String(router?.query.promotion)
    : "";
  const page = router.query.page ? Number(router.query.page) : 1;
  const rowPerPage = router.query.rowPerPage
    ? Number(router.query.rowPerPage)
    : 10;

  const filters = getFiltersString([
    { key: "status", value: filterStatus },
    { key: "course", value: filterCourse },
    { key: "level", value: filterLevel },
    { key: "promotion", value: filterPromotion },
  ]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: "Status",
      name: "status",
      items: [
        { label: "Active", value: "active" },
        { label: "Inactive", value: "inactive" },
      ],
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("status", value),
      value: filterStatus,
    },
    {
      labelName: "Course",
      name: "course",
      items: [{ label: "H-16", value: 1 }],
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("course", value),
      value: filterCourse,
    },
    {
      labelName: "Level",
      name: "level",
      items: [{ label: "A1", value: "a1" }],
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("level", value),
      value: filterLevel,
    },
    {
      labelName: "Promotion",
      name: "promotion",
      items: [{ label: "Navidad", value: "Navidad" }],
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("promotion", value),
      value: filterPromotion,
    },
  ];

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };
  const handleCollapse = () => {
    setIsOpen(!isOpen);
  };
  const handleReload = () => {
    setReload(!reload);
  };
  const handleChangeFilter = (key: string, value: string | number) => {
    setQueryStringValue(key, value, router);
  };

  const students = useSWR(
    [`/student/get-all${filters ? `?${filters}` : ""}`],
    () => getAllStudent(page, rowPerPage),
  );

  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
          <TableFilters
            selectFilters={selectFilters}
            isOpen={isOpen}
            handleCollapse={handleCollapse}
          />
        </Row>
        <Row>
          <Card>
            <CardHeader className="d-flex justify-content-end">
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: "Create Student",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <StudentsTable
                reload={reload}
                page={page}
                rowPerPage={rowPerPage}
                students={students?.data}
                filters={filters}
              />
            </div>
          </Card>
        </Row>
      </Container>
      <StudentForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Students;
