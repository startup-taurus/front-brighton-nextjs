import React, { use, useState } from "react";
import Select from "react-select";
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
import { getActiveCourses } from "helper/api-data/course";
import { createStudent, updateStudent } from "helper/api-data/student";
import { toast } from "react-toastify";

const StudentForm = ({
  data,
  isOpen,
  toggle,
  isTransfer = false,
  onSuccessCreate,
}: any) => {
  const limit = 10;
  const page = 1;
  const [searchTerm, setSearchTerm] = useState("");

  const { data: course } = useSWR(
    ["/course/get-active", page, limit, searchTerm],
    () => getActiveCourses(page, limit, searchTerm)
  );

  const save = async (row: any) => {
    try {
      const response = await createStudent(row);
      if (response.statusCode === 200) {
        toast.success("Student created successfull!");
        toggle();
        onSuccessCreate && onSuccessCreate(data?.user?.id);
      }
    } catch (error) {
      console.error("Error al crear estudiante:", error);
    }
  };

  const update = async (data: any) => {
    try {
      toast.success("Student updated successfull!");
      const response = await updateStudent(data.id, data);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const courseOptions = course?.data
    ? course?.data.map((courseItem: any) => ({
        value: courseItem.id,
        label:
          courseItem.course_number +
          " - " +
          courseItem.course_name +
          " - " +
          courseItem?.professor?.user?.name,
      }))
    : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {isTransfer
          ? "Transfer Student"
          : data
            ? "Edit Student"
            : "Add New Student"}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  name: data?.user?.name,
                  lastName: data?.user?.lastName,
                  username: data?.user?.username,
                  email: data?.user?.email,
                  courseId: data?.course?.length > 0 ? data?.course[0]?.id : "",
                }
              : {
                  name: "",
                  username: "",
                  email: "",
                  password: "",
                  cedula: "",
                  lastName: "",
                  courseId: "",
                  level: "",
                  status: "active",
                  book_given: false,
                  pendingPayments: false,
                  emergency_contact_name: "",
                  emergency_contact_phone: "",
                  emergency_contact_relationship: "",
                  promotion: "",
                  observations: "",
                  age_category: "adults",
                  birth_date: "",
                }
          }
          onSubmit={(info) => (data && !isTransfer ? update(info) : save(info))}
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
                  <Label for="name">Name</Label>
                  <Field name="name" as={Input} />
                  <ErrorMessage name="name" component={FormFeedback} />
                </Col>
                {/* <Col xs={6}>
                  <Label for="username">Username</Label>
                  <Field name="username" as={Input} />
                  <ErrorMessage name="username" component={FormFeedback} />
                </Col> */}
                <Col xs={6}>
                  <Label for="email">Email</Label>
                  <Field name="email" as={Input} />
                  <ErrorMessage name="email" component={FormFeedback} />
                </Col>
                {/* <Col xs={6}>
                  <Label for="password">Password</Label>
                  <Field name="password" as={Input} type="" />
                  <ErrorMessage name="password" component={FormFeedback} />
                </Col> */}
                <Col xs={6}>
                  <Label for="cedula">Cédula</Label>
                  <Field name="cedula" as={Input} />
                  <ErrorMessage name="cedula" component={FormFeedback} />
                </Col>

                <Col xs={6}>
                  <Label for="courseId">Course</Label>
                  <Select
                    id="courseId"
                    options={courseOptions}
                    onChange={(selectedOption: any) =>
                      setFieldValue("courseId", selectedOption.value)
                    }
                    value={
                      courseOptions.find(
                        (option: any) => option.value === props.values.courseId
                      ) || null
                    }
                    placeholder="Select course"
                    isSearchable
                    onInputChange={(inputValue) => {
                      setSearchTerm(inputValue);
                    }}
                  />
                  <ErrorMessage name="courseId" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="level">Level</Label>
                  <Field name="level" as={Input} />
                  <ErrorMessage name="level" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="status">Status</Label>
                  <Field
                    name="status"
                    as={Input}
                    type="select"
                    id="studentFilter"
                  >
                    <option value="" disabled>
                      Select status of student
                    </option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="finalized">Finalized</option>
                  </Field>
                  <ErrorMessage name="status" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="age_category">Age Category</Label>
                  <Field
                    name="age_category"
                    as={Input}
                    type="select"
                    id="age_category"
                  >
                    <option value="kids">Kids</option>
                    <option value="adults">Adults</option>
                  </Field>
                  <ErrorMessage name="age_category" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="birth_date">Birth Date</Label>
                  <Field type="date" name="birth_date" as={Input} />
                  <ErrorMessage name="birth_date" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="book_given">Book Given</Label>
                  <Field
                    name="book_given"
                    as={Input}
                    type="select"
                    id="book_given"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Field>
                  <ErrorMessage name="book_given" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="pendingPayments">Pending Payments</Label>
                  <Field
                    name="pendingPayments"
                    as={Input}
                    type="select"
                    id="pendingPayments"
                  >
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </Field>
                  <ErrorMessage
                    name="pendingPayments"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for="emergency_contact_name">
                    Emergency Contact Name
                  </Label>
                  <Field name="emergency_contact_name" as={Input} />
                  <ErrorMessage
                    name="emergency_contact_name"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for="emergency_contact_phone">
                    Emergency Contact Phone
                  </Label>
                  <Field name="emergency_contact_phone" as={Input} />
                  <ErrorMessage
                    name="emergency_contact_phone"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for="emergency_contact_relationship">
                    Emergency Contact Relationship
                  </Label>
                  <Field name="emergency_contact_relationship" as={Input} />
                  <ErrorMessage
                    name="emergency_contact_relationship"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for="promotion">Promotion</Label>
                  <Field name="promotion" as={Input} />
                  <ErrorMessage name="promotion" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="observations">Observations</Label>
                  <Field name="observations" type="textarea" as={Input} />
                  <ErrorMessage
                    name="observations"
                    id="observations"
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12} className="d-flex justify-content-end mt-5">
                  <Button color="cancel" onClick={toggle}>
                    Close
                  </Button>
                  &nbsp; &nbsp;
                  <Button color="primary" type="submit" disabled={isSubmitting}>
                    {isTransfer ? "Transfer" : data ? "Update" : "Save"}
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
