import React, { use, useEffect, useState } from 'react';
import Select from 'react-select';
import { ErrorMessage, Field, Formik } from 'formik';
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
} from 'reactstrap';
import LoadingButton from '../common/LoadingButton';
import useSWR, { mutate } from 'swr';
import { getActiveCourses } from 'helper/api-data/course';
import { createStudent, updateStudent } from 'helper/api-data/student';
import { toast } from 'react-toastify';
import * as Yup from 'yup';
import { parse, set } from 'date-fns';

const validations = Yup.object().shape({
  name: Yup.string().required('The name is required'),
  email: Yup.string().required('The email is required'),
  cedula: Yup.string()
    .min(10, 'Cédula must be more than 10 characters long')
    .max(10, 'Cédula must be less than 10 characters long')
    .required('Cédula is required'),
  courseId: Yup.string().required('The course is required'),
  level: Yup.string().required('The level is required'),
  status: Yup.string().required('The status is required'),
  emergency_contact_name: Yup.string().required(
    'Emergency contact name is required'
  ),
  emergency_contact_phone: Yup.string().required(
    'Emergency contact phone is required'
  ),
  emergency_contact_relationship: Yup.string().required(
    'Emergency contact relationship is required'
  ),
  birth_date: Yup.date()
    .max(new Date(), 'Select a valid date')
    .transform((value, originalValue, schema) => {
      if (schema.isType(value)) {
        return value;
      }
      const result = parse(originalValue, 'dd-MM-yyyy', new Date());
      return result;
    })
    .typeError('Select a valid date')
    .required('The birthdate is required'),
  phone_number: Yup.string()
    .min(10, 'Phone number must be at least 10 characters long')
    .max(10, 'Phone number must be less than 10 characters long')
    .required('Phone number is required'),
});

const StudentForm = ({
  data,
  isOpen,
  toggle,
  isTransfer = false,
  onSuccessCreate,
}: any) => {
  const limit = 10;
  const page = 1;
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [formikSetFieldValueRef, setFormikSetFieldValueRef] =
    useState<any>(null);
  const [previousCourses, setPreviousCourses] = useState<any[]>([]);

  const { data: course } = useSWR(
    ['/course/get-active', page, limit, searchTerm],
    () => getActiveCourses(page, limit, searchTerm)
  );

  useEffect(() => {
    if (data?.course && Array.isArray(data.course)) {
      // Extract unique course IDs
      const uniqueCourseIds = Array.from(
        new Set(data.course.map((c: any) => c.id))
      );
      setPreviousCourses(data.course);
    }
  }, [data]);

  const save = async (row: any) => {
    try {
      setIsLoading(true);
      const response = await createStudent(row);
      if (response.statusCode === 200) {
        toast.success('Student created successfull!');
        toggle();
        // Actualizar la tabla después de crear un estudiante
        mutate([
          `/student/get-all?page=1&rowPerPage=10&order=desc&orderBy=createdAt`,
        ]);
        onSuccessCreate && onSuccessCreate(data?.user?.id);
      }
    } catch (error) {
      console.error('Error al crear estudiante:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (data: any) => {
    try {
      setIsLoading(true);
      const response = await updateStudent(data.id, data);
      if (response.statusCode === 200) {
        toggle();
        toast.success('Student updated successfull!');
        // Actualizar la tabla después de editar un estudiante
        mutate([
          `/student/get-all?page=1&rowPerPage=10&order=desc&orderBy=createdAt`,
        ]);
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const courseOptions = course?.data
    ? course?.data.map((courseItem: any) => ({
        value: courseItem.id,
        label:
          courseItem.course_number +
          ' - ' +
          courseItem.course_name +
          ' - ' +
          courseItem?.professor?.user?.name,
      }))
    : [];

  const handleCancelCourseSelection = () => {
    setShowWarning(false);
    setSelectedCourseId('');
  };

  const handleContinueCourseSelection = () => {
    setShowWarning(false);
    if (formikSetFieldValueRef && selectedCourseId) {
      formikSetFieldValueRef(selectedCourseId);
    }
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        toggle={toggle}
        size='lg'
      >
        <ModalHeader toggle={toggle}>
          {isTransfer
            ? 'Transfer Student'
            : data
              ? 'Edit Student'
              : 'Add New Student'}
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
                    phone_number: data?.phone_number || '',

                    courseId:
                      data?.course?.length > 0 ? data?.course[0]?.id : '',
                  }
                : {
                    name: '',
                    username: '',
                    email: '',
                    password: '',
                    phone_number: '',
                    cedula: '',
                    lastName: '',
                    courseId: '',
                    level: '',
                    status: 'active',
                    book_given: false,
                    pendingPayments: false,
                    emergency_contact_name: '',
                    emergency_contact_phone: '',
                    emergency_contact_relationship: '',
                    promotion: '',
                    observations: '',
                    age_category: 'adults',
                    birth_date: '',
                  }
            }
            validationSchema={validations}
            onSubmit={(info) =>
              data && !isTransfer ? update(info) : save(info)
            }
          >
            {(props) => {
              const {
                errors,
                handleSubmit,
                isSubmitting,
                touched,
                setFieldValue,
                dirty,
              } = props;
              // @ts-ignore
              return (
                <form
                  noValidate
                  autoComplete='off'
                  onSubmit={handleSubmit}
                  className={`row g-3`}
                >
                  <Col xs={6}>
                    <Label for='name'>Name</Label>
                    <Field
                      name='name'
                      as={Input}
                      invalid={touched.name && !!errors.name}
                    />
                    <ErrorMessage
                      name='name'
                      component={FormFeedback}
                    />
                  </Col>
                  {/* <Col xs={6}>
                  <Label for="username">Username</Label>
                  <Field name="username" as={Input} />
                  <ErrorMessage name="username" component={FormFeedback} />
                </Col> */}
                  <Col xs={6}>
                    <Label for='email'>Email</Label>
                    <Field
                      name='email'
                      as={Input}
                      invalid={touched.email && !!errors.email}
                    />
                    <ErrorMessage
                      name='email'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='phone_number'>Phone Number</Label>
                    <Field
                      name='phone_number'
                      as={Input}
                      invalid={touched.phone_number && !!errors.phone_number}
                    />
                    <ErrorMessage
                      name='phone_number'
                      component={FormFeedback}
                    />
                  </Col>
                  {/* <Col xs={6}>
                  <Label for="password">Password</Label>
                  <Field name="password" as={Input} type="" />
                  <ErrorMessage name="password" component={FormFeedback} />
                </Col> */}
                  <Col xs={6}>
                    <Label for='cedula'>Cédula</Label>
                    <Field
                      name='cedula'
                      as={Input}
                      invalid={touched.cedula && !!errors.cedula}
                    />
                    <ErrorMessage
                      name='cedula'
                      component={FormFeedback}
                    />
                  </Col>

                  <Col xs={6}>
                    <Label for='courseId'>Course</Label>
                    <Field name='courseId'>
                      {({ field, form }: any) => (
                        <Select
                          {...field}
                          id='courseId'
                          options={courseOptions}
                          onChange={(selectedOption: any) => {
                            const courseId = selectedOption
                              ? selectedOption.value
                              : '';

                            setFormikSetFieldValueRef(
                              () => (id: string) =>
                                setFieldValue('courseId', id)
                            );

                            if (
                              courseId &&
                              previousCourses.some(
                                (course) => course.id === courseId
                              )
                            ) {
                              setSelectedCourseId(courseId);
                              setShowWarning(true);
                            } else {
                              setFieldValue('courseId', courseId);
                            }
                          }}
                          value={
                            courseOptions.find(
                              (option: any) =>
                                option.value === props.values.courseId
                            ) || null
                          }
                          placeholder='Select course'
                          isSearchable
                          onInputChange={(inputValue) => {
                            setSearchTerm(inputValue);
                          }}
                        />
                      )}
                    </Field>

                    {touched.courseId && !!errors.courseId && (
                      <div className='invalid-input'>
                        <>
                          {
                            // @ts-ignore
                            errors!.courseId
                          }
                        </>
                      </div>
                    )}

                    <ErrorMessage
                      name='courseId'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='level'>Level</Label>
                    <Field
                      name='level'
                      as={Input}
                      invalid={touched.level && !!errors.level}
                    />
                    <ErrorMessage
                      name='level'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='status'>Status</Label>
                    <Field
                      name='status'
                      as={Input}
                      type='select'
                      id='studentFilter'
                      invalid={touched.status && !!errors.status}
                    >
                      <option
                        value=''
                        disabled
                      >
                        Select status of student
                      </option>
                      <option value='active'>Active</option>
                      <option value='inactive'>Inactive</option>
                      <option value='finalized'>Finalized</option>
                    </Field>
                    <ErrorMessage
                      name='status'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='age_category'>Age Category</Label>
                    <Field
                      name='age_category'
                      as={Input}
                      type='select'
                      id='age_category'
                      invalid={touched.age_category && !!errors.age_category}
                    >
                      <option value='kids'>Kids</option>
                      <option value='adults'>Adults</option>
                    </Field>
                    <ErrorMessage
                      name='age_category'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='birth_date'>Birth Date</Label>
                    <Field
                      type='date'
                      name='birth_date'
                      as={Input}
                      invalid={touched.birth_date && !!errors.birth_date}
                    />
                    <ErrorMessage
                      name='birth_date'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='book_given'>Book Given</Label>
                    <Field
                      name='book_given'
                      as={Input}
                      type='select'
                      id='book_given'
                      invalid={touched.book_given && !!errors.book_given}
                    >
                      <option value='true'>Yes</option>
                      <option value='false'>No</option>
                    </Field>
                    <ErrorMessage
                      name='book_given'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='pendingPayments'>Pending Payments</Label>
                    <Field
                      name='pendingPayments'
                      as={Input}
                      type='select'
                      id='pendingPayments'
                    >
                      <option value='true'>Yes</option>
                      <option value='false'>No</option>
                    </Field>
                    <ErrorMessage
                      name='pendingPayments'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='emergency_contact_name'>
                      Emergency Contact Name
                    </Label>
                    <Field
                      name='emergency_contact_name'
                      as={Input}
                      invalid={
                        touched.emergency_contact_name &&
                        !!errors.emergency_contact_name
                      }
                    />
                    <ErrorMessage
                      name='emergency_contact_name'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='emergency_contact_phone'>
                      Emergency Contact Phone
                    </Label>
                    <Field
                      name='emergency_contact_phone'
                      as={Input}
                      invalid={
                        touched.emergency_contact_phone &&
                        !!errors.emergency_contact_phone
                      }
                    />
                    <ErrorMessage
                      name='emergency_contact_phone'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='emergency_contact_relationship'>
                      Emergency Contact Relationship
                    </Label>
                    <Field
                      name='emergency_contact_relationship'
                      as={Input}
                      invalid={
                        touched.emergency_contact_relationship &&
                        !!errors.emergency_contact_relationship
                      }
                    />
                    <ErrorMessage
                      name='emergency_contact_relationship'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={6}>
                    <Label for='promotion'>Promotion</Label>
                    <Field
                      name='promotion'
                      as={Input}
                    />
                    <ErrorMessage
                      name='promotion'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col xs={12}>
                    <Label for='observations'>Observations</Label>
                    <Field
                      name='observations'
                      type='textarea'
                      as={Input}
                    />
                    <ErrorMessage
                      name='observations'
                      id='observations'
                      component={FormFeedback}
                    />
                  </Col>
                  <Col
                    xs={12}
                    className='d-flex justify-content-end mt-5'
                  >
                    <Button
                      color='cancel'
                      onClick={toggle}
                    >
                      Close
                    </Button>
                    &nbsp; &nbsp;
                    <LoadingButton
                      color='primary'
                      type='submit'
                      isLoading={isLoading || isSubmitting}
                      loadingText={
                        isTransfer
                          ? 'Transferring...'
                          : data
                            ? 'Updating...'
                            : 'Saving...'
                      }
                      defaultText={
                        isTransfer ? 'Transfer' : data ? 'Update' : 'Save'
                      }
                      disabled={data && !isTransfer && !dirty}
                    />
                  </Col>
                </form>
              );
            }}
          </Formik>
        </ModalBody>
      </Modal>

      {/* Warning Modal */}
      <Modal
        isOpen={showWarning}
        toggle={handleCancelCourseSelection}
        centered
      >
        <ModalHeader toggle={handleCancelCourseSelection}>Warning</ModalHeader>
        <ModalBody>
          This student has previously belonged to this course. Do you want to
          continue with the assignment?
        </ModalBody>
        <ModalFooter>
          <Button
            color='secondary'
            onClick={handleCancelCourseSelection}
          >
            Cancel
          </Button>
          <Button
            color='primary'
            onClick={handleContinueCourseSelection}
          >
            Continue
          </Button>
        </ModalFooter>
      </Modal>
    </>
  );
};

export default StudentForm;
