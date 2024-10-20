import React from "react";
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Table,
} from "reactstrap";

const StudentDetail = ({ data, isOpen, toggle }: any) => {
  if (!data) return null;
  return (
    <div className="table-responsive signal-table">
      <Modal isOpen={isOpen} toggle={toggle} size="lg">
        <ModalHeader toggle={toggle}>Detalle del Estudiante</ModalHeader>
        <ModalBody>
          <Row>
            <Col xs={6}>
              <div className="table-bottom-divider">
                <td>
                  <strong>CI:</strong> &nbsp; {data.cedula}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Name:</strong> &nbsp; {data?.user?.name}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Profession:</strong> &nbsp; {data.profession}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Estado:</strong> &nbsp;{" "}
                  <span
                    className={`badge ${data.status ? "badge-success" : "badge-danger"}`}
                  >
                    {data?.status?.charAt(0).toUpperCase() +
                      data?.status?.slice(1)}
                  </span>
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Book delivered:</strong>&nbsp;{" "}
                  <span
                    className={`badge ${data.book_given ? "badge-success" : "badge-danger"}`}
                  >
                    {data.book_given ? "Yes" : "No"}
                  </span>
                </td>
              </div>
            </Col>
            <Col xs={6}>
              <div className="table-bottom-divider">
                <td>
                  <strong>Estado del Pago:</strong> &nbsp;{" "}
                  <span
                    className={`badge ${data.paymentStatus ? "badge-success" : "badge-danger"}`}
                  >
                    {data.paymentStatus ? "Pagado" : "No Pagado"}
                  </span>
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Monto de Pago:</strong> &nbsp; {data.paymentAmount}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Curso:</strong> &nbsp;{" "}
                  {data?.course?.length > 0
                    ? data.course[0]?.course_name
                    : "Curso no disponible"}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Nivel:</strong> &nbsp; {data.level}
                </td>
              </div>
            </Col>
            <Col xs={12}>
              <strong>Emergency contact</strong> &nbsp;{" "}
              <div className="table-bottom-divider d-flex gap-3">
                <div>
                  {" "}
                  <strong>Name:</strong> &nbsp; {data.emergency_contact_name}
                </div>
                <div>
                  {" "}
                  <strong>Phone:</strong> &nbsp; {data.emergency_contact_phone}
                </div>
                <div>
                  {" "}
                  <strong>Relationship:</strong> &nbsp;{" "}
                  {data.emergency_contact_relationship}
                </div>
              </div>
              <div className="border-bottom p-2">
                <td>
                  <strong>Observación:</strong> &nbsp; {data.observations}
                </td>
              </div>
            </Col>
            <Col xs={12}>
              <strong>Payments</strong> &nbsp;{" "}
              <Table responsive>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Total</th>
                  </tr>
                </thead>
                {Array.isArray(data.payments) &&
                  data.payments.map((payment: any) => (
                    <tbody>
                      <tr>
                        <td>{payment.payment_date}</td>
                        <td>{payment.payment_method}</td>
                        <td>{payment.total_payment}</td>
                      </tr>
                    </tbody>
                  ))}
              </Table>
            </Col>
          </Row>
          <div className="d-flex justify-content-end py-4">
            <Button color="danger" onClick={toggle}>
              Cerrar
            </Button>
          </div>
        </ModalBody>
      </Modal>
    </div>
  );
};

export default StudentDetail;
