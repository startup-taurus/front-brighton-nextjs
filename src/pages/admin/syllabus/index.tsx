import SyllabusForm from "@/components/own/form/syllabus-form";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import SyllabusTable from "@/components/own/tables/syllabus-table";
import React, { useState } from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";

const Syllabus = () => {
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleReload = () => {
    setReload(!reload);
  };

  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
          <Card>
            <CardHeader className="d-flex justify-content-end">
              <TableHeaderActions
                onReload={handleReload}
                addButton={{
                  title: "Create syllabus",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <SyllabusTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <SyllabusForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Syllabus;
