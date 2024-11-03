import { useState } from "react";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
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
import { FaChevronDown, FaFilter } from "react-icons/fa";
import UsersTable from "@/components/own/tables/users-table";
import UserForm from "@/components/own/form/user-form";
const Users = () => {
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
                      <Label for="roleFilter">User type</Label>
                      <Input type="select" name="role" id="roleFilter">
                        <option value="" selected disabled>
                          Select user type
                        </option>
                        <option value="admin_staff">Admin</option>
                        <option value="teacher">Teacher</option>
                        <option value="student">Student</option>
                        <option value="finalcia">Finalcia</option>
                      </Input>
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">Status</Label>
                      <Input type="select" name="student" id="studentFilter">
                        <option value="" disabled>
                          Select status
                        </option>
                        <option value="active">Active</option>
                        <option value="inactive">In-active</option>
                      </Input>
                    </Col>

                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="studentFilter">User name</Label>
                      <Input
                        type="text"
                        name="student"
                        id="studentFilter"
                        placeholder="Enter user name"
                      />
                    </Col>
                    <Col xs={12} sm={4} md={3} className="mb-3">
                      <Label for="namesFilter">Names</Label>
                      <Input
                        type="text"
                        name="names"
                        id="namesFilter"
                        placeholder="Enter names"
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
                  title: "Create User",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <UsersTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <UserForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Users;
