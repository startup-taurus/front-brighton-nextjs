import SyllabusForm from "@/components/own/form/syllabus-form";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import SyllabusTable from "@/components/own/tables/syllabus-table";
import React, { useState } from "react";
import { FaChevronDown, FaFilter } from "react-icons/fa";
import {
  Card,
  CardHeader,
  Container,
  Row,
} from "reactstrap";
const Syllabus = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);
  const [reload, setReload] = useState(false);
  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleCollapse = () => {
    setIsOpen(!isOpen);
  };

  const handleReload = () => {
    setReload(!reload);
  };
  
  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
          <Card>
            <CardHeader
              className="d-flex justify-content-between"
              onClick={handleCollapse}
            >
              <h5>Filtros de Búsqueda</h5>
              <button
                onClick={handleCollapse}
                className={`btn btn-link text-black p-0 ${isOpen && "btn-collapse"}`}
              >
                <FaChevronDown />
              </button>
            </CardHeader>
          </Card>
        </Row>
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
