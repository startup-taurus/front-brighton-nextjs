import React, { useState } from "react";
import { ErrorMessage, Field, Formik } from "formik";
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";
import useSWR from "swr";
import Select from "react-select";
import { createCourse } from "helper/api-data/course"; // Función para crear curso
import { getActiveProfessors } from "helper/api-data/professor";

const CourseForm = ({ data, isOpen, toggle }: any) => {
  const limit = 10;
  const page = 1;
  const [searchTerm, setSearchTerm] = useState("");

  const saveCourse = async (data: any) => {
    try {
      const response = await createCourse(data); // Enviar datos para crear curso
      console.log("Curso creado:", response);
    } catch (error) {
      console.error("Error al crear curso:", error);
    }
  };

  const { data: course } = useSWR(
    ["/course/get-active", page, limit, searchTerm],
    () => getActiveProfessors(page, limit, searchTerm)
  );

  const professorOptions = course?.data
    ? course?.data.map((professorItem: any) => ({
        value: professorItem.id,
        label: professorItem?.user?.name,
      }))
    : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Editar Curso" : "Add New Course"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  course_name: data.course_name,
                  course_number: data.course_number,
                  start_date: data.start_date,
                  end_date: data.end_date,
                  comment: data.comment,
                  status: data.status,
                  course_type: data.course_type,
                  hourly_rate: data.hourly_rate,
                  professor_id: data.professor_id,
                }
              : {
                  course_name: "",
                  course_number: "",
                  start_date: "",
                  end_date: "",
                  comment: "",
                  status: "",
                  course_type: "",
                  hourly_rate: "",
                  professor_id: "",
                }
          }
          onSubmit={(info) => saveCourse(info)} // Llamada al método para guardar el curso
        >
          {(props) => {
            const { errors, handleSubmit, isSubmitting, setFieldValue } = props;
            return (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for="course_name">Course Name</Label>
                  <Field name="course_name" as={Input} />
                  <ErrorMessage name="course_name" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="course_number">Course Number</Label>
                  <Field name="course_number" as={Input} />
                  <ErrorMessage name="course_number" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="start_date">Start Date</Label>
                  <Field name="start_date" as={Input} type="date" />
                  <ErrorMessage name="start_date" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="end_date">End Date</Label>
                  <Field name="end_date" as={Input} type="date" />
                  <ErrorMessage name="end_date" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="comment">Comment</Label>
                  <Field name="comment" as={Input} type="textarea" />
                  <ErrorMessage name="comment" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="status">Status</Label>
                  <Field name="status" as={Input} type="select">
                    <option value="" disabled>
                      Select course status
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Field>
                  <ErrorMessage name="status" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="course_type">Course Type</Label>
                  <Field name="course_type" as={Input} type="select">
                    <option value="" disabled>
                      Select course type
                    </option>
                    <option value="online">Online</option>
                    <option value="offline">On-Site</option>
                  </Field>
                  <ErrorMessage name="course_type" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="professor_id">Professor</Label>
                  <Select
                    id="professor_id"
                    options={professorOptions}
                    onChange={(selectedOption: any) =>
                      setFieldValue("professor_id", selectedOption.value)
                    }
                    placeholder="Seleccione o busque un curso"
                    isSearchable
                    onInputChange={(inputValue) => {
                      setSearchTerm(inputValue);
                    }}
                  />
                  <ErrorMessage name="professor_id" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="hourly_rate">Hourly Rate</Label>
                  <Field name="hourly_rate" as={Input} type="number" />
                  <ErrorMessage name="hourly_rate" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="schedule">Schedule</Label>
                  <Field name="schedule" as={Input} type="datetime-local" />
                  <ErrorMessage name="schedule" component={FormFeedback} />
                </Col>

                <Col xs={12} className="d-flex justify-content-end mt-5">
                  <Button color="danger" onClick={toggle}>
                    Close
                  </Button>
                  &nbsp; &nbsp;
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

export default CourseForm;
