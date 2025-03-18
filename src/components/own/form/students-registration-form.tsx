import React, { useState } from "react";
import { ErrorMessage, Field, Formik } from "formik";
import { Button, Col, FormFeedback, FormGroup, Input, Label } from "reactstrap";

import * as Yup from "yup";
import {
  LEVELS_FOR_ADULTS,
  LEVELS_FOR_KIDS,
  SCHEDULE_DATES,
} from "../../../../utils/constants";
import { createRegisteredStudent } from "../../../../helper/api-data/registered-student";
import { parse } from "date-fns";
import { LanguageProvider, useLanguage } from "../context/LanguageContext";
import LanguageToggle from "./LanguageToggle";


// Main component that provides the language context
const StudentsRegistrationForm = () => {
  return (
    <LanguageProvider>
      <RegistrationFormContent />
    </LanguageProvider>
  );
};

// Inner component that uses the language context
const RegistrationFormContent = () => {
  const { t, language } = useLanguage();
  // Create validation schema using the current language
  // This will be recreated whenever the language changes
  const validations = React.useMemo(() => Yup.object().shape({
    first_name: Yup.string().required(t("first_name_required")),
    middle_name: Yup.string().required(t("middle_name_required")),
    last_name: Yup.string().required(t("last_name_required")),
    second_last_name: Yup.string().required(t("second_last_name_required")),
    id_number: Yup.string()
      .min(10, t("id_number_min"))
      .max(10, t("id_number_max"))
      .required(t("id_number_required")),
    birthday: Yup.date()
      .max(new Date(), t("birthday_invalid"))
      .transform((value, originalValue, schema) => {
        if (schema.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd-MM-yyyy", new Date());
        return result;
      })
      .typeError(t("birthday_invalid"))
      .required(t("birthday_required")),
    phone_number: Yup.string()
      .min(10, t("phone_min"))
      .max(10, t("phone_max"))
      .required(t("phone_required")),
    email: Yup.string().required(t("email_required")),
    address: Yup.string().required(t("address_required")),
    age_category: Yup.string().required(t("age_category_required")),
    emergency_contact_name: Yup.string().when("age_category", {
      is: "kids",
      then: () => Yup.string().required(t("emergency_name_required")),
      otherwise: () => Yup.string(),
    }),
    emergency_contact_phone: Yup.string()
      .when("age_category", {
      
      is: "kids",
      
      then: () => Yup.string()
        .min(10, t("phone_min"))
        .max(10, t("phone_max"))
        .required(t("emergency_phone_required"))
        .test(
          "different-phone",
          t("emergency_phone_different"),
          function(value) {
            return !value || this.parent.phone_number !== value;
          }
        ),
      otherwise: () => Yup.string()
      .test(
        "different-phone",
        t("emergency_phone_different"),
        function(value) {
          return !value || this.parent.phone_number !== value;
        }
      )
      .min(10, t("phone_min"))
      .max(10, t("phone_max"))
    }),
    emergency_contact_relationship: Yup.string().when("age_category", {
      is: "kids",
      then: () => Yup.string().required(t("emergency_relationship_required")),
      otherwise: () => Yup.string(),
    }),
    level: Yup.string().required(t("level_required")),
    schedule: Yup.string().required(t("schedule_required")),
    same_billing: Yup.string().required(t("billing_required")),
    billing_address: Yup.string(),
    isAcceptedTermsAndCondition: Yup.string().required(
      t("terms_required"),
    ),
  }), [language, t]); // Recreate validation schema when language changes

  const currentDate = new Date();
  const maxDate =
    currentDate.getFullYear() +
    "-" +
    String(currentDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(currentDate.getDate()).padStart(2, "0");
  const [isSuccess, setIsSuccess] = useState(false);

  const initialValues = {
    first_name: "",
    middle_name: "",
    last_name: "",
    second_last_name: "",
    id_number: "",
    birthday: "",
    phone_number: "",
    email: "",
    address: "",
    age_category: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relationship: "",
    level: "",
    schedule: "",
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
        <LanguageToggle  />
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
                    {t("first_name")} <span className="required-input" />
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
                    {t("middle_name")} <span className="required-input" />
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
                    {t("last_name")} <span className="required-input" />
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
                    {t("second_last_name")} <span className="required-input" />
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
                    {t("id_number")} <span className="required-input" />
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
                  <Label for="birthday">{t("birthday")}
                    <span className="required-input" />
                  </Label>
                  <Field
                    id="birthday"
                    name="birthday"
                    type="date"
                    placeholder="dd/mm/yyyy"
                    invalid={touched.birthday && !!errors.birthday}
                    max={maxDate}
                    as={Input}
                  />
                  <ErrorMessage name="birthday" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="phone_number">
                    {t("phone_number")} <span className="required-input" />
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
                  <Label for="email">
                    {t("email")} <span className="required-input" />
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
                  <Label for="address">
                    {t("address")} <span className="required-input" />
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
                  <Label for="emergency_contact_name">
                    {t("emergency_contact_name")}  
                    {values.age_category === "kids" && <span className="required-input" />}
                  </Label>
                  <Field
                    id="emergency_contact_name"
                    name="emergency_contact_name"
                    invalid={touched.emergency_contact_name && !!errors.emergency_contact_name}
                    as={Input}
                  />
                  <ErrorMessage name="emergency_contact_name" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="emergency_contact_phone">
                    {t("emergency_contact_phone")} 
                    {values.age_category === "kids" && <span className="required-input" />}
                  </Label>
                  <Field
                    id="emergency_contact_phone"
                    name="emergency_contact_phone"
                    invalid={touched.emergency_contact_phone && !!errors.emergency_contact_phone}
                    as={Input}
                  />
                  <ErrorMessage name="emergency_contact_phone" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="emergency_contact_relationship">
                    {t("emergency_contact_relationship")} 
                    {values.age_category === "kids" && <span className="required-input" />}
                  </Label>
                  <Field
                    id="emergency_contact_relationship"
                    name="emergency_contact_relationship"
                    invalid={touched.emergency_contact_relationship && !!errors.emergency_contact_relationship}
                    as={Input}
                  />
                  <ErrorMessage name="emergency_contact_relationship" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label>
                    {t("age_category")} <span className="required-input" />
                  </Label>
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
                      {t("kids")}
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
                      {t("adults")}
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
                      {t("level")} <span className="required-input" />
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
                  <Label>
                    {t("schedule")} <span className="required-input" />
                  </Label>
                  {SCHEDULE_DATES.map((schedule, index) => (
                    <FormGroup
                      check
                      className="radio radio-primary"
                      key={`schedule-${index}`}
                    >
                      <Field
                        className="form-check-input"
                        id={`schedule-${index}`}
                        type="radio"
                        name="schedule"
                        value={schedule.value}
                        invalid={touched.schedule && !!errors.schedule}
                      />
                      <Label
                        className="form-check-label"
                        htmlFor={`schedule-${index}`}
                      >
                        {schedule.label}
                      </Label>
                    </FormGroup>
                  ))}
                  <ErrorMessage
                    name="schedule"
                    component={({ children }: any) => (
                      <FormFeedback className="d-block">
                        {children}
                      </FormFeedback>
                    )}
                  />
                </Col>

                <Col xs={12}>
                  <Label className="form-check-label">{t("same_billing")} 
                    <span className="required-input" />
                  </Label> 
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
                      {t("yes")}
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
                      {t("no")}
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
                    <Label for="billing_address">{t("billing_address")}</Label>
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
                    {t("where_hear_about_us")}
                  </Label>
                  <Field
                    id="where_hear_about_us"
                    name="where_hear_about_us"
                    as={Input}
                  />
                </Col>
                <Col xs={12}>
                  <Label className="form-check-label">
                    {t("terms_registration")} <span className="required-input" />
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
                      {t("accept_terms")}
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
                  className="d-flex justify-content-center gap-2 mt-4 flex-column align-items-center"
                >
                  <Button color="primary" type="submit" disabled={isSubmitting}>
                    {t("submit")}
                  </Button>
                  {isSubmitting && (
                    <div className="mt-3 text-center">
                      <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-2">{t("processing")}</p>
                    </div>
                  )}
                </Col>
              </form>
            )}
          </Formik>
        ) : (
          <div className="d-flex justify-content-center align-items-center py-5">
            <h2 className='student-registered-success my-5 py-5"'>
              {t("student_saved")}
            </h2>
          </div>
        )}
        </div>
      </section>
  );
};

export default StudentsRegistrationForm;
