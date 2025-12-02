import React, {useEffect, useState, useMemo} from 'react';
import {ErrorMessage, Field, Formik, FieldArray} from 'formik';
import {
  Button,
  Col,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  FormFeedback,
  Row,
} from 'reactstrap';
import {FaTrash, FaMinus} from 'react-icons/fa';
import * as Yup from 'yup';
import Swal from 'sweetalert2';
import {toast} from 'react-toastify';

import LoadingButton from '../common/loading-button/LoadingButton';
import TeacherAssignments from './teacher-assignments';
import {
  createSyllabus,
  updateSyllabus,
  getSyllabusById,
} from 'helper/api-data/syllabus';
import { deleteCourseAssignmentsBatch } from 'helper/api-data/course';
import Select from 'react-select';
import useSWR, {mutate} from 'swr';
import {getAllLevels} from 'helper/api-data/level';
import {EXAMS_TYPE, EXAM_TYPE_OPTIONS} from 'utils/constants';
import {getExamTypeByLevelId, getModulesByExamType} from 'utils/utils';
import {getAllSyllabus} from 'helper/api-data/syllabus';
import {useRouter} from 'next/router';

const EXAMS_LIST = [
  {
    value: EXAMS_TYPE.PRELIM,
    label: 'PRELIMINARY (B1 KIDS/ADULTS) - 4 Modules',
  },
  {value: EXAMS_TYPE.FIRST, label: 'FIRST (B2 ADULTS) - 4 Modules'},

  {value: EXAMS_TYPE.STARTERS, label: 'STARTERS (PRE-A1 KIDS) - 3 Modules'},
  {value: EXAMS_TYPE.MOVERS, label: 'MOVERS (A1 KIDS/ADULTS) - 3 Modules'},
  {value: EXAMS_TYPE.FLYERS, label: 'FLYERS (A2 KIDS) - 3 Modules'},
  {value: EXAMS_TYPE.KEY, label: 'KEY (A2 KIDS/ADULTS) - 3 Modules'},
];

const validations = Yup.object().shape({
  syllabus_name: Yup.string().required('The syllabus name is required'),
  level_id: Yup.number().nullable().required('The level is required'),
  items: Yup.array()
    .of(Yup.string().trim())
    .test(
      'at-least-one-item',
      'At least one item is required',
      function (value) {
        const validItems =
          value?.filter((item) => item && item.trim() !== '') || [];
        return validItems.length > 0;
      }
    ),
  assignments: Yup.array()
    .of(Yup.string().trim())
    .test(
      'at-least-one-assignment',
      'At least one assignment is required',
      function (value) {
        const validAssignments =
          value?.filter(
            (assignment) => assignment && assignment.trim() !== ''
          ) || [];
        return validAssignments.length > 0;
      }
    ),
  progress_tests: Yup.array()
    .of(Yup.string().trim())
    .test(
      'at-least-one-progress-test',
      'At least one progress test is required',
      function (value) {
        const validTests =
          value?.filter((test) => test && test.trim() !== '') || [];
        return validTests.length > 0;
      }
    ),
});

const SyllabusForm = ({data, isOpen, toggle, isCopy, onReload}: any) => {
  const [isLoading, setIsLoading] = useState(false);
  const [existingSyllabi, setExistingSyllabi] = useState<any[]>([]);
  const limit = 10;
  const [page, setPage] = useState(1);
  const [levelSearchTerm, setLevelSearchTerm] = useState('');
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [pendingTeacherDeletes, setPendingTeacherDeletes] = useState<
    Array<{course_id: number; item_id: number}>
  >([]);
  const [pendingDeleteIds, setPendingDeleteIds] = useState<Set<number>>(
    new Set()
  );
  const router = useRouter();

  const {data: levels} = useSWR(
    ['/level/get-all', page, limit, levelSearchTerm],
    () => getAllLevels(page, limit, levelSearchTerm)
  );

  const {data: allSyllabi} = useSWR('/syllabus/get-all-for-validation', () =>
    getAllSyllabus(1, 1000, '')
  );

  useEffect(() => {
    if (allSyllabi?.data?.results) {
      setExistingSyllabi(allSyllabi.data.results);
    }
  }, [allSyllabi]);

  const filterName =
    typeof router.query?.syllabus_name === 'string'
      ? router.query.syllabus_name
      : '';
  const selectedSyllabusId = React.useMemo(() => {
    const list = Array.isArray(existingSyllabi) ? existingSyllabi : [];
    if (filterName) {
      const match = list.find(
        (s: any) =>
          String(s?.syllabus_name || '')
            .toLowerCase()
            .trim() === String(filterName).toLowerCase().trim()
      );
      return match?.id ?? data?.id ?? null;
    }
    return data?.id ?? null;
  }, [existingSyllabi, filterName, data]);

  const syllabusIdNum =
    typeof selectedSyllabusId === 'number'
      ? selectedSyllabusId
      : Number(selectedSyllabusId);
  const {data: teacherData} = useSWR(
    Number.isFinite(syllabusIdNum) && syllabusIdNum > 0
      ? [`/syllabus/get-one/${syllabusIdNum}`]
      : null,
    () => getSyllabusById(syllabusIdNum)
  );

  const validateArrayNotEmpty = (
    array: string[] | undefined,
    fieldName: string
  ) => {
    const validItems =
      array?.filter((item: string) => item && item.trim() !== '') || [];
    return {
      isValid: validItems.length > 0,
      error:
        validItems.length === 0
          ? `Please fill in at least one ${fieldName}`
          : null,
    };
  };

  const validateUniqueName = (syllabusName: string) => {
    if (!syllabusName || syllabusName.trim() === '') {
      return {isValid: true, error: null};
    }

    const trimmedName = syllabusName.toLowerCase().trim();
    let nameExists = false;

    if (!data || isCopy) {
      nameExists = existingSyllabi.some(
        (syllabus: any) =>
          syllabus.syllabus_name &&
          syllabus.syllabus_name.toLowerCase().trim() === trimmedName
      );
    } else {
      nameExists = existingSyllabi.some(
        (syllabus: any) =>
          syllabus.id !== data.id &&
          syllabus.syllabus_name &&
          syllabus.syllabus_name.toLowerCase().trim() === trimmedName
      );
    }

    return {
      isValid: !nameExists,
      error: nameExists ? 'A syllabus with this name already exists' : null,
    };
  };

  const validateForm = (values: any) => {
    const errors = [];

    if (!values.syllabus_name || values.syllabus_name.trim() === '') {
      errors.push('The syllabus name is required');
    }
    if (!values.level_id) {
      errors.push('The level is required');
    }
    const itemValidation = validateArrayNotEmpty(values.items, 'syllabus item');
    if (!itemValidation.isValid) {
      errors.push(itemValidation.error!);
    }
    const assignmentValidation = validateArrayNotEmpty(
      values.assignments,
      'assignment'
    );
    if (!assignmentValidation.isValid) {
      errors.push(assignmentValidation.error!);
    }

    const progressTestValidation = validateArrayNotEmpty(
      values.progress_tests,
      'progress test'
    );
    if (!progressTestValidation.isValid) {
      errors.push(progressTestValidation.error!);
    }

    const uniqueNameValidation = validateUniqueName(values.syllabus_name);
    if (!uniqueNameValidation.isValid) {
      errors.push(uniqueNameValidation.error!);
    }

    return {isValid: errors.length === 0, errors};
  };
  const getValidationErrors = (values: any) => {
    const {errors} = validateForm(values);
    return errors;
  };

  const save = async (syllabus: any, {setSubmitting}: any) => {
    const validationErrors = getValidationErrors(syllabus);

    if (validationErrors.length > 0) {
      const duplicateNameError = validationErrors.find((error) =>
        error.includes('already exists')
      );

      if (duplicateNameError) {
        toast.error(duplicateNameError);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: `
            <div style="text-align: center;">
              <strong>Please fix the following issues:</strong>
              <ul style="text-align: center; margin-top: 10px; list-style: none; padding: 0;">
                ${validationErrors.map((error) => `<li style="margin: 5px 0;">${error}</li>`).join('')}
              </ul>
            </div>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setIsLoading(true);
    try {
      const response = await createSyllabus(syllabus);
      if (response.statusCode === 200) {
        toast.success('Syllabus created successfully');
        setSubmitting(false);
        toggle();
        if (onReload) {
          onReload();
        }
      }
    } catch (error) {
      console.error('Error creating syllabus:', error);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  const update = async (syllabus: any, {setSubmitting}: any) => {
    const validationErrors = getValidationErrors(syllabus);
    if (validationErrors.length > 0) {
      const duplicateNameError = validationErrors.find((error) =>
        error.includes('already exists')
      );

      if (duplicateNameError) {
        toast.error(duplicateNameError);
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Validation Error',
          html: `
            <strong>Please fix the following issues:</strong>
            <ul style="text-align: left; margin-top: 10px;">
              ${validationErrors.map((error) => `<li>${error}</li>`).join('')}
            </ul>
          `,
          confirmButtonText: 'OK',
          confirmButtonColor: '#d33',
        });
      }
      setSubmitting(false);
      return;
    }

    setSubmitting(true);
    setIsLoading(true);
    try {
      const response = await updateSyllabus(syllabus.id, syllabus);
      if (response.statusCode === 200) {
        if (pendingTeacherDeletes.length > 0) {
          try {
            await deleteCourseAssignmentsBatch({
              deletes: pendingTeacherDeletes.map((d) => ({
                course_id: d.course_id,
                item_id: d.item_id,
              })),
            });
            setPendingTeacherDeletes([]);
            setPendingDeleteIds(new Set());
          } catch (e) {
            toast.error('Error applying teacher assignment deletions');
          }
        }
        toast.success('Syllabus updated successfully');
        try {
          if (Number.isFinite(syllabusIdNum) && syllabusIdNum > 0) {
            mutate(`/syllabus/get-one/${syllabusIdNum}`);
          }
          mutate('/syllabus/get-all-for-validation');
        } catch {}
        setSubmitting(false);
        toggle();
        if (onReload) {
          onReload();
        }
      }
    } catch (error) {
      console.error('Error updating syllabus:', error);
    } finally {
      setSubmitting(false);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!levels?.data) return;

    const rawLevels: any[] = Array.isArray(levels.data)
      ? levels.data
      : levels.data.result || [];

    const normalizeToOption = (item: any) => {
      if (typeof item === 'string') {
        return {value: item, label: item};
      }
      const id = item.id || '';
      const label = item.full_level || item.name || item.level || '';
      return {value: {id}, label};
    };

    const newOptions = rawLevels.map(normalizeToOption);

    setLevelOptions((prev) => {
      const all = [...prev, ...newOptions];

      const unique = all.filter((opt, i, arr) => {
        const optId = typeof opt.value === 'object' ? opt.value.id : opt.value;
        return (
          arr.findIndex((o) => {
            const oId = typeof o.value === 'object' ? o.value.id : o.value;
            return oId === optId;
          }) === i
        );
      });

      return unique.map((opt) => {
        const value = typeof opt.value === 'object' ? opt.value.id : opt.value;
        const label =
          typeof opt.label === 'object'
            ? opt.label.full_level || opt.label.name || ''
            : opt.label;
        return {value, label};
      });
    });
  }, [levels]);

  const onLevelScrollToBottom = () => {
    const levelData = levels?.data;
    if (
      levelData &&
      (Array.isArray(levelData)
        ? levelData.length > 0
        : levelData?.result?.length > 0)
    ) {
      const nextPage = page + 1;
      setPage(nextPage);
    }
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size='lg'>
      <ModalHeader toggle={toggle}>
        {isCopy
          ? 'Duplicate Syllabus'
          : data
            ? 'Edit Syllabus'
            : 'Add new Syllabus'}
      </ModalHeader>
      <ModalBody>
        <Formik
          enableReinitialize
          initialValues={
            data
              ? {
                  id: isCopy ? '' : data.id,
                  syllabus_name: data.syllabus_name,
                  level_id: data?.level?.id || null,
                  items: data?.items?.map((item: any) => item.item_name) || [],
                  test_percentage: data?.percentages?.test_percentage || 0,
                  exam_percentage: data?.percentages?.exam_percentage || 0,
                  assig_percentage: data?.percentages?.assig_percentage || 0,
                  assignments:
                    teacherData?.data?.assignments &&
                    teacherData?.data?.assignments.length > 0
                      ? teacherData.data.assignments
                      : data?.assignments?.length > 0
                        ? data.assignments
                        : [],
                  progress_tests:
                    teacherData?.data?.progress_tests &&
                    teacherData?.data?.progress_tests.length > 0
                      ? teacherData.data.progress_tests
                      : data?.progress_tests?.length > 0
                        ? data.progress_tests
                        : [],
                  exam_modules:
                    teacherData?.data?.exam_modules ||
                    data?.exam_modules ||
                    data?.movers_exam ||
                    getModulesByExamType(data?.exam_type || EXAMS_TYPE.PRELIM),
                  percentages: data?.percentages_syllabus || [
                    {name: '', min: 0, max: 0},
                  ],
                  exam_type: data?.exam_type || EXAMS_TYPE.PRELIM,
                }
              : {
                  id: '',
                  syllabus_name: '',
                  level_id: null,
                  items: [],
                  test_percentage: 0,
                  exam_percentage: 0,
                  assig_percentage: 0,
                  assignments: [],
                  progress_tests: [],
                  exam_modules: [],
                  percentages: [{name: '', min: 0, max: 0}],
                  exam_type: '',
                }
          }
          onSubmit={(values, othersProps) =>
            data && !isCopy
              ? update(values, othersProps)
              : save(values, othersProps)
          }
        >
          {(props) => {
            const {
              values,
              errors,
              handleSubmit,
              isSubmitting,
              setFieldValue,
              touched,
              dirty,
            } = props;

            const teacherGroups = (teacherData?.data?.teacher_assignments ||
              []) as Array<{
              professor_name: string;
              course_id: number;
              items: Array<{id: number; name: string}>;
            }>;
            const teacherItemNames = useMemo(() => {
              const names: string[] = [];
              teacherGroups.forEach((grp) =>
                grp.items.forEach((it) =>
                  names.push(
                    String(it.name || '')
                      .toLowerCase()
                      .trim()
                  )
                )
              );
              return new Set(names);
            }, [teacherGroups]);

            useEffect(() => {
              const current = Array.isArray(values.assignments)
                ? values.assignments
                : [];
              const filtered = current.filter(
                (n) =>
                  !teacherItemNames.has(
                    String(n || '')
                      .toLowerCase()
                      .trim()
                  )
              );
              if (filtered.length !== current.length) {
                setFieldValue('assignments', filtered);
              }
            }, [teacherItemNames, values.assignments, setFieldValue]);

            useEffect(() => {
              const arr = Array.isArray(values.assignments)
                ? values.assignments
                : [];
              const seen = new Set<string>();
              const normalized = (s: any) =>
                String(s || '')
                  .toLowerCase()
                  .trim();
              const next: string[] = [];
              for (const n of arr) {
                const key = normalized(n);
                if (key === '') {
                  next.push(n as string);
                  continue;
                }
                if (seen.has(key)) {
                  continue;
                }
                seen.add(key);
                next.push(n as string);
              }
              if (next.length !== arr.length) {
                setFieldValue('assignments', next);
              }
            }, [values.assignments, setFieldValue]);

            const renderArrayField = (name: string, label: string) => {
              const fieldValue = values[
                name as keyof typeof values
              ] as string[];
              const safeArray =
                Array.isArray(fieldValue) && fieldValue.length > 0
                  ? fieldValue
                  : [''];

              return (
                <Col xs={12} className='mt-3'>
                  <Label>{label}</Label>
                  <FieldArray
                    name={name}
                    render={(arrayHelpers) => (
                      <>
                        <div className='d-flex justify-content-start my-2'>
                          <Button
                            type='button'
                            color='primary'
                            onClick={() => arrayHelpers.push('')}
                          >
                            Add Item
                          </Button>
                        </div>
                        <div className='syllabus-container'>
                          <Row className='mb-2'>
                            {safeArray.map((item, index) => (
                              <Col
                                key={index}
                                xs={6}
                                className='d-flex align-items-center mb-2'
                              >
                                <Input
                                  value={item}
                                  onChange={(e) =>
                                    setFieldValue(
                                      `${name}[${index}]`,
                                      e.target.value
                                    )
                                  }
                                  placeholder={`Item ${index + 1}`}
                                  className='me-2 syllabus-input'
                                />
                                <Button
                                  type='button'
                                  color='danger'
                                  onClick={() => {
                                    if (safeArray.length === 1) {
                                      setFieldValue(`${name}[0]`, '');
                                    } else {
                                      arrayHelpers.remove(index);
                                    }
                                  }}
                                >
                                  <FaTrash />
                                </Button>
                              </Col>
                            ))}
                          </Row>
                        </div>
                      </>
                    )}
                  />
                </Col>
              );
            };

            

            const renderPercentagesField = (
              name: string,
              label: string,
              values: any,
              setFieldValue: (field: string, value: any) => void
            ) => (
              <Col xs={12} className='mt-3'>
                <Label>{label}</Label>
                <FieldArray
                  name={name}
                  render={(arrayHelpers) => (
                    <>
                      <div className='d-flex justify-content-start my-2'>
                        <Button
                          type='button'
                          color='primary'
                          onClick={() =>
                            arrayHelpers.push({name: '', min: 0, max: 0})
                          }
                        >
                          Add Percentage
                        </Button>
                      </div>
                      <div className='syllabus-container'>
                        {values[name].map((percentage: any, index: number) => (
                          <Row key={index} className='mb-2 align-items-center'>
                            <Col md={4}>
                              <Label>Name</Label>
                              <Input
                                type='text'
                                value={percentage.name}
                                onChange={(e) =>
                                  setFieldValue(
                                    `${name}[${index}].name`,
                                    e.target.value
                                  )
                                }
                                className='syllabus-input'
                              />
                            </Col>
                            <Col md={3}>
                              <Label>Min %</Label>
                              <Input
                                type='number'
                                value={percentage.min}
                                onChange={(e) =>
                                  setFieldValue(
                                    `${name}[${index}].min`,
                                    e.target.value
                                  )
                                }
                                className='syllabus-input'
                              />
                            </Col>
                            <Col md={3}>
                              <Label>Max %</Label>
                              <Input
                                type='number'
                                value={percentage.max}
                                onChange={(e) =>
                                  setFieldValue(
                                    `${name}[${index}].max`,
                                    e.target.value
                                  )
                                }
                                className='syllabus-input'
                              />
                            </Col>
                            <Col md={2} className='d-flex align-items-end'>
                              <Button
                                type='button'
                                color='danger'
                                onClick={() => arrayHelpers.remove(index)}
                              >
                                <FaTrash />
                              </Button>
                            </Col>
                          </Row>
                        ))}
                      </div>
                    </>
                  )}
                />
              </Col>
            );

            return (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className='row g-3'
              >
                <Col xs={8}>
                  <Label for='syllabus_name'>Syllabus Name</Label>
                  <Field
                    name='syllabus_name'
                    as={Input}
                    invalid={touched.syllabus_name && !!errors.syllabus_name}
                    className='syllabus-input-title'
                  />
                  <ErrorMessage name='syllabus_name' component={FormFeedback} />
                </Col>
                <Col xs={4}>
                  <Label for='level'>Level</Label>
                  <Field name='level_id'>
                    {({field, form}: any) => (
                      <Select
                        {...field}
                        id='level'
                        options={levelOptions}
                        onChange={(selectedOption: any) => {
                          const level = selectedOption
                            ? selectedOption.value &&
                              typeof selectedOption.value === 'object'
                              ? selectedOption.value.id
                              : selectedOption.value
                            : '';
                          setFieldValue('level_id', level);
                        }}
                        value={
                          levelOptions.find((option: any) => {
                            const optionValue = Number(
                              option.value && typeof option.value === 'object'
                                ? option.value.id
                                : option.value
                            );
                            const formValue = Number(props.values.level_id);
                            return optionValue === formValue;
                          }) || null
                        }
                        placeholder='Select level'
                        isSearchable
                        onInputChange={(inputValue) => {
                          setLevelSearchTerm(inputValue);
                        }}
                        onMenuScrollToBottom={onLevelScrollToBottom}
                      />
                    )}
                  </Field>
                  <ErrorMessage name='level_id' component={FormFeedback} />
                </Col>

                <Col xs={12}>
                  <Label for='exam_type'>Exam Type</Label>
                  <Field name='exam_type'>
                    {({field, form}: any) => {
                      return (
                        <Select
                          {...field}
                          id='exam_type'
                          options={EXAMS_LIST}
                          onChange={(selectedOption: any) => {
                            const newExamType = selectedOption
                              ? selectedOption.value
                              : '';
                            setFieldValue('exam_type', newExamType);

                            if (newExamType) {
                              const autoModules =
                                getModulesByExamType(newExamType);
                              setFieldValue('exam_modules', autoModules);
                            } else {
                              setFieldValue('exam_modules', ['']);
                            }
                          }}
                          value={
                            EXAMS_LIST.find(
                              (option: any) => option.value === values.exam_type
                            ) || null
                          }
                          placeholder={
                            values.level_id
                              ? 'Select exam type'
                              : 'Please select a level first'
                          }
                          isSearchable
                          isDisabled={!values.level_id}
                        />
                      );
                    }}
                  </Field>
                  <ErrorMessage name='exam_type' component={FormFeedback} />
                  {values.level_id && values.exam_type && (
                    <small className='text-muted mt-1 d-block'>
                      Auto-selected based on level. You can change it manually
                      if needed.
                    </small>
                  )}
                </Col>

                {renderArrayField('items', 'Items')}

                <Col md={4}>
                  <Label for='assig_percentage'>Assignment Percentage %</Label>
                  <Field
                    name='assig_percentage'
                    as={Input}
                    type='number'
                    className='syllabus-input'
                  />
                  <ErrorMessage
                    name='assig_percentage'
                    component={FormFeedback}
                  />
                </Col>
                <Col md={4}>
                  <Label for='test_percentage'>Test Percentage %</Label>
                  <Field
                    name='test_percentage'
                    as={Input}
                    type='number'
                    className='syllabus-input'
                  />
                  <ErrorMessage
                    name='test_percentage'
                    component={FormFeedback}
                  />
                </Col>
                <Col md={4}>
                  <Label for='exam_percentage'>Exam Percentage %</Label>
                  <Field
                    name='exam_percentage'
                    as={Input}
                    type='number'
                    className='syllabus-input'
                  />
                  <ErrorMessage
                    name='exam_percentage'
                    component={FormFeedback}
                  />
                </Col>
                <hr className='my-4' />
                {renderArrayField('assignments', 'Assignments (Global)')}
                <TeacherAssignments
                  groups={(teacherData?.data?.teacher_assignments || []) as any}
                  pendingDeleteIds={pendingDeleteIds}
                  setPendingTeacherDeletes={setPendingTeacherDeletes}
                  setPendingDeleteIds={setPendingDeleteIds}
                />
                <hr className='my-4' />
                {renderArrayField('progress_tests', 'Progress Tests')}
                <hr className='my-4' />

                {values.exam_type && (
                  <>
                    <hr className='my-4' />
                    {renderArrayField(
                      'exam_modules',
                      `Exam Modules - ${values.exam_type}`
                    )}
                  </>
                )}
                <hr className='my-4' />
                {renderPercentagesField(
                  'percentages',
                  'Custom Percentages',
                  values,
                  setFieldValue
                )}

                <Col xs={12} className='d-flex justify-content-end mt-5'>
                  <Button color='secondary' onClick={toggle}>
                    Close
                  </Button>
                  &nbsp;&nbsp;
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isSubmitting}
                    loadingText={
                      isCopy
                        ? 'Duplicating...'
                        : data
                          ? 'Updating...'
                          : 'Saving...'
                    }
                    defaultText={
                      isCopy ? 'Duplicate' : data ? 'Update' : 'Save'
                    }
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

export default SyllabusForm;
