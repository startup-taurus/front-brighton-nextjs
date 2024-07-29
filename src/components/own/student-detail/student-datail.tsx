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
                  <strong>Nombre:</strong> &nbsp; {data.name} {data.lastName}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Estado:</strong> &nbsp;{" "}
                  <span
                    className={`badge ${data.isActive ? "badge-success" : "badge-danger"}`}
                  >
                    {data.isActive ? "Activo" : "Desactivo"}
                  </span>
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Metodo de Pago:</strong> &nbsp; {data.paymentMethod}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Promoción:</strong> &nbsp; {data.promotion}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Fecha de Pago:</strong> &nbsp; {data.paymentDate}
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
                  <strong>Curso:</strong> &nbsp; {data.course}
                </td>
              </div>
              <div className="table-bottom-divider">
                <td>
                  <strong>Nivel:</strong> &nbsp; {data.level}
                </td>
              </div>
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
