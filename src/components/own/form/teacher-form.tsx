import React from "react";
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
import { createProfessor } from "helper/api-data/professor"; // Función para crear profesor

const TeacherForm = ({ data, isOpen, toggle }: any) => {
  const saveProfessor = async (data: any) => {
    try {
      const response = await createProfessor(data); // Enviar datos para crear profesor
      console.log("Profesor creado:", response);
    } catch (error) {
      console.error("Error al crear profesor:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Editar Profesor" : "Add New Professor"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  name: data?.user?.name,
                  username: data?.user?.username,
                  email: data.email,
                  password: data.password,
                  status: data.status,
                  cedula: data.cedula,
                  hourly_rate: data.hourly_rate,
                  phone: data.phone,
                }
              : {
                  name: "",
                  username: "",
                  email: "",
                  password: "",
                  status: "",
                  cedula: "",
                  hourly_rate: "",
                  phone: "",
                }
          }
          onSubmit={(info) => saveProfessor(info)} // Llamada al método para guardar el profesor
        >
          {(props) => {
            const { errors, handleSubmit, isSubmitting } = props;
            return (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for="name">Name</Label>
                  <Field name="name" as={Input} />
                  <ErrorMessage name="name" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="username">Username</Label>
                  <Field name="username" as={Input} />
                  <ErrorMessage name="username" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="email">Email</Label>
                  <Field name="email" as={Input} />
                  <ErrorMessage name="email" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="password">Password</Label>
                  <Field name="password" as={Input} type="password" />
                  <ErrorMessage name="password" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="status">Status</Label>
                  <Field name="status" as={Input} type="select">
                    <option value="" disabled>
                      Select status of professor
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Field>
                  <ErrorMessage name="status" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="cedula">Cédula</Label>
                  <Field name="cedula" as={Input} />
                  <ErrorMessage name="cedula" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="hourly_rate">Hourly Rate</Label>
                  <Field name="hourly_rate" as={Input} type="number" />
                  <ErrorMessage name="hourly_rate" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="phone">Phone</Label>
                  <Field name="phone" as={Input} />
                  <ErrorMessage name="phone" component={FormFeedback} />
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

export default TeacherForm;
