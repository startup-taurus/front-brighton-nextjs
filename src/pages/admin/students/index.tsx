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
import StudentsTable from "@/components/own/tables/students-table";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import { FaChevronDown, FaFilter } from "react-icons/fa6";
import { studentsData } from "../../../../Data/table/ReactStrapTableData";
import StudentForm from "@/components/own/form/student-form";

const Students = () => {
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
                      <Label for="studentFilter">Estudiante</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione al estudiante
                        </option>
                        {studentsData.map((student) => (
                          <option value={student.id}>
                            {student.name + " " + student.lastName}
                          </option>
                        ))}
                      </Input>
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Estado</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione el estado del estudiante
                        </option>
                        <option value="active">Activo</option>
                        <option value="active">Retirado</option>
                        <option value="active">Transferido</option>
                      </Input>
                    </Col>

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
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Metodo de pago</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione el metodo de pago
                        </option>
                        <option value="active">Mensual</option>
                        <option value="active">Semestral</option>
                        <option value="active">Modulo completo</option>
                      </Input>
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Estado del pago</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Seleccione el estado del pago
                        </option>
                        <option value="active">Pagado</option>
                        <option value="active">No Pagado</option>
                      </Input>
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Promoción</Label>
                      <Input
                        type="select"
                        name="student"
                        id="studentFilter"
                        placeholder="Seleccione una promoción"
                      >
                        <option value="" disabled>
                          Seleccione una promoción
                        </option>
                        <option value="na">Sin Promoción</option>
                        <option value="active">2x1</option>
                        <option value="active">Navidad</option>
                        <option value="active">Año nuevo</option>
                      </Input>
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
                  title: "Create Student",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <StudentsTable reload={reload}/>
            </div>
          </Card>
        </Row>
      </Container>
      <StudentForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Students;
