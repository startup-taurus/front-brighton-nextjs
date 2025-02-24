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
import Image from "next/image";
import { ImgPath } from "utils/Constant";

const RegisteredStudentDetail = ({ data, isOpen, toggle }: any) => {
  if (!data) return null;
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader
        toggle={toggle}
      >{`${data.first_name} ${data.middle_name} ${data.last_name} ${data.second_last_name}`}</ModalHeader>
      <ModalBody>
        <div className="details row">
          <div className="col-12">
            <Row>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>DNI:</strong> &nbsp; {data.id_number}
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>Name:</strong> &nbsp;{" "}
                {`${data.first_name} ${data.middle_name}`}
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>Last Name:</strong> &nbsp;{" "}
                {`${data.last_name} ${data.second_last_name}`}
              </Col>
            </Row>
            <Row>
              {!!data?.age_category && (
                <Col xs={12} sm={6} md={4} className="mb-3">
                  <strong>Age Category:</strong>&nbsp;
                  {data.age_category}
                </Col>
              )}
              {!!data?.birthday && (
                <Col xs={12} sm={6} md={4} className="mb-3">
                  <strong>Birthdate:</strong>&nbsp;
                  {data.birthday}
                </Col>
              )}
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>Phone:</strong> &nbsp; {data.phone_number}
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>Email:</strong>&nbsp;
                {data.email}
              </Col>
              <Col xs={12} sm={6} md={4} className="mb-3">
                <strong>Level:</strong>&nbsp;
                {data.level}
              </Col>
              {!!data?.schedule && (
                <Col xs={12} sm={6} md={4} className="mb-3">
                  <strong>Schedule:</strong>&nbsp;
                  {data.schedule}
                </Col>
              )}
              <Col xs={12} sm={6} md={6} className="mb-3">
                <strong>Address:</strong> &nbsp; {data.address}
              </Col>
              <Col xs={12} sm={6} md={6} className="mb-3">
                <strong>Same Billing Address:</strong> &nbsp;{" "}
                {data.same_billing}
              </Col>
              {data.same_billing === "no" && (
                <Col xs={12} sm={6} md={6} className="mb-3">
                  <strong>Billing Address:</strong> &nbsp;{" "}
                  {data.billing_address}
                </Col>
              )}
              {!!data.where_hear_about_us && (
                <Col xs={12} sm={6} md={6} className="mb-3">
                  <strong>Where did you hear about ?:</strong> &nbsp;{" "}
                  {data.where_hear_about_us}
                </Col>
              )}
            </Row>
          </div>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default RegisteredStudentDetail;
