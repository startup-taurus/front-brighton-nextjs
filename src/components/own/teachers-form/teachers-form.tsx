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

const TeachersForm = ({ data, isOpen, toggle }: any) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Editar Docente" : "Agregar Docente"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                }
              : {
                  name: "",
                  lastName: "",
                  dni: "",
                  level: "",
                  course: "",
                  profession: "",
                  isBookGiven: false,
                  observations: "",
                  status: "",
                  hasPendingPayments: false,
                  submit: null,
                }
          }
          onSubmit={(data) => console.log(data)}
        >
          {(props) => {
            const {
              errors,
              handleSubmit,
              isSubmitting,
              touched,
              setFieldValue,
            } = props;
            return (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for="name">Nombre</Label>
                  <Field name="name" as={Input} />
                  <ErrorMessage name="name" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="lastName">Apellido</Label>
                  <Field name="lastName" as={Input} />
                  <ErrorMessage name="lastName" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="dni">Cédula</Label>
                  <Field name="dni" as={Input} />
                  <ErrorMessage name="dni" id="dni" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="phone">Teléfono</Label>
                  <Field name="phone" as={Input} />
                  <ErrorMessage
                    name="phone"
                    id="phone"
                    component={FormFeedback}
                  />
                </Col>

                <Col xs={6}>
                  <Label for="status">Estado</Label>
                  <Field
                    name="status"
                    as={Input}
                    type="select"
                    id="studentFilter"
                  >
                    <option value="" disabled>
                      Seleccione el estado del docente
                    </option>
                    <option value="true">Activo</option>
                    <option value="false">Retirado</option>
                  </Field>
                  <ErrorMessage name="status" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="observations">Observación</Label>
                  <Field name="observations" type="textarea" as={Input} />
                  <ErrorMessage
                    name="observations"
                    id="observations"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12} className="d-flex justify-content-end mt-5">
                  <Button color="danger" onClick={toggle}>
                    Cancelar
                  </Button>
                  &nbsp; &nbsp;
                  <Button color="primary" type="submit" onClick={toggle}>
                    Crear
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

export default TeachersForm;
