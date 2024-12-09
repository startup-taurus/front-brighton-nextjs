import React, { useState } from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import CoursesTable from "@/components/own/tables/courses-table";
import CourseForm from "@/components/own/form/course-form";
import { FiltersProps } from "../../../../Types/types";
import { COURSE_TYPE_FILTER, STATUS_FILTER } from "../../../../utils/constants";
import TableFilters from "@/components/own/table-filters/table-filters";

const Students = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload(!reload);
  };

  const selectFilters: FiltersProps[] = [
    {
      labelName: "Status",
      name: "status",
      type: "select",
      items: STATUS_FILTER,
    },
    {
      labelName: "N° of course",
      name: "course_number",
      type: "text",
    },
    {
      labelName: "Name of course",
      name: "course_name",
      type: "text",
    },
    {
      labelName: "Teacher",
      name: "teacher_name",
      type: "text",
    },
    {
      labelName: "Type",
      name: "course_type",
      type: "select",
      items: COURSE_TYPE_FILTER,
    },
  ];

  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className="d-flex justify-content-end">
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: "Create Course",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <CoursesTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <CourseForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Students;
