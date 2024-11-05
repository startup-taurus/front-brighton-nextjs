import { useState } from "react";
import TableHeaderActions from "@/components/own/table-header-actions/table-header-actions";
import {
  Card,
  CardHeader,
  Container,
  Row,
} from "reactstrap";
import HolidaysTable from "@/components/own/tables/holidays-table";
import HolidaysForm from "@/components/own/form/holidays-form";
const Holidays = () => {
  const [isOpen, setIsOpen] = useState(false);
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
                  title: "Create holiday",
                  onClick: () => toggle(),
                }}
              />
            </CardHeader>
            <div className="pb-4">
              <HolidaysTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      <HolidaysForm isOpen={isOpenModal} toggle={toggle} data={null} />
    </div>
  );
};

export default Holidays;
