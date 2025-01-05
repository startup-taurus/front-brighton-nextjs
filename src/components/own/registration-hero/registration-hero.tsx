import React from "react";
import { Container } from "reactstrap";
import StudentsRegistrationForm from "@/components/own/form/students-registration-form";

const RegistrationHero = () => {
  return (
    <section className="students-registration students-registration__hero">
      <Container className="students-registration__inner-wrapper" fluid>
        <h1 className="students-registration__title">Student Registration</h1>
      </Container>
    </section>
  );
};

export default RegistrationHero;
