import Image from "next/image";
import React from "react";
import { Col, Row } from "reactstrap";
import { ImgPath } from "utils/Constant";

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <Row className="section-title">
      <Col xs={12} sm={12} md={4} lg={3}>
        <h1 className="main-title">{title}</h1>
      </Col>
      <Col xs={12} md={8} lg={9}>
        <Image
          className="for-light img-sm"
          src={`${ImgPath}/course/bars.png`}
          alt="logo"
          layout="responsive"
          width={100}
          height={100}
        />
      </Col>
    </Row>
  );
};

export default SectionTitle;
