import React, { useEffect, useState } from "react";
import useSWR, { mutate } from "swr";
import { Card, CardBody, Col, Table } from "reactstrap";
import { CommonHeader } from "./AcademicPerformance/CommonHeader";
import { getProfessorsCoursesAndStudents } from "helper/api-data/professor";

const ProfessorsTable = () => {
  const [data, setData] = useState([]);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    getProfessorsCoursesAndStudents()
      .then((response) => {
        setData(response.data);
      })
      .catch((err) => {
        setError(err);
      });
  }, []);

  return (
    <Col xl={12}>
      <Card>
        <CommonHeader title="Professors" />
        <CardBody className="pt-0">
          <Table responsive striped>
            <thead>
              <tr>
                <th>#</th>
                <th>Professors</th>
                <th>Total Courses</th>
                <th>Total Students</th>
              </tr>
            </thead>
            <tbody>
              {data.map((prof: any, index) => (
                <tr key={prof.id || index}>
                  <td>{index + 1}</td>
                  <td>{prof.professorName}</td>
                  <td>{prof.totalCourses}</td>
                  <td>{prof.totalStudents}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </CardBody>
      </Card>
    </Col>
  );
};

export default ProfessorsTable;
