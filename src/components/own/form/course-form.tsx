import React, {useState} from 'react';
import {ErrorMessage, Field, FieldArray, Formik} from 'formik';
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
import useSWR, {mutate} from 'swr';
import Select from 'react-select';
import {createCourse, updateCourse, getAllCourses} from 'helper/api-data/course';
import {getActiveProfessors} from 'helper/api-data/professor';
import {getAllSyllabus} from 'helper/api-data/syllabus';

import {toast} from 'react-toastify';
import Swal from 'sweetalert2';
import {PRIVATE_COURSE_TYPES, CONFLICT_TYPES, ConflictType, STATUS, COURSE_TYPES} from '../../../../utils/constants';
import { formatScheduleLinear, scanScheduleConflicts } from '../../../../utils/utils';
import usePermission from 'hooks/usePermission';
import { PERMISSIONS } from 'utils/permissions';
const daysOfWeek = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const normalizeCourseNumber = (courseNumber: string) =>
  String(courseNumber || '')
    .trim()
    .replace(/[°º˚ᵒ⁰○◦]/g, '')
    .replace(/\s+/g, '')
    .toUpperCase();

const formatCourseNumberForStorage = (courseNumber: string) => {
  const normalized = normalizeCourseNumber(courseNumber);
  return normalized ? `${normalized}°` : '';
};

const CourseForm = ({data, isOpen, toggle, onSuccess, isTransferMode = false, transferInfo, isDuplicateMode = false, duplicateInfo}: any) => {
  const limit = 1000;
  const page = 1;
  const [searchTermSyllabus, setSearchTermSyllabus] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { canPermission } = usePermission();
  const canToggleStatus = canPermission(PERMISSIONS.TOGGLE_COURSE_STATUS);

  const validateScheduleConflicts = async (courseData: any) => {
    try {
      const { data: { result: courses } } = await getAllCourses();
      const normalizedNewCourseNumber = normalizeCourseNumber(courseData.course_number);
      const duplicateCourse = courses?.find((c: any) => 
        (data ? c.id !== data.id : true) &&
        normalizeCourseNumber(c.course_number) === normalizedNewCourseNumber
      );
      if (duplicateCourse) {
        return { hasConflict: true, type: CONFLICT_TYPES.DUPLICATE, message: `A course with the same number already exists:<br>
                   Existing course: ${duplicateCourse.course_name} (${duplicateCourse.course_number})<br>
                   Professor: ${duplicateCourse.professor_name || 'Not assigned'}<br>
                   Please use a different course number.` };
      }
      if (courseData.course_type === PRIVATE_COURSE_TYPES.PRIVATE || courseData.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) {
        return { hasConflict: false };
      }
      const newSchedule = formatScheduleLinear(courseData.schedules);
      const [newDays, newTime] = newSchedule.split(' ');
      const newEndDate = courseData.end_date ? new Date(courseData.end_date) : null;
      const startEffective = new Date(courseData.start_date);
      const selectedProfessorId = String(courseData.professor_id ?? (courseData.professor?.value ?? courseData.professor ?? ''));
      const activeCourses = courses?.filter((c: any) => 
        c.status === STATUS.ACTIVE && 
        String(c.professor_id) === selectedProfessorId &&
        c.schedule &&
        (data ? c.id !== data.id : true)
      ) || [];
      const classroomCourses = courses?.filter((c: any) => 
        c.status === STATUS.ACTIVE &&
        c.classroom === courseData.classroom &&
        c.schedule &&
        (data ? c.id !== data.id : true)
      ) || [];


      const profResult = scanScheduleConflicts(activeCourses, CONFLICT_TYPES.SCHEDULE, newDays, newTime, startEffective, newEndDate, newSchedule);
      if (profResult.hasConflict) return profResult;
      if (courseData.course_type === COURSE_TYPES.ON_SITE) {
        const roomResult = scanScheduleConflicts(classroomCourses, CONFLICT_TYPES.CLASSROOM, newDays, newTime, startEffective, newEndDate, newSchedule);
        if (roomResult.hasConflict) return roomResult;
      }
      return { hasConflict: false };
    } catch (error) {
      return { hasConflict: false };
    }
  };

  const handleSubmit = async (formData: any, isUpdate = false) => {
    try {
      const conflictValidation = await validateScheduleConflicts(formData);
      if (conflictValidation.hasConflict) {
        await Swal.fire({
          title: conflictValidation.type === CONFLICT_TYPES.CLASSROOM
            ? 'Classroom Conflict Detected'
            : conflictValidation.type === CONFLICT_TYPES.DUPLICATE
            ? 'Duplicate Course Detected'
            : 'Schedule Conflict Detected',
          html: conflictValidation.message,
          icon: 'error',
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
        return;
      }

      if (!isUpdate && ![PRIVATE_COURSE_TYPES.PRIVATE, PRIVATE_COURSE_TYPES.PRIVATE_ONLINE].includes(formData.course_type)) {
        const result = await Swal.fire({
          title: 'Important Notice',
          html: '<b>Please note:</b> Once created, these fields cannot be modified:<br>• Course type<br>• Start Date<br>• Schedule<br>• Times',
          icon: 'warning',
          showCancelButton: true,
          confirmButtonText: 'Proceed',
          cancelButtonText: 'Cancel',
        });
        if (!result.isConfirmed) return;
      }
      setIsLoading(true);
      const payload = { ...formData };
      payload.course_number = formatCourseNumberForStorage(payload.course_number);
      if (isDuplicateMode && payload.id) {
        delete payload.id;
      }
      
      const isPrivate = [PRIVATE_COURSE_TYPES.PRIVATE, PRIVATE_COURSE_TYPES.PRIVATE_ONLINE].includes(formData.course_type);
      
      if (isPrivate) {
        payload.start_date = formData.start_date || new Date().toISOString().split('T')[0];
        payload.syllabus_id = null;
        payload.classroom = null;
        payload.schedule = null;
      } else {
        payload.schedule = formatScheduleLinear(formData.schedules);
      }
      if (isDuplicateMode && duplicateInfo?.students) {
        payload.students = duplicateInfo.students
          .filter((student: any) => student?.status?.toLowerCase() === STATUS.ACTIVE && !student?.is_retired)
          .map((student: any) => ({
            student_id: student.id,
            enrollment_date: new Date().toISOString().split('T')[0],
          }));
      }

      const response = isUpdate 
        ? await updateCourse(formData.id, payload)
        : await createCourse(payload);

      if (response.statusCode === 200 || response.statusCode === 201) {
        if (isTransferMode && onSuccess) {
          onSuccess(payload);
        } else if (isDuplicateMode && onSuccess) {
          onSuccess(response.data);
        } else {
          toast.success(`Course ${isUpdate ? 'updated' : 'created'} successfully!`);
          mutate([`/course/get-all-with-professors?page=1&rowPerPage=10`]);
          toggle();
        }
      }
    } catch (error) {
      toast.error(`Error ${isUpdate ? 'updating' : 'creating'} course. Please try again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const save = (data: any) => {
    setIsLoading(true);
    handleSubmit(data, false).finally(() => setIsLoading(false));
  };

  const update = (data: any) => {
    setIsLoading(true);
    handleSubmit(data, true).finally(() => setIsLoading(false));
  };



  const {data: course, isLoading: isLoadingCourse} = useSWR(
    ['/course/get-active', page, limit],
    () => getActiveProfessors(page, limit)
  );

  const {data: syllabus, isLoading: isLoadingSyllabus} = useSWR(
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
    <Modal isOpen={isOpen} toggle={toggle} size='lg'>
      <ModalHeader toggle={toggle}>
        {isTransferMode 
          ? `Create New Course for Transfer (${transferInfo?.studentsCount || 0} students)` 
          : isDuplicateMode
          ? `Transfer Course: ${duplicateInfo?.sourceCourse?.course_name || ''} (${duplicateInfo?.studentsCount || 0} students)`
          : data ? 'Edit Course' : 'Add New Course'
        }
      </ModalHeader>
      <ModalBody>
        {isTransferMode && transferInfo && (
          <div className="alert alert-info mb-3">
            <strong>Transfer Mode:</strong> Creating a new course to transfer {transferInfo.studentsCount} students from "{transferInfo.sourceCourse?.course_name}" ({transferInfo.sourceCourse?.course_number})
          </div>
        )}
        {isDuplicateMode && duplicateInfo && (
          <div className="alert alert-success mb-3">
             <strong>Transfer Mode:</strong> Transferring {duplicateInfo.studentsCount} students from "{duplicateInfo.sourceCourse?.course_name}" ({duplicateInfo.sourceCourse?.course_number}) with {duplicateInfo.studentsCount} students
          </div>
        )}
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  course_name: isDuplicateMode ? `${data.course_name} - Copy` : data.course_name,
                  course_number: isDuplicateMode ? `${data.course_number}-COPY` : data.course_number,
                  start_date: isDuplicateMode ? '' : data.start_date,
                  end_date: isDuplicateMode ? '' : data.end_date,
                  comment: data.comment,
                  status: data.status,
                  course_type: data.course_type,
                  classroom: data.classroom,
                  hourly_rate: data.hourly_rate,
                  total_hours: data.total_hours,
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
                    : [{days: [], startTime: '', endTime: ''}],
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
                  schedules: [{days: [], startTime: '', endTime: ''}],
                  syllabus_id: '',
                }
          }
          onSubmit={(info) => (data && !isDuplicateMode ? update(info) : save(info))}
        >
          {(props) => {
            const onChangeCourseType = (e: any) => {
              props.setFieldValue('course_type', e.target.value);
              if (
                e.target.value === PRIVATE_COURSE_TYPES.PRIVATE ||
                e.target.value === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
              ) {
                props.setFieldValue('syllabus_id', '');
                props.setFieldValue('classroom', '');
                props.setFieldValue('start_date', '');
                props.setFieldValue('schedules', [
                  {days: [], startTime: '', endTime: ''},
                ]);
              }
            };
            const {handleSubmit, setFieldValue, dirty} = props;
            return (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for='course_name'>Course Name</Label>
                  <Field name='course_name' as={Input} />
                  <ErrorMessage name='course_name' component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for='course_number'>Course Number</Label>
                  <Field name='course_number' as={Input} />
                  <ErrorMessage name='course_number' component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for='course_type'>Course Type</Label>
                  <Field
                    id='course_type'
                    name='course_type'
                    as={Input}
                    type='select'
                    disabled={data && !isDuplicateMode ? true : false}
                    className={data && !isDuplicateMode ? 'bg-light text-muted' : ''}
                    onChange={onChangeCourseType}
                  >
                    <option value='' disabled>
                      Select course type
                    </option>
                    <option value='online'>Online</option>
                    <option value='on-site'>On-Site</option>
                    <option value='private'>Private</option>
                    <option value='private - online'>Private - Online</option>
                  </Field>
                  <ErrorMessage name='course_type' component={FormFeedback} />
                </Col>
                {!(
                  props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                  props.values.course_type ===
                    PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                ) && (
                  <Col xs={6}>
                    <Label for='start_date'>Start Date</Label>
                    <Field
                      name='start_date'
                      as={Input}
                      type='date'
                      disabled={data && !isDuplicateMode ? true : false}
                      className={data && !isDuplicateMode ? 'bg-light text-muted' : ''}
                    />
                    <ErrorMessage name='start_date' component={FormFeedback} />
                  </Col>
                )}

                {!(
                  props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                  props.values.course_type ===
                    PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                ) && (
                  <Col xs={12}>
                    <Label for='schedule'>Schedule</Label>
                    <FieldArray name='schedules'>
                      {({push, remove, form}) => (
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
                                      <div key={`${index}-${day}`} className='checkbox px-1'>
                                        <Field
                                          type='checkbox'
                                          id={index + day}
                                          className='form-check-input'
                                          name={`schedules[${index}].days`}
                                          value={day}
                                          disabled={data && !isDuplicateMode ? true : false}
                                        />
                                        <label
                                          htmlFor={index + day}
                                          className='form-label'
                                        >
                                          {day}
                                        </label>
                                      </div>
                                    ))}
                                  </div>
                                </Col>
                                <Col xs={2}></Col>
                                <Col xs={5}>
                                  <Label for={`schedules[${index}].startTime`}>
                                    Start Time
                                  </Label>
                                  <Field
                                    name={`schedules[${index}].startTime`}
                                    as={Input}
                                    type='time'
                                    disabled={data && !isDuplicateMode ? true : false}
                                    className={
                                      data && !isDuplicateMode ? 'bg-light text-muted' : ''
                                    }
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
                                    disabled={data && !isDuplicateMode ? true : false}
                                    className={
                                      data && !isDuplicateMode ? 'bg-light text-muted' : ''
                                    }
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
                  xs={
                    props.values.course_type === COURSE_TYPES.ONLINE
                      ? 6
                      : (props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                         props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                         ? 6
                         : 4)
                  }
                >
                  <Label for='status'>Status</Label>
                  <Field name='status' as={Input} type='select' disabled={!canToggleStatus}>
                    <option value='' disabled>
                      Select course status
                    </option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </Field>
                  <ErrorMessage name='status' component={FormFeedback} />
                </Col>
                {!(
                  props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                  props.values.course_type ===
                    PRIVATE_COURSE_TYPES.PRIVATE_ONLINE ||
                  props.values.course_type === COURSE_TYPES.ONLINE
                ) && (
                  <Col xs={4}>
                    <Label for='classroom'>Classroom</Label>
                    <Field name='classroom' as={Input} type='select' defaultValue=''>
                      <option value='' disabled>
                        Select classroom
                      </option>
                      <option value='cambrige'>Cambrige</option>
                      <option value='oxford'>Oxford</option>
                      <option value='brighton'>Brighton</option>
                      <option value='hardvard'>Hardvard</option>
                    </Field>
                    <ErrorMessage name='classroom' component={FormFeedback} />
                  </Col>
                )}
                <Col
                  xs={
                    props.values.course_type === COURSE_TYPES.ONLINE
                      ? 6
                      : (props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                         props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                         ? 6
                         : 4)
                  }
                >
                  <Label for='age_group'>Age Group</Label>
                  <Field name='age_group' as={Input} type='select' defaultValue=''>
                    <option value='' disabled>
                      Select age group
                    </option>
                    <option value='adult'>Adult</option>
                    <option value='children'>Children</option>
                  </Field>
                  <ErrorMessage name='age_group' component={FormFeedback} />
                </Col>
                <Col xs={6}>
                  <Label for='professor_id'>Professor</Label>
                  <Select
                    id='professor_id'
                    options={professorOptions}
                    onChange={(selectedOption: any) =>
                      setFieldValue('professor_id', selectedOption.value)
                    }
                    placeholder='Select a professor'
                    value={
                      professorOptions.find(
                        (option: any) =>
                          option.value === props.values.professor_id
                      ) || null
                    }
                    isSearchable
                  />
                  {props.touched.professor_id &&
                    !!props.errors.professor_id && (
                      <div className='invalid-input'>
                        <>{props.errors.professor_id}</>
                      </div>
                    )}
                  <ErrorMessage name='professor_id' component={FormFeedback} />
                </Col>
                {!(
                  props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                  props.values.course_type ===
                    PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                ) && (
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
                    <ErrorMessage name='syllabus_id' component={FormFeedback} />
                  </Col>
                )}
                <Col xs={12}>
                  <Label for='comment'>Comment</Label>
                  <Field name='comment' as={Input} type='textarea' />
                  <ErrorMessage name='comment' component={FormFeedback} />
                </Col>
                {(props.values.course_type === PRIVATE_COURSE_TYPES.PRIVATE ||
                  props.values.course_type ===
                    PRIVATE_COURSE_TYPES.PRIVATE_ONLINE) && (
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
                          if (
                            e.key === '-' ||
                            e.key === 'e' ||
                            e.key === 'E' ||
                            e.key === '+' ||
                            e.key === '.'
                          ) {
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
                          if (
                            e.target.value === '' ||
                            e.target.value === null
                          ) {
                            props.setFieldValue('total_hours', '');
                            return;
                          }
                          if (isNaN(value) || value < 1) {
                            toast.error(
                              'Total hours must be a positive number'
                            );
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

                <Col xs={12} className='d-flex justify-content-end mt-5'>
                  <Button color='danger' onClick={toggle}>
                    Close
                  </Button>
                  &nbsp; &nbsp;
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isLoading}
                    disabled={
                      (data && !dirty) ||
                      (props.values.course_type ===
                        PRIVATE_COURSE_TYPES.PRIVATE ||
                      props.values.course_type ===
                        PRIVATE_COURSE_TYPES.PRIVATE_ONLINE
                        ? !(
                            props.values.course_name &&
                            props.values.course_number &&
                            props.values.course_type &&
                            props.values.status &&
                            props.values.age_group &&
                            props.values.professor_id
                          )
                        : (props.values.course_type === COURSE_TYPES.ONLINE
                            ? !(
                                props.values.course_name &&
                                props.values.course_number &&
                                props.values.course_type &&
                                props.values.start_date &&
                                props.values.status &&
                                props.values.age_group &&
                                props.values.professor_id &&
                                props.values.syllabus_id &&
                                props.values.schedules[0].days.length > 0 &&
                                props.values.schedules[0].startTime &&
                                props.values.schedules[0].endTime
                              )
                            : !(
                                props.values.course_name &&
                                props.values.course_number &&
                                props.values.course_type &&
                                props.values.start_date &&
                                props.values.status &&
                                props.values.classroom &&
                                props.values.age_group &&
                                props.values.professor_id &&
                                props.values.syllabus_id &&
                                props.values.schedules[0].days.length > 0 &&
                                props.values.schedules[0].startTime &&
                                props.values.schedules[0].endTime
                              ))
                            )}
                    loadingText={isTransferMode ? 'Creating & Transferring...' : isDuplicateMode ? 'Transferring...' : data ? 'Updating...' : 'Saving...'}
                    defaultText={isTransferMode ? 'Create & Transfer Students' : isDuplicateMode ? 'Transfer Course' : data ? 'Update' : 'Save'}
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
