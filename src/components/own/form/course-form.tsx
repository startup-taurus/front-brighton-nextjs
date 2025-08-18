import React, { useState } from 'react';
import { ErrorMessage, Field, FieldArray, Formik } from 'formik';
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import LoadingButton from '../common/loading-button/LoadingButton';
import useSWR from 'swr';
import Select from 'react-select';
import { createCourse, updateCourse } from 'helper/api-data/course';
import { getActiveProfessors } from 'helper/api-data/professor';
import { getAllSyllabus } from 'helper/api-data/syllabus';
import { toast } from 'react-toastify';
import { PRIVATE_COURSE_TYPES } from '../../../../utils/constants';
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const CourseForm = ({ data, isOpen, toggle }: any) => {
  const limit = 1000;
  const page = 1;
  const [searchTerm, setSearchTerm] = useState('');
  const [searchTermSyllabus, setSearchTermSyllabus] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const save = async (data: any) => {
    try {
      setIsLoading(true);
      
      let payload = { ...data };
      
      if (data.course_type === PRIVATE_COURSE_TYPES.PRIVATE || data.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) {


        if (!data.start_date) {
          const today = new Date().toISOString().split('T')[0];
          payload.start_date = today;
        }
        payload.syllabus_id = null;
        payload.classroom = null;
        payload.schedule = null;
      } else {
        const formattedSchedule = formatSchedule(data.schedules);
        payload.schedule = formattedSchedule;
      }
      
      const response = await createCourse(payload);
      if (response.statusCode === 200) {
        toast.success('Course created successfully!');
        toggle();
      }
    } catch (error) {
      console.error('Error creating course:', error);
      toast.error('Error creating course. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const update = async (data: any) => {
    try {
      setIsLoading(true);
      
      let payload = { ...data };
      
      if (data.course_type === PRIVATE_COURSE_TYPES.PRIVATE || data.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) {
        if (!data.start_date) {
          const today = new Date().toISOString().split('T')[0];
          payload.start_date = today;
        }
        payload.syllabus_id = null;
        payload.classroom = null;
        payload.schedule = null;
      } else {
        const formattedSchedule = formatSchedule(data.schedules);
        payload.schedule = formattedSchedule;
      }
      
      const response = await updateCourse(data.id, payload);
      if (response.statusCode === 200) {
        toast.success('Course updated successfully!'); 
        toggle();
      }
    } catch (error) {
      console.error('Error updating course:', error);
      toast.error('Error updating course. Please try again.'); 
    } finally {
      setIsLoading(false);
    }
  };

  const formatSchedule = (schedules: any) => {
    return schedules
      .map((schedule: any) => {
        const days = schedule.days.join('-');
        const timeRange = `${schedule.startTime}-${schedule.endTime}`;
        return `${days} ${timeRange}`;
      })
      .join(', ');
  };

  const { data: course, isLoading: isLoadingCourse } = useSWR(
    ['/course/get-active', page, limit, searchTerm],
    () => getActiveProfessors(page, limit, searchTerm)
  );

  const { data: syllabus, isLoading: isLoadingSyllabus } = useSWR(
    ['/syllabus/get-all', page, limit],
    () => getAllSyllabus(page, limit)
  );

  if (isLoadingCourse || isLoadingSyllabus) return null;

  const syllabusOptions = syllabus?.data
    ? syllabus?.data?.results.map((syllabusItem: any) => ({
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
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {data ? 'Edit Course' : 'Add New Course'}
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
                  total_hours: data.total_hours , 
                  professor_id: data.professor_id,
                  age_group: data.age_group,
                  syllabus_id: data.syllabus_id,
                  schedules: data.schedule
                    ? [
                        {
                          days: data.schedule.split(' ')[0].split('-'),
                          startTime: data.schedule.split(' ')[1].split('-')[0],
                          endTime: data.schedule.split(' ')[1].split('-')[1],
                        },
                      ]
                    : [{ days: [], startTime: '', endTime: '' }],
                }
              : {
                  course_name: '',
                  course_number: '',
                  start_date: '',
                  end_date: '',
                  comment: '',
                  status: 'active',
                  course_type: '',
                  classroom: '',
                  hourly_rate: null,
                  total_hours: 0, 
                  professor_id: '',
                  age_group: '',
                  schedules: [{ days: [], startTime: '', endTime: '' }],
                  syllabus_id: '',
                }
          }
          onSubmit={(info) => (data ? update(info) : save(info))}
        >
          {(props) => {
            const {  handleSubmit,  setFieldValue, dirty } =
              props;
            return (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for='course_name'>Course Name</Label>
                  <Field
                    name='course_name'
                    as={Input}
                  />
                  <ErrorMessage
                    name='course_name'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='course_number'>Course Number</Label>
                  <Field
                    name='course_number'
                    as={Input}
                  />
                  <ErrorMessage
                    name='course_number'
                    component={FormFeedback}
                  />
                </Col>
                {!(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE || props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
                  <Col xs={6}>
                    <Label for='start_date'>Start Date</Label>
                    <Field
                      name='start_date'
                      as={Input}
                      type='date'
                    />
                    <ErrorMessage
                      name='start_date'
                      component={FormFeedback}
                    />
                  </Col>
                )}
                <Col xs={12}>
                  <Label for='comment'>Comment</Label>
                  <Field
                    name='comment'
                    as={Input}
                    type='textarea'
                  />
                  <ErrorMessage
                    name='comment'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={4}>
                  <Label for='status'>Status</Label>
                  <Field
                    name='status'
                    as={Input}
                    type='select'
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select course status
                    </option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </Field>
                  <ErrorMessage
                    name='status'
                    component={FormFeedback}
                  />
                </Col>
                {!(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE || props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
                  <Col xs={4}>
                    <Label for='classroom'>Classroom</Label>
                    <Field
                      name='classroom'
                      as={Input}
                      type='select'
                    >
                      <option
                        value=''
                        selected
                        disabled
                      >
                        Select clasrroom
                      </option>
                      <option value='cambrige'>Cambrige</option>
                      <option value='oxford'>Oxord</option>
                      <option value='brighton'>Brighton</option>
                      <option value='hardvard'>Hardvard</option>
                    </Field>
                    <ErrorMessage
                      name='classroom'
                      component={FormFeedback}
                    />
                  </Col>
                )}
                <Col xs={4}>
                  <Label for='age_group'>Age Group</Label>
                  <Field
                    name='age_group'
                    as={Input}
                    type='select'
                  >
                    <option
                      value=''
                      selected
                      disabled
                    >
                      Select age group
                    </option>
                    <option value='adult'>Adult</option>
                    <option value='children'>Children</option>
                  </Field>
                  <ErrorMessage
                    name='age_group'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='professor_id'>Professor</Label>
                  <Field name='professor_id'>
                    {({ field, form }: any) => (
                      <Select
                        {...field}
                        id='professor_id'
                        options={professorOptions}
                        onChange={(selectedOption: any) => {
                          const professorId = selectedOption
                            ? selectedOption.value
                            : '';
                          setFieldValue('professor_id', professorId);
                        }}
                        placeholder='Select a professor'
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
                    )}
                  </Field>
                  {props.touched.professor_id &&
                    !!props.errors.professor_id && (
                      <div className='invalid-input'>
                        <>{props.errors.professor_id}</>
                      </div>
                    )}
                  <ErrorMessage
                    name='professor_id'
                    component={FormFeedback}
                  />
                </Col>
                {!(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE || props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
                  <Col xs={6}>
                    <Label for='hourly_rate'>Syllabus</Label>
                    <Select
                      id='syllabus_id'
                      options={syllabusOptions}
                      onChange={(selectedOption: any) =>
                        setFieldValue('syllabus_id', selectedOption.value)
                      }
                      placeholder='Select a syllabus'
                      value={
                        syllabusOptions.find(
                          (option: any) =>
                            option.value === props.values.syllabus_id
                        ) || null
                      }
                      isSearchable
                    />
                    <ErrorMessage
                      name='syllabus_id'
                      component={FormFeedback}
                    />
                  </Col>
                )}
                <Col xs={6}>
                  <Label for='course_type'>Course Type</Label>
                  <Field
                    id='course_type'
                    name='course_type'
                    as={Input}
                    type='select'
                    onChange={(e: any) => {
                      props.setFieldValue('course_type', e.target.value);
                      if (e.target.value === 'private' || e.target.value === 'private - online') {
                        props.setFieldValue('syllabus_id', '');
                        props.setFieldValue('classroom', '');
                        props.setFieldValue('start_date', '');
                        props.setFieldValue('schedules', [{ days: [], startTime: '', endTime: '' }]);
                      }
                    }}
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select course type
                    </option>
                    <option value='online'>Online</option>
                    <option value='on-site'>On-Site</option>
                    <option value='private'>Private</option>
                    <option value='private - online'>Private - Online</option>
                  </Field>
                  <ErrorMessage
                    name='course_type'
                    component={FormFeedback}
                  />
                </Col>
                {(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE || props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
                  <>
                    <Col xs={6}>
                      <Label for='hourly_rate'>Hourly Rate</Label>
                      <Field
                        name='hourly_rate'
                        as={Input}
                        type='number'
                        min='0'
                        step='0.01'
                        onKeyDown={(e: any) => {
                          const invalidKeys = ['-', 'e', 'E', '+'];
                          if (invalidKeys.includes(e.key)) {
                            e.preventDefault();
                          }
                        }}
                        onChange={(e: any) => {
                          const inputValue = e.target.value;
                          
                          if (!inputValue) {
                            props.setFieldValue('hourly_rate', '');
                            return;
                          }
                          
                          if (inputValue.includes('-')) {
                            e.target.value = '';
                            props.setFieldValue('hourly_rate', '');
                            return;
                          }
                          
                          const numericValue = parseFloat(inputValue);
                          
                          if (isNaN(numericValue) || numericValue < 0) {
                            toast.error('Hourly rate must be a positive value');
                            e.target.value = '';
                            props.setFieldValue('hourly_rate', '');
                            return;
                          }
                          
                          props.setFieldValue('hourly_rate', numericValue);
                        }}
                      />
                      <ErrorMessage
                        name='hourly_rate'
                        component={FormFeedback}
                      />
                    </Col>
                    <Col xs={6}>
                      <Label for='total_hours'>Total Hours</Label>
                      <Field
                        name='total_hours'
                        as={Input}
                        type='number'
                        min='1'
                        max='200'
                        placeholder='10'
                        onKeyDown={(e: any) => {
                          if (e.key === '-' || e.key === 'e' || e.key === 'E' || e.key === '+' || e.key === '.') {
                            e.preventDefault();
                          }
                        }}
                        onInput={(e: any) => {
                          let value = e.target.value;
                          if (value.includes('-') || value < 1) {
                            e.target.value = '';
                            props.setFieldValue('total_hours', '');
                          }
                        }}
                        onChange={(e: any) => {
                          const value = parseInt(e.target.value);
                          if (e.target.value === '' || e.target.value === null) {
                            props.setFieldValue('total_hours', '');
                            return;
                          }
                          if (isNaN(value) || value < 1) {
                            toast.error('Total hours must be a positive number');
                            props.setFieldValue('total_hours', '');
                            e.target.value = '';
                            return;
                          }
                          props.setFieldValue('total_hours', value);
                        }}
                      />
                      <ErrorMessage
                        name='total_hours'
                        component={FormFeedback}
                      />
                    </Col>
                  </>
                )}
                {!(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE || props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
                  <Col xs={12}>
                    <Label for='schedule'>Schedule</Label>
                    <FieldArray name='schedules'>
                      {({ push, remove, form }) => (
                        <div>
                          {form.values.schedules.map(
                            (schedule: any, index: number) => (
                              <div
                                key={index}
                                className='row align-items-center border-bottom pb-3'
                              >
                                <Col xs={10}>
                                  <div className='m-checkbox-inline custom-radio-ml '>
                                    {daysOfWeek.map((day) => (
                                      <div className='checkbox px-1'>
                                        <Field
                                          type='checkbox'
                                          id={index + day}
                                          className='form-check-input'
                                          name={`schedules[${index}].days`}
                                          value={day}
                                        />
                                        <label
                                          htmlFor={index + day}
                                          className='form-label'
                                          key={day}
                                        >
                                          {day}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </Col>
                                <Col xs={2}>
                                </Col>
                                <Col xs={5}>
                                  <Label for={`schedules[${index}].startTime`}>
                                    Start Time
                                  </Label>
                                  <Field
                                    name={`schedules[${index}].startTime`}
                                    as={Input}
                                    type='time'
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
                                    type='time'
                                  />
                                  <ErrorMessage
                                    name={`schedules[${index}].endTime`}
                                    component={FormFeedback}
                                  />
                                </Col>
                              </div>
                            )
                          )}
                        </div>
                      )}
                    </FieldArray>
                  </Col>
                )}

                <Col
                  xs={12}
                  className='d-flex justify-content-end mt-5'
                >
                  <Button
                    color='danger'
                    onClick={toggle}
                  >
                    Close
                  </Button>
                  &nbsp; &nbsp;
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isLoading}
                    disabled={data && !dirty}
                    loadingText={data ? 'Updating...' : 'Saving...'}
                    defaultText={data ? 'Update' : 'Save'}
                  />
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
