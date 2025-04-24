import React, { useEffect, useMemo, useState } from 'react';
import Select from 'react-select';
import Cookies from 'js-cookie';
import {
  Button,
  Col,
  Form,
  FormGroup,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
  ModalFooter,
  Row,
} from 'reactstrap';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import LoadingButton from '../common/loading-button/LoadingButton';
import { getActiveCourses } from 'helper/api-data/course';
import {
  approveTransfer,
  createTransferData,
} from 'helper/api-data/transfer-data';
import {
  LEVELS_FOR_KIDS,
  LEVELS_FOR_ADULTS,
  USER_TYPES,
} from 'utils/constants';
import { getNextLevel as getNextLevelFromProgression } from 'utils/levelProgression';
import { getUserRoleFromLocalStorage } from 'utils/auth';
import { decrypt } from 'utils/encryption';

interface LevelOption {
  label: string;
  value: any;
}

interface StudentTransferFormProps {
  isOpen: boolean;
  toggle: () => void;
  students: any[];
  isGroupTransfer?: boolean;
  description?: string;
  initialTransferData?: {
    id?: number;
    description?: string;
    selected_course?: LevelOption;
    selected_level?: LevelOption;
    is_group?: boolean;
  };
  onSuccess?: (id: string) => void;
}

const StudentTransferForm: React.FC<StudentTransferFormProps> = ({
  isOpen,
  toggle,
  students,
  description,
  isGroupTransfer = false,
  initialTransferData,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const [selectedCourse, setSelectedCourse] = useState<LevelOption | null>(
    null
  );
  const [courseOptions, setCourseOptions] = useState<LevelOption[]>([]);
  const [doTransferCourse, setDoTransferCourse] = useState<boolean>(false);

  const [selectedNextLevel, setSelectedNextLevel] =
    useState<LevelOption | null>(null);
  const [nextLevelOptions, setNextLevelOptions] = useState<LevelOption[]>([]);
  const [doProgressLevel, setDoProgressLevel] = useState<boolean>(false);

  const limit = 10;
  const { data: coursesData } = useSWR(['/course/get-active', limit], () =>
    getActiveCourses(1, limit)
  );

  const currentCourseIds = useMemo(() => {
    return students.flatMap(
      (student) => student.course?.map((c: any) => c.id) || []
    );
  }, [students]);

  useEffect(() => {
    if (coursesData?.data) {
      const opts = coursesData.data.map((course: any) => ({
        value: course.id,
        label: `${course.course_number} - ${course.course_name}`,
      }));
      setCourseOptions(opts);

      if (initialTransferData?.selected_course?.value) {
        const foundCourse = opts.find(
          (opt: any) => opt.value === initialTransferData.selected_course?.value
        );
        setSelectedCourse(foundCourse || initialTransferData.selected_course);
      }
    }
  }, [coursesData, initialTransferData?.selected_course]);

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    if (initialTransferData) {
      const hasInitialCourse = Boolean(
        initialTransferData.selected_course?.value
      );
      setSelectedCourse(initialTransferData.selected_course || null);
      setDoTransferCourse(hasInitialCourse);

      const hasInitialLevel = Boolean(
        initialTransferData.selected_level?.value
      );
      setDoProgressLevel(hasInitialLevel);
    } else {
      setSelectedCourse(null);
      setDoTransferCourse(false);
      setSelectedNextLevel(null);
      setDoProgressLevel(false);
    }
  }, [isOpen, initialTransferData]);

  const isKidsGroup = () => {
    if (students.length === 0) return false;
    // Use level name for comparison
    const studentLevelName =
      students[0].level?.name ||
      (typeof students[0].level === 'string' ? students[0].level : '');
    const levelNormalized = studentLevelName.trim().toLowerCase();
    return LEVELS_FOR_KIDS.some(
      (kidLvl) => kidLvl.label.toLowerCase() === levelNormalized
    );
  };

  const convertLevelNameToOption = (
    levelName: string,
    isKid: boolean
  ): LevelOption | null => {
    const levelsArray = isKid ? LEVELS_FOR_KIDS : LEVELS_FOR_ADULTS;
    const lvlLower = levelName.toLowerCase().trim();
    const found = levelsArray.find(
      (lvl) => lvl.label.toLowerCase().trim() === lvlLower
    );
    return found ? { label: found.label, value: found.label } : null;
  };

  useEffect(() => {
    if (students.length === 0) {
      setNextLevelOptions([]);
      return;
    }

    const isKid = isKidsGroup();
    const currentLevelName =
      students[0].level?.name ||
      (typeof students[0].level === 'string' ? students[0].level : '');

    const nextLevelStr = getNextLevelFromProgression(currentLevelName, isKid);
    const nextOpt = convertLevelNameToOption(nextLevelStr, isKid);

    if (nextOpt) {
      setNextLevelOptions([nextOpt]);

      if (!initialTransferData) {
        setDoProgressLevel(true);
      }
    } else {
      setNextLevelOptions([]);
      if (!initialTransferData) {
        setDoProgressLevel(false);
      }
    }
  }, [students, initialTransferData]);

  useEffect(() => {
    if (doProgressLevel && nextLevelOptions.length === 1) {
      setSelectedNextLevel(nextLevelOptions[0]);
    }
  }, [doProgressLevel, nextLevelOptions]);

  const userRole = getUserRoleFromLocalStorage();
  const isProgressDisabled = doProgressLevel && nextLevelOptions.length === 0;

  const handleSubmit = async () => {
    if (!doTransferCourse && !doProgressLevel) {
      toast.error(
        'Please select at least one action: transfer course or progress level.'
      );
      return;
    }

    if (doTransferCourse && !selectedCourse) {
      toast.error('Please select a course to transfer to.');
      return;
    }

    if (doProgressLevel && !selectedNextLevel) {
      toast.error('Please select the next level to progress to.');
      return;
    }

    setIsLoading(true);

    const studentIds = students.map((s) => s.id);
    const courseId = doTransferCourse ? selectedCourse?.value : null;
    const levelId =
      doProgressLevel && selectedNextLevel?.value
        ? findLevelIdByName(
            selectedNextLevel.value,
            LEVELS_FOR_ADULTS,
            LEVELS_FOR_KIDS
          )
        : null;

    const encryptedId =
      Cookies.get('user_id') || localStorage.getItem('user_id');
    const createdById = encryptedId ? Number(decrypt(encryptedId)) : 0;

    const payload = {
      selected_course_id: courseId,
      selected_level_id: levelId,
      status_level_change: 'pending',
      description: description,
      is_group: isGroupTransfer,
      created_by_id: createdById,
      student_ids: studentIds,
    };

    try {
      let response;
      if (userRole === USER_TYPES.RECEPTIONIST) {
        response = await createTransferData(payload);
      } else if (
        userRole === USER_TYPES.COORDINATOR ||
        userRole === USER_TYPES.ADMIN
      ) {
        const transferId = initialTransferData?.id;
        if (!transferId) {
          toast.error('Transfer ID is required to approve.');
          return;
        }
        response = await approveTransfer(transferId);
      }

      if (response.statusCode === 200 || response.statusCode === 201) {
        toast.success(response.message || 'Transfer operation successful.');
        onSuccess && onSuccess(response.data?.id?.toString());
        toggle();
      } else {
        toast.error(response.message || 'Error processing transfer.');
      }
    } catch (error: any) {
      toast.error(error?.message || 'Unexpected error during transfer.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      centered
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {isGroupTransfer
          ? 'Group Transfer / Level Progression'
          : 'Individual Transfer / Level Progression'}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col md='12'>
              <h5>Students ({students.length})</h5>
              <ul
                className='list-group mb-4'
                style={{ maxHeight: '150px', overflowY: 'auto' }}
              >
                {' '}
                {students.map((student) => (
                  <li
                    key={student.id}
                    className='list-group-item d-flex justify-content-between align-items-center'
                  >
                    <div>
                      <strong>
                        {student.user?.name || student.name || 'N/A'}
                      </strong>{' '}
                      <div className='text-muted small'>
                        Current Level:{' '}
                        {student.level?.name || student.level || 'None'} |{' '}
                        Current Course:{' '}
                        {student.course?.[0]?.course_number || 'None'}{' '}
                      </div>
                    </div>
                    <span
                      className={`badge bg-${
                        student.status === 'active' ? 'success' : 'danger'
                      }`}
                    >
                      {student.status && typeof student.status === 'string'
                        ? student.status.charAt(0).toUpperCase() +
                          student.status.slice(1)
                        : 'Unknown'}
                    </span>
                  </li>
                ))}
              </ul>
            </Col>

            <Col md='12'>
              {initialTransferData?.description && (
                <FormGroup>
                  <Label>Description</Label>
                  <p className='form-control-static'>
                    {initialTransferData.description}
                  </p>
                </FormGroup>
              )}
            </Col>

            <Col md='12'>
              <FormGroup
                tag='fieldset'
                className='mb-3'
              >
                <Label className='mb-2'>Actions</Label>
                <div className='d-flex flex-wrap'>
                  {' '}
                  <FormGroup
                    check
                    className='me-4 mb-2'
                  >
                    {' '}
                    <Label check>
                      <input
                        type='checkbox'
                        checked={doTransferCourse}
                        onChange={(e) => {
                          setDoTransferCourse(e.target.checked);
                          if (!e.target.checked) setSelectedCourse(null);
                        }}
                        className='form-check-input'
                      />{' '}
                      Transfer Course
                    </Label>
                  </FormGroup>
                  <FormGroup
                    check
                    className='mb-2'
                  >
                    {' '}
                    <Label check>
                      <input
                        type='checkbox'
                        checked={doProgressLevel}
                        onChange={(e) => {
                          setDoProgressLevel(e.target.checked);
                        }}
                        className='form-check-input'
                        disabled={
                          nextLevelOptions.length === 0 &&
                          !initialTransferData?.selected_level
                        }
                      />{' '}
                      Progress Level
                    </Label>
                    {doProgressLevel && nextLevelOptions.length === 0 && (
                      <small className='text-danger d-block'>
                        No next level is available for progression.
                      </small>
                    )}
                  </FormGroup>
                </div>
              </FormGroup>
            </Col>

            {doTransferCourse && (
              <Col md='12'>
                <FormGroup>
                  <Label for='course'>Select Destination Course</Label>
                  <Select
                    id='course'
                    name='course'
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={(opt) => setSelectedCourse(opt as LevelOption)}
                    isOptionDisabled={(opt: LevelOption) =>
                      currentCourseIds.includes(opt.value)
                    }
                    placeholder='Search or select a course...'
                    isClearable
                    isSearchable
                    className='basic-single'
                    classNamePrefix='select'
                  />
                  {!selectedCourse && (
                    <small className='text-danger'>
                      Course selection is required.
                    </small>
                  )}
                </FormGroup>
              </Col>
            )}

            {doProgressLevel && (
              <Col md='12'>
                <FormGroup>
                  <Label for='nextLevel'>Select Next Level</Label>
                  <Select
                    id='nextLevel'
                    name='nextLevel'
                    options={nextLevelOptions}
                    value={selectedNextLevel}
                    onChange={(opt) => setSelectedNextLevel(opt as LevelOption)}
                    placeholder={
                      nextLevelOptions.length === 0
                        ? 'No next level available'
                        : 'Select next level...'
                    }
                    isDisabled={nextLevelOptions.length === 0}
                    isClearable={false}
                    className='basic-single'
                    classNamePrefix='select'
                  />

                  {nextLevelOptions.length === 0 && (
                    <small className='text-warning d-block mt-1'>
                      No next level is defined in the progression path for the
                      current level.
                    </small>
                  )}

                  {nextLevelOptions.length > 0 && selectedNextLevel && (
                    <small className='text-muted d-block mt-1'>
                      Student(s) will be progressed to {selectedNextLevel.label}
                      .
                    </small>
                  )}
                  {!selectedNextLevel && nextLevelOptions.length > 0 && (
                    <small className='text-danger'>
                      Next level selection is required.
                    </small>
                  )}
                </FormGroup>
              </Col>
            )}
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button
          color='secondary'
          onClick={toggle}
        >
          Cancel
        </Button>
        <LoadingButton
          color='primary'
          onClick={handleSubmit}
          loading={isLoading}
          disabled={
            isProgressDisabled ||
            (doTransferCourse && !selectedCourse) ||
            (doProgressLevel && !selectedNextLevel)
          }
        >
          {userRole === USER_TYPES.RECEPTIONIST
            ? 'Request Transfer / Progression'
            : 'Confirm Transfer / Progression'}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  );
};

export default StudentTransferForm;


const findLevelIdByName = (
  levelName: string,
  adultsLevels: any[],
  kidsLevels: any[]
): number | null => {

  const adultLevel = adultsLevels.find(
    (level) => level.label.toLowerCase() === levelName.toLowerCase()
  );
  if (adultLevel) return Number(adultLevel.value);

  const kidLevel = kidsLevels.find(
    (level) => level.label.toLowerCase() === levelName.toLowerCase()
  );
  if (kidLevel) return Number(kidLevel.value);

  return null;
};
