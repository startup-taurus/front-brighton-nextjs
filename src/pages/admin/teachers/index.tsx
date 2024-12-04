import TeacherForm from "@/components/own/form/teacher-form";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import TeachersTable from "@/components/own/tables/teachers-table";
import { useState } from "react";
import { FaChevronDown, FaFilter } from "react-icons/fa6";
import {
  Card,
  CardBody,
  CardHeader,
  Col,
  Collapse,
  Container,
  Input,
  Label,
  Row,
} from "reactstrap";

const Teachers = () => {
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
            <Collapse isOpen={isOpen}>
              <CardBody>
                <form>
                  <Row>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="professorFilter">Names</Label>
                      <Input
                        type="text"
                        name="name"
                        id="professorFilter"
                        placeholder="Enter user name"
                      />
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="professorFilter">ID</Label>
                      <Input
                        type="text"
                        name="cedula"
                        id="professorFilter"
                        placeholder="Enter id"
                      />
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-cancel">
                      Reestablecer
                    </button>
                    <button type="button" className="btn btn-save">
                      <FaFilter /> <span>Filtrar</span>
                    </button>
                  </div>
                </form>
              </CardBody>
            </Collapse>
          </Card>
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
