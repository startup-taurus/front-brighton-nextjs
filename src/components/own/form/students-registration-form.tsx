import React, { useState } from "react";

import { ErrorMessage, Field, Formik } from "formik";
import { Button, Col, FormFeedback, FormGroup, Input, Label } from "reactstrap";

import * as Yup from "yup";
import {
  LEVELS_FOR_ADULTS,
  LEVELS_FOR_KIDS,
} from "../../../../utils/constants";
import { createRegisteredStudent } from "../../../../helper/api-data/registered-student";

const StudentsRegistrationForm = () => {
  const validations = Yup.object().shape({
    first_name: Yup.string().required("The first name is required"),
    middle_name: Yup.string().required("The middle name is required"),
    last_name: Yup.string().required("The last name is required"),
    second_last_name: Yup.string().required("The second last name is required"),
    id_number: Yup.string().required("The ID number is required"),
    phone_number: Yup.string().required("The phone is required"),
    email: Yup.string().required("The email is required"),
    address: Yup.string().required("The address is required"),
    age_category: Yup.string().required("The age category is required"),
    level: Yup.string().required("The level is required"),
    same_billing: Yup.string().required("The billing is required"),
    billing_address: Yup.string(),
    isAcceptedTermsAndCondition: Yup.string().required(
      "You must accept the terms and conditions",
    ),
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues = {
    first_name: "",
    middle_name: "",
    last_name: "",
    second_last_name: "",
    id_number: "",
    phone_number: "",
    email: "",
    address: "",
    age_category: "",
    level: "",
    same_billing: "",
    billing_address: "",
    where_hear_about_us: "",
    isAcceptedTermsAndCondition: "",
  };

  const onSubmit = (body: any, { setSubmitting }: any) => {
    setSubmitting(true);
    createRegisteredStudent(body)
      .then((response) => {
        if (response.statusCode === 200) {
          setIsSuccess(true);
        }
      })
      .finally(() => {
        setSubmitting(false);
      });
  };

  return (
    <section className="students-registration-form">
      <div className="students-registration-form__inner-wrapper">
        {!isSuccess ? (
          <Formik
            initialValues={initialValues}
            onSubmit={onSubmit}
            validationSchema={validations}
          >
            {({ errors, handleSubmit, isSubmitting, touched, values }) => (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={12} md={6}>
                  <Label for="first_name">
                    First Name <span className="required-input" />
                  </Label>
                  <Field
                    id="first_name"
                    name="first_name"
                    invalid={touched.first_name && !!errors.first_name}
                    as={Input}
                  />
                  <ErrorMessage name="first_name" component={FormFeedback} />
                </Col>
                <Col xs={12} md={6}>
                  <Label for="middle_name">
                    Middle Name <span className="required-input" />
                  </Label>
                  <Field
                    id="middle_name"
                    name="middle_name"
                    invalid={touched.middle_name && !!errors.middle_name}
                    as={Input}
                  />
                  <ErrorMessage name="middle_name" component={FormFeedback} />
                </Col>
                <Col xs={12} md={6}>
                  <Label for="last_name">
                    Last Name <span className="required-input" />
                  </Label>
                  <Field
                    id="last_name"
                    name="last_name"
                    invalid={touched.last_name && !!errors.last_name}
                    as={Input}
                  />
                  <ErrorMessage name="last_name" component={FormFeedback} />
                </Col>
                <Col xs={12} md={6}>
                  <Label for="second_last_name">
                    Second Last Name <span className="required-input" />
                  </Label>
                  <Field
                    id="second_last_name"
                    name="second_last_name"
                    invalid={
                      touched.second_last_name && !!errors.second_last_name
                    }
                    as={Input}
                  />
                  <ErrorMessage
                    name="second_last_name"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12}>
                  <Label for="id_number">
                    ID Number <span className="required-input" />
                  </Label>
                  <Field
                    id="id_number"
                    name="id_number"
                    invalid={touched.id_number && !!errors.id_number}
                    as={Input}
                  />
                  <ErrorMessage name="id_number" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="phone_number">
                    Phone Number <span className="required-input" />
                  </Label>
                  <Field
                    id="phone_number"
                    name="phone_number"
                    invalid={touched.phone_number && !!errors.phone_number}
                    as={Input}
                  />
                  <ErrorMessage name="phone_number" component={FormFeedback} />
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
                      name="age_category"
                      value="kids"
                      invalid={touched.age_category && !!errors.age_category}
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
                      name="age_category"
                      value="adults"
                      invalid={touched.age_category && !!errors.age_category}
                    />
                    <Label
                      className="form-check-label"
                      htmlFor={`radio-adults`}
                    >
                      Adults
                    </Label>
                  </FormGroup>
                  <ErrorMessage
                    name="age_category"
                    component={({ children }: any) => (
                      <FormFeedback className="d-block">
                        {children}
                      </FormFeedback>
                    )}
                  />
                </Col>
                {!!values.age_category && (
                  <Col xs={12}>
                    <Label>
                      Level <span className="required-input" />
                    </Label>
                    {values.age_category === "kids"
                      ? LEVELS_FOR_KIDS.map((level, index) => (
                          <FormGroup
                            check
                            className="radio radio-primary"
                            key={`level-kids-${index}`}
                          >
                            <Field
                              className="form-check-input"
                              id={`level-kids-${index}`}
                              type="radio"
                              name="level"
                              value={level.value}
                              invalid={touched.level && !!errors.level}
                            />
                            <Label
                              className="form-check-label"
                              htmlFor={`level-kids-${index}`}
                            >
                              {level.label}
                            </Label>
                          </FormGroup>
                        ))
                      : LEVELS_FOR_ADULTS.map((level, index) => (
                          <FormGroup
                            check
                            className="radio radio-primary"
                            key={`level-adults-${index}`}
                          >
                            <Field
                              className="form-check-input"
                              id={`level-adults-${index}`}
                              type="radio"
                              name="level"
                              value={level.value}
                              invalid={touched.level && !!errors.level}
                            />
                            <Label
                              className="form-check-label"
                              htmlFor={`level-adults-${index}`}
                            >
                              {level.label}
                            </Label>
                          </FormGroup>
                        ))}
                    <ErrorMessage
                      name="level"
                      component={({ children }: any) => (
                        <FormFeedback className="d-block">
                          {children}
                        </FormFeedback>
                      )}
                    />
                  </Col>
                )}

                <Col xs={12}>
                  <Label className="form-check-label">Same Billing Data?</Label>
                  <FormGroup check className="radio radio-primary">
                    <Field
                      className="form-check-input"
                      type="radio"
                      id="same-billing-yes"
                      name="same_billing"
                      value="yes"
                      invalid={touched.same_billing && !!errors.same_billing}
                    />
                    <Label
                      className="form-check-label"
                      htmlFor={`same-billing-yes`}
                    >
                      Yes
                    </Label>
                  </FormGroup>
                  <FormGroup check className="radio radio-primary">
                    <Field
                      className="form-check-input"
                      id="same-billing-no"
                      type="radio"
                      name="same_billing"
                      value="no"
                      invalid={touched.same_billing && !!errors.same_billing}
                    />
                    <Label
                      className="form-check-label"
                      htmlFor={`same-billing-no`}
                    >
                      No
                    </Label>
                  </FormGroup>
                  <ErrorMessage
                    name="same_billing"
                    component={({ children }: any) => (
                      <FormFeedback className="d-block">
                        {children}
                      </FormFeedback>
                    )}
                  />
                </Col>

                {values.same_billing === "no" && (
                  <Col xs={12}>
                    <Label for="billing_address">Billing Address</Label>
                    <Field
                      id="billing_address"
                      name="billing_address"
                      type="textarea"
                      as={Input}
                    />
                    <ErrorMessage
                      name="billing_address"
                      component={FormFeedback}
                    />
                  </Col>
                )}
                <Col xs={12}>
                  <Label for="where_hear_about_us">
                    Where did you hear about us?
                  </Label>
                  <Field
                    id="where_hear_about_us"
                    name="where_hear_about_us"
                    as={Input}
                  />
                </Col>
                <Col xs={12}>
                  <Label className="form-check-label">
                    Terms of Registration <span className="required-input" />
                  </Label>
                  <FormGroup check className="radio radio-primary">
                    <Field
                      className="form-check-input"
                      type="radio"
                      id="isAcceptedTermsAndCondition"
                      name="isAcceptedTermsAndCondition"
                      value="yes"
                      invalid={!!errors.isAcceptedTermsAndCondition}
                    />
                    <Label
                      className="form-check-label"
                      htmlFor={`isAcceptedTermsAndCondition`}
                    >
                      I accept that once the payment is made, there will be no
                      refund of the money.
                    </Label>
                  </FormGroup>

                  <ErrorMessage
                    name="isAcceptedTermsAndCondition"
                    component={({ children }: any) => (
                      <FormFeedback className="d-block">
                        {children}
                      </FormFeedback>
                    )}
                  />
                </Col>
                <Col
                  xs={12}
                  className="d-flex justify-content-center gap-2 mt-4"
                >
                  <Button color="primary" type="submit" disabled={isSubmitting}>
                    Submit
                  </Button>
                </Col>
              </form>
            )}
          </Formik>
        ) : (
          <div className="d-flex justify-content-center align-items-center py-5">
            <h2 className='student-registered-success my-5 py-5"'>
              Student saved correctly
            </h2>
          </div>
        )}
      </div>
    </section>
  );
};

export default StudentsRegistrationForm;
