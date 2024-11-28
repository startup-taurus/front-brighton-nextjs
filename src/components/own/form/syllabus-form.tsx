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

const SyllabusForm = ({ data, isOpen, toggle }: any) => {
  const save = async (syllabus: any) => {
    try {
      const response = await createSyllabus(syllabus);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error("Error al crear syllabus:", error);
    }
  };

  const update = async (syllabus: any) => {
    try {
      const response = await updateSyllabus(syllabus.id, syllabus);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error("Error al actualizar syllabus:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Editar Syllabus" : "Add New Syllabus"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  id: data.id,
                  syllabus_name: data.syllabus_name,
                  items: data?.items?.map((item: any) => item.item_name) || [],
                  test_percentage: data?.percentages?.test_percentage || 0,
                  exam_percentage: data?.percentages?.exam_percentage || 0,
                  assig_percentage: data?.percentages?.assig_percentage || 0,
                }
              : {
                  id: "",
                  syllabus_name: "",
                  items: [""],
                  test_percentage: 0,
                  exam_percentage: 0,
                  assig_percentage: 0,
                }
          }
          onSubmit={(values) => (data ? update(values) : save(values))}
        >
          {(props) => {
            const {
              values,
              errors,
              handleSubmit,
              isSubmitting,
              setFieldValue,
            } = props;

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
                <Col xs={12} className="mt-3">
                  <Label>Items</Label>
                  <FieldArray
                    name="items"
                    render={(arrayHelpers) => (
                      <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                        <Row>
                          {values.items.map((item: string, index: number) => (
                            <Col
                              key={index}
                              xs={6}
                              className="d-flex align-items-center mb-2"
                            >
                              <Input
                                value={item}
                                onChange={(e) =>
                                  setFieldValue(
                                    `items[${index}]`,
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
                          ))}
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
                <Col xs={12} className="d-flex justify-content-end mt-5">
                  <Button color="cancel" onClick={toggle}>
                    Close
                  </Button>
                  &nbsp;&nbsp;
                  <Button color="primary" type="submit">
                    {data ? "Update" : "Save"}
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
