import React, { useState } from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";
import StudentsTable from "@/components/own/tables/students-table";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import StudentForm from "@/components/own/form/student-form";
import { useRouter } from "next/router";
import { FiltersProps } from "../../../../Types/types";
import TableFilters from "@/components/own/table-filters/table-filters";
import {
  getFiltersString,
  handleChangeFilter,
  setQueryStringValue,
} from "../../../../utils/utils";
import useSWR, { mutate } from "swr";
import { getAllStudent } from "../../../../helper/api-data/student";
import {
  getActiveCourses,
  getAllCourses,
} from "../../../../helper/api-data/course";
import {
  LEVEL_FILTER,
  PROMOTION_FILTER,
  STATUS_FILTER,
} from "../../../../utils/constants";

const Students = () => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

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

  const students = useSWR(
    [
      `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ],
    () => getAllStudent(page, rowPerPage, filters),
  );

  const course = useSWR(`/course/get-all`, () => getAllCourses());

  const selectFilters: FiltersProps[] = [
    {
      labelName: "Status",
      name: "status",
      items: STATUS_FILTER,
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("status", value, router),
      value: filterStatus,
    },
    {
      labelName: "Course",
      name: "course",
      items: course?.data
        ? course?.data?.data?.result?.map((item: any) => ({
            label: item.course_name,
            value: item.id,
          }))
        : [],
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("course", value, router),
      value: filterCourse,
    },
    {
      labelName: "Level",
      name: "level",
      items: LEVEL_FILTER,
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("level", value, router),
      value: filterLevel,
    },
    {
      labelName: "Promotion",
      name: "promotion",
      items: PROMOTION_FILTER,
      onChange: ({ target: { value } }: any) =>
        handleChangeFilter("promotion", value, router),
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
    mutate([
      `/student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ""}`,
    ]);
  };

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
