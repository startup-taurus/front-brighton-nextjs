import React, { useState } from "react";
import { ErrorMessage, Field, FieldArray, Formik } from "formik";
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
import { createCourse, updateCourse } from "helper/api-data/course"; // Función para crear curso
import { getActiveProfessors } from "helper/api-data/professor";
import { getAllSyllabus } from "helper/api-data/syllabus";
const daysOfWeek = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CourseForm = ({ data, isOpen, toggle }: any) => {
  const limit = 10;
  const page = 1;
  const [searchTerm, setSearchTerm] = useState("");
  const [searchTermSyllabus, setSearchTermSyllabus] = useState("");

  const save = async (data: any) => {
    try {
      const formattedSchedule = formatSchedule(data.schedules);
      const payload = { ...data, schedule: formattedSchedule };
      const response = await createCourse(payload);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error("Error al crear curso:", error);
    }
  };

  const update = async (data: any) => {
    try {
      const formattedSchedule = formatSchedule(data.schedules);
      const payload = { ...data, schedule: formattedSchedule };
      const response = await updateCourse(data.id, payload);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error("Error al actualizar usuario:", error);
    }
  };

  const formatSchedule = (schedules: any) => {
    return schedules
      .map((schedule: any) => {
        const days = schedule.days.join("-");
        const timeRange = `${schedule.startTime}-${schedule.endTime}`;
        return `${days} ${timeRange}`;
      })
      .join(", ");
  };

  const { data: course } = useSWR(
    ["/course/get-active", page, limit, searchTerm],
    () => getActiveProfessors(page, limit, searchTerm)
  );

  const { data: syllabus } = useSWR(["/syllabus/get-all", page, limit], () =>
    getAllSyllabus(page, limit)
  );

  const syllabusOptions = syllabus?.data
    ? syllabus?.data.map((syllabusItem: any) => ({
        value: syllabusItem.id,
        label: syllabusItem.syllabus_name,
      }))
    : [];

  const professorOptions = course?.data
    ? course?.data.map((professorItem: any) => ({
        value: professorItem.id,
        label: professorItem?.user?.name,
      }))
    : [];

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg">
      <ModalHeader toggle={toggle}>
        {data ? "Edit Course" : "Add New Course"}
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
                  classroom: data.classroom,
                  hourly_rate: data.hourly_rate,
                  professor_id: data.professor_id,
                  age_group: data.age_group,
                  syllabus_id: data.syllabus_id,
                  schedules: data.schedule
                    ? [
                        {
                          days: data.schedule.split(" ")[0].split("-"),
                          startTime: data.schedule.split(" ")[1].split("-")[0],
                          endTime: data.schedule.split(" ")[1].split("-")[1],
                        },
                      ]
                    : [{ days: [], startTime: "", endTime: "" }],
                }
              : {
                  course_name: "",
                  course_number: "",
                  start_date: "",
                  end_date: "",
                  comment: "",
                  status: "active",
                  course_type: "",
                  classroom: "",
                  hourly_rate: "",
                  professor_id: "",
                  age_group: "",
                  schedules: [{ days: [], startTime: "", endTime: "" }],
                  syllabus_id: "",
                }
          }
          onSubmit={(info) => (data ? update(info) : save(info))}
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
                <Col xs={12}>
                  <Label for="comment">Comment</Label>
                  <Field name="comment" as={Input} type="textarea" />
                  <ErrorMessage name="comment" component={FormFeedback} />
                </Col>
                <Col xs={4}>
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
                <Col xs={4}>
                  <Label for="classroom">Classroom</Label>
                  <Field name="classroom" as={Input} type="select">
                    <option value="" selected disabled>
                      Select clasrroom
                    </option>
                    <option value="cambrige">Cambrige</option>
                    <option value="oxford">Oxord</option>
                    <option value="brighton">Brighton</option>
                    <option value="hardvard">Hardvard</option>
                  </Field>
                  <ErrorMessage name="classroom" component={FormFeedback} />
                </Col>
                <Col xs={4}>
                  <Label for="age_group">Age Group</Label>
                  <Field name="age_group" as={Input} type="select">
                    <option value="" selected disabled>
                      Select age group
                    </option>
                    <option value="adult">Adult</option>
                    <option value="children">Children</option>
                  </Field>
                  <ErrorMessage name="age_group" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="professor_id">Professor</Label>
                  <Select
                    id="professor_id"
                    options={professorOptions}
                    onChange={(selectedOption: any) =>
                      setFieldValue("professor_id", selectedOption.value)
                    }
                    placeholder="Select a professor"
                    value={
                      professorOptions.find(
                        (option: any) =>
                          option.value === props.values.professor_id
                      ) || null
                    }
                    isSearchable
                    onInputChange={(inputValue) => {
                      setSearchTerm(inputValue);
                    }}
                  />
                  <ErrorMessage name="professor_id" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="hourly_rate">Syllabus</Label>
                  <Select
                    id="syllabus_id"
                    options={syllabusOptions}
                    onChange={(selectedOption: any) =>
                      setFieldValue("syllabus_id", selectedOption.value)
                    }
                    placeholder="Select a syllabus"
                    value={
                      syllabusOptions.find(
                        (option: any) =>
                          option.value === props.values.syllabus_id
                      ) || null
                    }
                    isSearchable
                    // onInputChange={(inputValue) => {
                    //   searchTermSyllabus(inputValue);
                    // }}
                  />
                  <ErrorMessage name="syllabus_id" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="course_type">Course Type</Label>
                  <Field
                    id="course_type"
                    name="course_type"
                    as={Input}
                    type="select"
                    onChange={(e: any) => {
                      props.setFieldValue("course_type", e.target.value); // Actualiza el valor en Formik
                    }}
                  >
                    <option value="" disabled>
                      Select course type
                    </option>
                    <option value="online">Online</option>
                    <option value="on-site">On-Site</option>
                    <option value="private">Private</option>
                    <option value="private - online">Private - Online</option>
                  </Field>
                  <ErrorMessage name="course_type" component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for="hourly_rate">Hourly Rate</Label>
                  <Field
                    name="hourly_rate"
                    as={Input}
                    type="number"
                    disabled={
                      !(
                        props.values.course_type === "private" ||
                        props.values.course_type === "private - online"
                      )
                    }
                  />
                  <ErrorMessage name="hourly_rate" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="schedule">Schedule</Label>
                  <FieldArray name="schedules">
                    {({ push, remove, form }) => (
                      <div>
                        {form.values.schedules.map(
                          (schedule: any, index: number) => (
                            <div
                              key={index}
                              className="row align-items-center border-bottom pb-3"
                            >
                              <Col xs={10}>
                                <div className="m-checkbox-inline custom-radio-ml ">
                                  {daysOfWeek.map((day) => (
                                    <div className="checkbox px-1">
                                      <Field
                                        type="checkbox"
                                        id={index + day}
                                        className="form-check-input"
                                        name={`schedules[${index}].days`}
                                        value={day}
                                      />
                                      <label
                                        htmlFor={index + day}
                                        className="form-label"
                                        key={day}
                                      >
                                        {day}
                                      </label>
                                    </div>
                                  ))}
                                </div>
                              </Col>
                              <Col xs={2}>
                                {/* <Button
                                  color="danger"
                                  onClick={() => remove(index)}
                                >
                                  <FaTrash />
                                </Button> */}
                              </Col>
                              <Col xs={5}>
                                <Label for={`schedules[${index}].startTime`}>
                                  Start Time
                                </Label>
                                <Field
                                  name={`schedules[${index}].startTime`}
                                  as={Input}
                                  type="time"
                                />
                                <ErrorMessage
                                  name={`schedules[${index}].startTime`}
                                  component={FormFeedback}
                                />
                              </Col>
                              <Col xs={5}>
                                <Label for={`schedules[${index}].endTime`}>
                                  End Time
                                </Label>
                                <Field
                                  name={`schedules[${index}].endTime`}
                                  as={Input}
                                  type="time"
                                />
                                <ErrorMessage
                                  name={`schedules[${index}].endTime`}
                                  component={FormFeedback}
                                />
                              </Col>
                            </div>
                          )
                        )}
                        {/* <div className="d-flex justify-content-end">
                          <Button
                            color="primary"
                            onClick={() =>
                              push({ days: [], startTime: "", endTime: "" })
                            }
                          >
                            <FaCirclePlus />
                          </Button>
                        </div> */}
                      </div>
                    )}
                  </FieldArray>
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
