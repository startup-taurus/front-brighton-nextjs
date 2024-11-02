import React, { useState } from "react";
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
import { FaChevronDown, FaFilter } from "react-icons/fa6";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import CoursesTable from "@/components/own/tables/courses-table";
import CourseForm from "@/components/own/form/course-form";

const Students = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenModal, setIsOpenModal] = useState(false);

  const toggle = () => {
    setIsOpenModal(!isOpenModal);
  };

  const handleCollapse = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div className="page-body">
      {/* <Breadcrumbs title={"Cursos"} mainTitle={"Cursos"} parent={"Dashboard"} /> */}

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
                      <Label for="studentFilter">Nivel</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione el nivel
                        </option>
                        <option value="active">A1 Elementary</option>
                        <option value="active">A2 Elementary</option>
                        <option value="active">B1</option>
                        <option value="active">B1 +</option>
                        <option value="active">B2</option>
                      </Input>
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Curso</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione el curso
                        </option>
                        <option value="active">B-16</option>
                        <option value="active">B-20</option>
                        <option value="active">B-30</option>
                      </Input>
                    </Col>
                  </Row>
                  <div className="d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-secondary">
                      Reestablecer
                    </button>
                    <button type="button" className="btn btn-success">
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
                onReload={() => {}}
                addButton={{
                  title: "Create Course",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <CoursesTable />
            </div>
          </Card>
        </Row>
      </Container>
      <CourseForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Students;
