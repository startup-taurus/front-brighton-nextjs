import React, { useState } from "react";
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
import { FiltersProps } from "../../../../Types/types";
import { STATUS_FILTER, USER_ROLES } from "../../../../utils/constants";
import TableFilters from "@/components/own/table-filters/table-filters";
const Users = () => {
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
      labelName: "User type",
      name: "user_type",
      type: "select",
      items: USER_ROLES,
    },
    {
      labelName: "Status",
      name: "status",
      type: "select",
      items: STATUS_FILTER,
    },
    {
      labelName: "Username",
      name: "username",
      type: "text",
    },
    {
      labelName: "Name",
      name: "name",
      type: "text",
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
