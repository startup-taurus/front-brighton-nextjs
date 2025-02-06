import React, { useState } from "react";
import { ErrorMessage, Field, Formik, FieldArray } from "formik";
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  FormFeedback,
  Row,
} from "reactstrap";
import { createSyllabus, updateSyllabus } from "helper/api-data/syllabus";
import { FaTrash } from "react-icons/fa";

const SyllabusForm = ({ data, isOpen, toggle, isCopy }: any) => {
  const save = async (syllabus: any, { setSubmitting }: any) => {
    setSubmitting(true);
    try {
      const response = await createSyllabus(syllabus);
      if (response.statusCode === 200) {
        setSubmitting(false);
        toggle();
      }
    } catch (error) {
      setSubmitting(false);
      console.error("Error al crear syllabus:", error);
    }
  };

  const update = async (syllabus: any, { setSubmitting }: any) => {
    setSubmitting(true);
    try {
      const response = await updateSyllabus(syllabus.id, syllabus);
      if (response.statusCode === 200) {
        setSubmitting(false);
        toggle();
      }
    } catch (error) {
      setSubmitting(false);
      console.error("Error al actualizar syllabus:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {isCopy
          ? "Duplicate Syllabus"
          : data
            ? "Edit Syllabus"
            : "Add new Syllabus"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  id: isCopy ? "" : data.id,
                  syllabus_name: data.syllabus_name,
                  items: data?.items?.map((item: any) => item.item_name) || [],
                  test_percentage: data?.percentages?.test_percentage || 0,
                  exam_percentage: data?.percentages?.exam_percentage || 0,
                  assig_percentage: data?.percentages?.assig_percentage || 0,
                  assignments: data?.assignments || [""],
                  progress_tests: data?.progress_tests || [""],
                  movers_exam: data?.movers_exam || [""],
                  percentages: data?.percentages_syllabus || [
                    {
                      name: "",
                      min: 0,
                      max: 0,
                    },
                  ],
                }
              : {
                  id: "",
                  syllabus_name: "",
                  items: [""],
                  test_percentage: 0,
                  exam_percentage: 0,
                  assig_percentage: 0,
                  assignments: [""],
                  progress_tests: [""],
                  movers_exam: [""],
                  percentages: [
                    {
                      name: "",
                      min: 0,
                      max: 0,
                    },
                  ],
                }
          }
          onSubmit={(values, othersProps) =>
            data && !isCopy ? update(values, othersProps ) : save(values, othersProps)
          }
        >
          {(props) => {
            const {
              values,
              errors,
              handleSubmit,
              isSubmitting,
              setFieldValue,
            } = props;

            const renderArrayField = (name: string, label: string) => (
              <Col xs={12} className="mt-3">
                <Label>{label}</Label>
                <FieldArray
                  name={name}
                  render={(arrayHelpers) => (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      <Row>
                        {(values[name as keyof typeof values] as string[]).map(
                          (item, index) => (
                            <Col
                              key={index}
                              xs={6}
                              className="d-flex align-items-center mb-2"
                            >
                              <Input
                                value={item}
                                onChange={(e) =>
                                  setFieldValue(
                                    `${name}[${index}]`,
                                    e.target.value
                                  )
                                }
                                placeholder={`Item ${index + 1}`}
                                className="me-2"
                              />
                              <Button
                                type="button"
                                color="danger"
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <FaTrash />
                              </Button>
                            </Col>
                          )
                        )}
                      </Row>
                      <Button
                        type="button"
                        color="primary"
                        onClick={() => arrayHelpers.push("")}
                      >
                        Add Item
                      </Button>
                    </div>
                  )}
                />
              </Col>
            );

            const renderPercentagesField = (
              name: string,
              label: string,
              values: any,
              setFieldValue: (field: string, value: any) => void
            ) => (
              <Col xs={12} className="mt-3">
                <Label>{label}</Label>
                <FieldArray
                  name={name}
                  render={(arrayHelpers) => (
                    <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                      {values[name].map((percentage: any, index: number) => (
                        <Row key={index} className="mb-2">
                          <Col md={4}>
                            <Label>Name</Label>
                            <Input
                              type="text"
                              value={percentage.name}
                              onChange={(e) =>
                                setFieldValue(
                                  `${name}[${index}].name`,
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col md={3}>
                            <Label>Min %</Label>
                            <Input
                              type="number"
                              value={percentage.min}
                              onChange={(e) =>
                                setFieldValue(
                                  `${name}[${index}].min`,
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col md={3}>
                            <Label>Max %</Label>
                            <Input
                              type="number"
                              value={percentage.max}
                              onChange={(e) =>
                                setFieldValue(
                                  `${name}[${index}].max`,
                                  e.target.value
                                )
                              }
                            />
                          </Col>
                          <Col md={2} className="d-flex align-items-end">
                            <Button
                              type="button"
                              color="danger"
                              onClick={() => arrayHelpers.remove(index)}
                            >
                              <FaTrash />
                            </Button>
                          </Col>
                        </Row>
                      ))}
                      <Button
                        type="button"
                        color="primary"
                        onClick={() =>
                          arrayHelpers.push({
                            name: "",
                            min: 0,
                            max: 0,
                          })
                        }
                      >
                        Add Percentage
                      </Button>
                    </div>
                  )}
                />
              </Col>
            );

            return (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={12}>
                  <Label for="syllabus_name">Syllabus Name</Label>
                  <Field name="syllabus_name" as={Input} />
                  <ErrorMessage name="syllabus_name" component={FormFeedback} />
                </Col>

                {renderArrayField("items", "Items")}

                <Col md={4}>
                  <Label for="assig_percentage">Assignment Percentage %</Label>
                  <Field name="assig_percentage" as={Input} type="number" />
                  <ErrorMessage
                    name="assig_percentage"
                    component={FormFeedback}
                  />
                </Col>
                <Col md={4}>
                  <Label for="test_percentage">Test Percentage %</Label>
                  <Field name="test_percentage" as={Input} type="number" />
                  <ErrorMessage
                    name="test_percentage"
                    component={FormFeedback}
                  />
                </Col>
                <Col md={4}>
                  <Label for="exam_percentage">Exam Percentage %</Label>
                  <Field name="exam_percentage" as={Input} type="number" />
                  <ErrorMessage
                    name="exam_percentage"
                    component={FormFeedback}
                  />
                </Col>
                <hr />
                {renderArrayField("assignments", "Assignments")}
                <hr />
                {renderArrayField("progress_tests", "Progress Tests")}
                <hr />
                {renderArrayField("movers_exam", "Movers Exam")}
                <hr />
                {renderPercentagesField(
                  "percentages",
                  "Custom Percentages",
                  values,
                  setFieldValue
                )}

                <Col xs={12} className="d-flex justify-content-end mt-5">
                  <Button color="cancel" onClick={toggle}>
                    Close
                  </Button>
                  &nbsp;&nbsp;
                  <Button color="primary" type="submit" disabled={isSubmitting}>
                    {isCopy ? "Duplicate" : data ? "Update" : "Save"}
                  </Button>
                </Col>
              </form>
            );
          }}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default SyllabusForm;
