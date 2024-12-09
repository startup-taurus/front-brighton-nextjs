import TeacherForm from "@/components/own/form/teacher-form";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import TeachersTable from "@/components/own/tables/teachers-table";
import React, { useState } from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";
import TableFilters from "@/components/own/table-filters/table-filters";
import { FiltersProps } from "../../../../Types/types";
import { STATUS_FILTER } from "../../../../utils/constants";
import { useRouter } from "next/router";

const Teachers = () => {
  const router = useRouter();
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
      labelName: "Name",
      name: "name",
      type: "text",
      placeholder: "Type the teacher name",
    },
    {
      labelName: "Status",
      name: "status",
      type: "select",
      items: STATUS_FILTER,
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
                  title: "Create Teacher",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <TeachersTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <TeacherForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Teachers;
