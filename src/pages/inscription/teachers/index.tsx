import React from "react";
import { Card, CardHeader, Container, Row } from "reactstrap";
import StudentsTable from "@/components/own/tables/students-table";

const Students = () => {
  return (
    <div className="page-body">
      <Container className="basic_table" fluid>
        <Row>
          <Card>
            <CardHeader></CardHeader>
            <div className="pb-4">
              <StudentsTable />
            </div>
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default Students;
