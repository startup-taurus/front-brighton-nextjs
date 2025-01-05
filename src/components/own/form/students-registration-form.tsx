import React from "react";

import { ErrorMessage, Field, Formik } from "formik";
import {
  Button,
  Col,
  Container,
  FormFeedback,
  FormGroup,
  Input,
  Label,
} from "reactstrap";

import * as Yup from "yup";
import sectionTitle from "@/components/own/section-title/section-title";

const StudentsRegistrationForm = () => {
  const validations = Yup.object().shape({
    firstName: Yup.string().required("The first name is required"),
    middleName: Yup.string().required("The middle name is required"),
    lastName: Yup.string().required("The last name is required"),
    secondLastName: Yup.string().required("The second last name is required"),
    IDNumber: Yup.string().required("The ID number is required"),
    phoneNumber: Yup.string().required("The phone is required"),
    email: Yup.string().required("The email is required"),
    address: Yup.string().required("The address is required"),
    ageCategory: Yup.string().required("The age category is required"),
    level: Yup.string().required("The level is required"),
    schedule: Yup.string().required("The schedule is required"),
    sameBilling: Yup.string().required("The billing is required"),
  });

  const initialValues = {
    firstName: "",
    middleName: "",
    lastName: "",
    secondLastName: "",
    IDNumber: "",
    phoneNumber: "",
    email: "",
    address: "",
    ageCategory: "",
    level: "",
    schedule: "",
    sameBilling: "",
    whereHearAboutUs: "",
  };

  const onSubmit = (body: any, { setSubmitting }: any) => {};

  return (
    <section className="students-registration-form">
      <div className="students-registration-form__inner-wrapper">
        <Formik
          initialValues={initialValues}
          onSubmit={onSubmit}
          validationSchema={validations}
        >
          {({ errors, handleSubmit, isSubmitting, touched }) => (
            <form
              noValidate
              autoComplete="off"
              onSubmit={handleSubmit}
              className={`row g-3`}
            >
              <Col xs={12} md={6}>
                <Label for="firstName">
                  First Name <span className="required-input" />
                </Label>
                <Field
                  id="firstName"
                  name="firstName"
                  invalid={touched.firstName && !!errors.firstName}
                  as={Input}
                />
                <ErrorMessage name="firstName" component={FormFeedback} />
              </Col>
              <Col xs={12} md={6}>
                <Label for="middleName">
                  Middle Name <span className="required-input" />
                </Label>
                <Field
                  id="middleName"
                  name="middleName"
                  invalid={touched.middleName && !!errors.middleName}
                  as={Input}
                />
                <ErrorMessage name="middleName" component={FormFeedback} />
              </Col>
              <Col xs={12} md={6}>
                <Label for="lastName">
                  Last Name <span className="required-input" />
                </Label>
                <Field
                  id="lastName"
                  name="lastName"
                  invalid={touched.lastName && !!errors.lastName}
                  as={Input}
                />
                <ErrorMessage name="lastName" component={FormFeedback} />
              </Col>
              <Col xs={12} md={6}>
                <Label for="secondLastName">
                  Second Last Name <span className="required-input" />
                </Label>
                <Field
                  id="secondLastName"
                  name="secondLastName"
                  invalid={touched.secondLastName && !!errors.secondLastName}
                  as={Input}
                />
                <ErrorMessage name="secondLastName" component={FormFeedback} />
              </Col>
              <Col xs={12}>
                <Label for="IDNumber">
                  ID Number <span className="required-input" />
                </Label>
                <Field
                  id="IDNumber"
                  name="IDNumber"
                  invalid={touched.IDNumber && !!errors.IDNumber}
                  as={Input}
                />
                <ErrorMessage name="IDNumber" component={FormFeedback} />
              </Col>
              <Col xs={12}>
                <Label for="phoneNumber">
                  Phone Number <span className="required-input" />
                </Label>
                <Field
                  id="phoneNumber"
                  name="phoneNumber"
                  invalid={touched.phoneNumber && !!errors.phoneNumber}
                  as={Input}
                />
                <ErrorMessage name="phoneNumber" component={FormFeedback} />
              </Col>
              <Col xs={12}>
                <Label for="address">
                  Email <span className="required-input" />
                </Label>
                <Field
                  id="address"
                  name="address"
                  invalid={touched.address && !!errors.address}
                  as={Input}
                />
                <ErrorMessage name="address" component={FormFeedback} />
              </Col>
              <Col xs={12}>
                <Label for="email">
                  Address <span className="required-input" />
                </Label>
                <Field
                  id="email"
                  name="email"
                  invalid={touched.email && !!errors.email}
                  as={Input}
                />
                <ErrorMessage name="email" component={FormFeedback} />
              </Col>
              <Col xs={12}>
                <FormGroup check className="radio radio-primary">
                  <Field
                    className="form-check-input"
                    type="radio"
                    id="radio-kids"
                    name="ageCategory"
                    value="kids"
                    invalid={touched.ageCategory && !!errors.ageCategory}
                  />
                  <Label className="form-check-label" htmlFor={`radio-kids`}>
                    Kids
                  </Label>
                </FormGroup>
                <FormGroup check className="radio radio-primary">
                  <Field
                    className="form-check-input"
                    id="radio-adults"
                    type="radio"
                    name="ageCategory"
                    value="adults"
                    invalid={touched.ageCategory && !!errors.ageCategory}
                  />
                  <Label className="form-check-label" htmlFor={`radio-adults`}>
                    Adults
                  </Label>
                </FormGroup>
                <ErrorMessage name="ageCategory" component={FormFeedback} />
              </Col>
              <Col xs={12} className="d-flex justify-content-center gap-2 mt-4">
                <Button color="primary" type="submit" disabled={isSubmitting}>
                  Submit
                </Button>
              </Col>
            </form>
          )}
        </Formik>
      </div>
    </section>
  );
};

export default StudentsRegistrationForm;
