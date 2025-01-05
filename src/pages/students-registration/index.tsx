import React, { Fragment } from "react";
import RegistrationHero from "@/components/own/registration-hero/registration-hero";
import StudentsRegistrationForm from "@/components/own/form/students-registration-form";

const StudentsRegistration = () => {
  return (
    <Fragment>
      <RegistrationHero />
      <StudentsRegistrationForm />
    </Fragment>
  );
};

export default StudentsRegistration;
