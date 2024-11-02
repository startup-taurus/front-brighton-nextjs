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
import { createUser } from "helper/api-data/user"; // Función para crear usuario

const UserForm = ({ data, isOpen, toggle }: any) => {
  const saveUser = async (data: any) => {
    try {
      const response = await createUser(data); // Enviar datos para crear usuario
      console.log("Usuario creado:", response);
    } catch (error) {
      console.error("Error al crear usuario:", error);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Edit User" : "Add New User"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  password: data.password,
                  role: data.role,
                  status: data.status,
                }
              : {
                  name: "",
                  username: "",
                  email: "",
                  password: "",
                  role: "",
                  status: "",
                }
          }
          onSubmit={(info) => saveUser(info)} // Llamada al método para guardar el usuario
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
                  <Label for="role">Role</Label>
                  <Field name="role" as={Input} type="select">
                    <option value="" disabled>
                      Select role of user
                    </option>
                    <option value="professor">Professor</option>
                    <option value="student">Student</option>
                    <option value="admin_staff">Admin Staff</option>
                    <option value="financial">Financial</option>
                  </Field>
                  <ErrorMessage name="role" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="status">Status</Label>
                  <Field name="status" as={Input} type="select">
                    <option value="" disabled>
                      Select status of user
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </Field>
                  <ErrorMessage name="status" component={FormFeedback} />
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

export default UserForm;
