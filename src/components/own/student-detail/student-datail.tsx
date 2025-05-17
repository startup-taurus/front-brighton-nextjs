import React from 'react';
import {
  Button,
  Col,
  Modal,
  ModalBody,
  ModalHeader,
  Row,
  Table,
} from 'reactstrap';
import Image from 'next/image';
import { ImgPath } from 'utils/Constant';
import { useRouter } from 'next/router';
import { encrypt } from 'utils/encryption';

const StudentDetail = ({ data, isOpen, toggle }: any) => {
  const router = useRouter();
  if (!data) return null;

  const navigateToAttendance = () => {
    if (data?.course?.length > 0 && data.course[0]?.id) {
      const encryptedId = encrypt(data.id.toString());
      // Guardar el ID del estudiante en localStorage para poder volver a sus detalles
      localStorage.setItem('studentDetailId', encryptedId);
      router.push(
        `/course/${data.course[0].id}/attendance?professorId=${data.id}`
      );
    }
  };

  const navigateToGradebook = () => {
    if (data?.course?.length > 0 && data.course[0]?.id) {
      const encryptedId = encrypt(data.id.toString());
      // Guardar el ID del estudiante en localStorage para poder volver a sus detalles
      localStorage.setItem('studentDetailId', encryptedId);
      router.push(
        `/course/${data.course[0].id}/gradebook?professorId=${data.id}`
      );
    }
  };
  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
    >
      <ModalHeader toggle={toggle}>{data?.user?.name}</ModalHeader>
      <ModalBody>
        <div className='project-box'>
          <span
            className={`badge ${data.status ? 'badge-success' : 'badge-danger'}`}
          >
            {data?.status?.charAt(0).toUpperCase() + data?.status?.slice(1)}
          </span>
          <h6> {data.cedula} </h6>
          <div className='media'>
            <Image
              className='me-1 rounded-circle media'
              width={30}
              height={30}
              src={`${ImgPath}/user/7.jpg`}
              alt='user image'
            />
            <div className='media-body mt-1'>
              <p>{data?.user?.name}</p>
            </div>
          </div>

          <div className='details row'>
            <div className='col-3'>
              <span>Profession </span>
            </div>
            <div className='font-success col-3'>{data.profession}</div>
            <div className='col-3'>
              <span>Status Payment </span>
            </div>
            <div
              className={`${data.book_given ? 'font-success' : 'font-danger'} col-3`}
            >
              {data.paymentStatus ? 'Pagado' : 'No Pagado'}
            </div>
            <div className='col-3'>
              <span>Course</span>
            </div>
            <div className='font-success col-3'>
              {data?.course?.length > 0
                ? data.course[0]?.course_name
                : 'Curso no disponible'}
            </div>
            <div className='col-3'>
              <span>Payment Amount </span>
            </div>
            <div className='col-3'>
              <span>$ {data.paymentAmount ?? 0}</span>
            </div>
            <div className='col-3'>
              <span>Level</span>
            </div>
            <div className='font-success col-3'>
              {typeof data.level === 'string'
                ? data.level
                : typeof data.level === 'object'
                  ? data.level.name || data.level.full_level || ''
                  : ''}
            </div>
            <div className='col-3'>
              <span>Book delivered</span>
            </div>
            <div
              className={`${data.book_given ? 'font-success' : 'font-danger'} col-3`}
            >
              <span>{data.book_given ? 'Yes' : 'No'}</span>
            </div>
            <div className='col-12'>
              <strong className='my-2'>Emergency contac</strong>
              <div className='d-flex justify-content-between'>
                <div className='me-3'>
                  <strong>Name:</strong> &nbsp; {data.emergency_contact_name}
                </div>
                <div className='me-3'>
                  <strong>Phone:</strong> &nbsp; {data.emergency_contact_phone}
                </div>
                <div className='me-3'>
                  <strong>Relationship:</strong>&nbsp;
                  {data.emergency_contact_relationship}
                </div>
              </div>
              <div>
                <strong>Observación:</strong> &nbsp; {data.observations}
              </div>
            </div>
          </div>
          <Col xs={12}>
            <strong>Payments</strong>
            <Table>
              <thead>
                <tr>
                  <th className='p-1'>Date</th>
                  <th className='p-1'>Method</th>
                  <th className='p-1'>Total</th>
                </tr>
              </thead>
              {Array.isArray(data.payments) &&
                data.payments.map((payment: any) => (
                  <tbody>
                    <tr>
                      <td className='p-1'>{payment.payment_date}</td>
                      <td className='p-1'>{payment.payment_method}</td>
                      <td className='p-1'>{payment.total_payment}</td>
                    </tr>
                  </tbody>
                ))}
            </Table>
          </Col>
          <Col
            xs={12}
            className='mt-4 d-flex justify-content-end gap-2'
          >
            <Button
              color='primary'
              onClick={navigateToAttendance}
              disabled={!data?.course?.length || !data.course[0]?.id}
            >
              Ver Asistencia
            </Button>
            <Button
              color='info'
              onClick={navigateToGradebook}
              disabled={!data?.course?.length || !data.course[0]?.id}
            >
              Ver Calificaciones
            </Button>
          </Col>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default StudentDetail;
