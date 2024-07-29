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

const StudentForm = ({ data, isOpen, toggle }: any) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Editar Estudiante" : "Agregar estudiante"}
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
                  isActive: false,
                  paymentMethod: "",
                  promotion: "",
                  paymentDate: "",
                  paymentStatus: "",
                  paymentAmount: 80,
                  course: "",
                  level: "",
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
                  <Label for="isActive">Estado</Label>
                  <Field
                    name="isActive"
                    as={Input}
                    type="select"
                    id="studentFilter"
                  >
                    <option value="" disabled>
                      Seleccione el estado del estudiante
                    </option>
                    <option value="true">Activo</option>
                    <option value="false">Retirado</option>
                    <option value="active">Transferido</option>
                  </Field>
                  <ErrorMessage name="isActive" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="promotion">Promoción</Label>
                  <Field
                    name="promotion"
                    as={Input}
                    type="select"
                    id="promotion"
                  >
                    <option value="" disabled>
                      Seleccione una promoción
                    </option>
                    <option value="na">Sin Promoción</option>
                    <option value="active">2x1</option>
                    <option value="active">Navidad</option>
                    <option value="active">Año nuevo</option>
                  </Field>
                  <ErrorMessage name="dni" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="paymentDate">Fecha de Pago</Label>
                  <Field name="paymentDate" as={Input} />
                  <ErrorMessage name="paymentDate" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="paymentStatus">Estado del Pago</Label>
                  <Field name="paymentStatus" as={Input} type="select">
                    <option value="" disabled>
                      Seleccione el estado del pago
                    </option>
                    <option value="active">Pagado</option>
                    <option value="active">No Pagado</option>
                  </Field>
                  <ErrorMessage name="paymentStatus" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="paymentAmount">Monto del Pago</Label>
                  <Field name="paymentAmount" as={Input} />
                  <ErrorMessage name="email" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="course">Curso</Label>
                  <Field name="course" as={Input} type="select">
                    <option value="" disabled>
                      Seleccione el curso
                    </option>
                    <option value="active">B-16</option>
                    <option value="active">B-20</option>
                    <option value="active">B-30</option>
                  </Field>
                  <ErrorMessage name="course" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="level">Nivel</Label>
                  <Field name="level" as={Input} type="select">
                    <option value="" disabled>
                      Seleccione el nivel
                    </option>
                    <option value="active">A1 Elementary</option>
                    <option value="active">A2 Elementary</option>
                    <option value="active">B1</option>
                    <option value="active">B1 +</option>
                    <option value="active">B2</option>
                  </Field>
                  <ErrorMessage name="level" component={FormFeedback} />
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

export default StudentForm;
