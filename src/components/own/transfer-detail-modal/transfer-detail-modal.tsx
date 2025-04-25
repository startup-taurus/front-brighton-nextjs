import React from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  Row,
  Col,
  Badge,
  Button,
} from 'reactstrap';

interface TransferDetailModalProps {
  isOpen: boolean;
  toggle: () => void;
  data: any;
}

const TransferDetailModal: React.FC<TransferDetailModalProps> = ({
  isOpen,
  toggle,
  data,
}) => {
  if (!data) return null;

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'approved':
        return 'success';
      case 'rejected':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
      centered
      className='modal-dialog-centered'
    >
      <ModalHeader toggle={toggle}>Detalles de la Transferencia</ModalHeader>
      <ModalBody>
        <Row className='mb-3'>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>ID del Estudiante:</h6>
            <p className='field-value'>{data.student_id}</p>
          </Col>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>Nombre del Estudiante:</h6>
            <p className='field-value'>{data.student_name}</p>
          </Col>
        </Row>

        <Row className='mb-3'>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>Curso Actual:</h6>
            <p className='field-value'>{data.current_course}</p>
          </Col>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>Curso Solicitado:</h6>
            <p className='field-value'>{data.requested_course}</p>
          </Col>
        </Row>

        <Row className='mb-3'>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>Fecha de Solicitud:</h6>
            <p className='field-value'>
              {new Date(data.request_date).toLocaleDateString()}
            </p>
          </Col>
          <Col
            xs='12'
            md='6'
          >
            <h6 className='field-label'>Estado:</h6>
            <Badge color={getStatusBadgeColor(data.status)}>
              {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
            </Badge>
          </Col>
        </Row>

        {data.reason && (
          <Row className='mb-3'>
            <Col xs='12'>
              <h6 className='field-label'>Motivo de la Transferencia:</h6>
              <p className='field-value'>{data.reason}</p>
            </Col>
          </Row>
        )}

        {data.notes && (
          <Row className='mb-3'>
            <Col xs='12'>
              <h6 className='field-label'>Notas Adicionales:</h6>
              <p className='field-value'>{data.notes}</p>
            </Col>
          </Row>
        )}

        <Row className='mt-4'>
          <Col
            xs='12'
            className='d-flex justify-content-end'
          >
            <Button
              color='secondary'
              onClick={toggle}
            >
              Cerrar
            </Button>
          </Col>
        </Row>
      </ModalBody>
    </Modal>
  );
};

export default TransferDetailModal;
