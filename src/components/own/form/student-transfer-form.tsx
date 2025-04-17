import React, { useEffect, useState } from 'react';
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
  Alert,
} from 'reactstrap';
import useSWR from 'swr';
import { toast } from 'react-toastify';
import LoadingButton from '../common/loading-button/LoadingButton';
import {
  transferAndProgressStudents,
  requestTransferAndProgress,
  getStudentTransfers,
} from 'helper/api-data/student';
import { getActiveCourses } from 'helper/api-data/course';
import {
  LEVELS_FOR_KIDS,
  LEVELS_FOR_ADULTS,
  USER_TYPES,
} from 'utils/constants';
import { getNextLevel as getNextLevelFromProgression } from 'utils/levelProgression';
import { getUserRoleFromLocalStorage } from '../../../../utils/auth';

interface StudentTransferFormProps {
  isOpen: boolean;
  toggle: () => void;
  students: any[];
  isGroupTransfer?: boolean;
  onSuccess?: (courseId: string) => void;
}

interface LevelOption {
  label: string;
  value: string;
}

const StudentTransferForm: React.FC<StudentTransferFormProps> = ({
  isOpen,
  toggle,
  students,
  isGroupTransfer = false,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [selectedNextLevel, setSelectedNextLevel] =
    useState<LevelOption | null>(null);
  const [nextLevelOptions, setNextLevelOptions] = useState<LevelOption[]>([]);
  const [doTransferCourse, setDoTransferCourse] = useState(false);
  const [doProgressLevel, setDoProgressLevel] = useState(false);
  const [pendingTransfer, setPendingTransfer] = useState<any>(null);
  const [hasPendingTransfer, setHasPendingTransfer] = useState(false);

  const limit = 10;

  const { data: coursesData } = useSWR(['/course/get-active', limit], () =>
    getActiveCourses(1, limit)
  );

  const { data: transferData } = useSWR(
    isOpen ? `/student/transfers` : null,
    () => {
      if (students.length === 1) {
        return getStudentTransfers(students[0].id);
      } else if (isGroupTransfer && students.length > 1) {
        return getStudentTransfers(students[0].id);
      }
      return null;
    }
  );

  useEffect(() => {
    if (coursesData?.data) {
      const options = coursesData.data.map((course: any) => ({
        value: course.id,
        label: `${course.course_number} - ${course.course_name}`,
      }));
      setCourseOptions(options);
    }
  }, [coursesData]);

  useEffect(() => {
    if (transferData?.data && Array.isArray(transferData.data)) {
      const pendingTransfers = transferData.data.filter(
        (transfer: { status_level_change: string }) =>
          transfer.status_level_change === 'pending'
      );

      if (pendingTransfers.length > 0) {
        setPendingTransfer(pendingTransfers[0]);
        setHasPendingTransfer(true);

        // Si hay curso seleccionado
        if (pendingTransfers[0].selected_course_id) {
          const courseOption = courseOptions.find(
            (option) => option.value === pendingTransfers[0].selected_course_id
          );
          if (courseOption) {
            setSelectedCourse(courseOption);
            setDoTransferCourse(true);
          }
        }

        // Si hay nivel seleccionado
        if (
          pendingTransfers[0].selected_level_id &&
          pendingTransfers[0].status_level_change === 'pending'
        ) {
          setDoProgressLevel(true);
          console.log('Activando checkbox de progresión de nivel');
        }
      } else {
        setPendingTransfer(null);
        setHasPendingTransfer(false);
      }

      if (isGroupTransfer) {
        console.log('Procesando transferencia grupal:', pendingTransfers);
      }
    }
  }, [transferData, courseOptions, isGroupTransfer]);

  const getTransferAlertMessage = () => {
    if (!hasPendingTransfer) return null;

    if (isGroupTransfer) {
      return (
        <Alert
          color='info'
          className='mb-3'
        >
          Hay una transferencia pendiente para el primer estudiante del grupo.
          {pendingTransfer?.selected_course_id && (
            <span>
              {' '}
              La opción de transferir a otro curso ha sido seleccionada
              automáticamente.
            </span>
          )}
          {pendingTransfer?.selected_level_id && (
            <span>
              {' '}
              The level progression option has been automatically selected.
            </span>
          )}
        </Alert>
      );
    }

    return (
      <Alert
        color='info'
        className='mb-3'
      >
        There is a pending transfer request for this student.
        {pendingTransfer?.selected_course_id && (
          <span>
            {' '}
            The option to transfer to another course has been automatically
            selected.
          </span>
        )}
        {pendingTransfer?.selected_level_id && (
          <span>
            {' '}
            The progression option is automatically selected at next level.
          </span>
        )}
      </Alert>
    );
  };

  const isKidsGroup = () => {
    if (students.length === 0) return false;
    const studentLevel =
      typeof students[0].level === 'string'
        ? students[0].level
        : students[0].level?.name || '';
    const levelNormalized = studentLevel.trim().toLowerCase();
    return LEVELS_FOR_KIDS.some(
      (kidLvl) => kidLvl.label.toLowerCase() === levelNormalized
    );
  };

  const convertLevelToOption = (
    levelStr: string,
    isKid: boolean
  ): LevelOption | null => {
    const levelsArray = isKid ? LEVELS_FOR_KIDS : LEVELS_FOR_ADULTS;
    const lvlLower = levelStr.toLowerCase().trim();
    const found = levelsArray.find(
      (lvl) => lvl.label.toLowerCase().trim() === lvlLower
    );
    return found ? { label: found.label, value: found.value } : null;
  };

  useEffect(() => {
    if (students.length === 0) {
      setNextLevelOptions([]);
      setSelectedNextLevel(null);
      return;
    }

    // Determinar si es kids
    const isKids = isKidsGroup();

    const studentLevel =
      typeof students[0].level === 'string'
        ? students[0].level
        : students[0].level?.name || '';

    const nextLevelStr = getNextLevelFromProgression(studentLevel, isKids);
    const nextLevelOption = convertLevelToOption(nextLevelStr, isKids);

    if (nextLevelOption) {
      setNextLevelOptions([nextLevelOption]);
      setSelectedNextLevel(nextLevelOption);
    } else {
      setNextLevelOptions([]);
      setSelectedNextLevel(null);
    }
  }, [students]);

  const userRoleFromStorage = getUserRoleFromLocalStorage();
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
      toast.error('No next level is available or you have not selected one.');
      return;
    }

    setIsLoading(true);

    const studentIds = students.map((s) => s.id);
    const courseId = doTransferCourse ? selectedCourse.value : null;
    const levelId = doProgressLevel ? selectedNextLevel?.value || null : null;

    try {
      const response =
        userRoleFromStorage === USER_TYPES.RECEPTIONIST
          ? await requestTransferAndProgress(
              studentIds,
              courseId,
              levelId,
              isGroupTransfer
            )
          : await transferAndProgressStudents(studentIds, courseId, levelId);

      if (response.statusCode === 200) {
        let successMsg = `${students.length} student(s) `;

        if (userRoleFromStorage === USER_TYPES.RECEPTIONIST) {
          successMsg =
            'Transfer request created successfully. Pending approval.';
        } else {
          if (doTransferCourse && doProgressLevel) {
            successMsg += `transferred to "${selectedCourse.label}" and progressed to "${selectedNextLevel?.label}"`;
          } else if (doTransferCourse) {
            successMsg += `transferred successfully to "${selectedCourse.label}"`;
          } else if (doProgressLevel) {
            successMsg += `progressed successfully to "${selectedNextLevel?.label}"`;
          }
        }

        toast.success(successMsg);

        // 1) Limpia los filtros y 2) Llama al callback
        if (onSuccess) {
          onSuccess(doTransferCourse ? selectedCourse.value : levelId || '');
        }

        toggle();
      } else {
        toast.error(response.message || 'Error processing transfer request');
      }
    } catch (error) {
      toast.error('Error processing transfer request');
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
        {isGroupTransfer ? 'Group Transfer' : 'Individual Transfer'}
      </ModalHeader>
      <ModalBody>
        {getTransferAlertMessage()}
        <Form>
          <Row>
            <Col md='12'>
              <h5>Students to Transfer ({students.length})</h5>
              <ul className='list-group mb-4'>
                {students.map((student) => (
                  <li
                    key={student.id}
                    className='list-group-item d-flex justify-content-between align-items-center'
                  >
                    <div>
                      <strong>{student.user?.name}</strong>
                      <div className='text-muted small'>
                        Current Level: {student.level?.name || 'None'} | Current
                        Course: {student.course?.[0]?.course_number || 'None'}
                      </div>
                    </div>
                    <span
                      className={`badge ${
                        student.status === 'active'
                          ? 'badge-success'
                          : 'badge-danger'
                      }`}
                    >
                      {student.status.charAt(0).toUpperCase() +
                        student.status.slice(1)}
                    </span>
                  </li>
                ))}
              </ul>
            </Col>

            {/* Transfer Type Selection */}
            <Col md='12'>
              <FormGroup
                tag='fieldset'
                className='mb-3'
              >
                <Label className='mb-2'>Transfer Type</Label>
                <div className='d-flex'>
                  <FormGroup
                    check
                    className='me-4'
                  >
                    <Label check>
                      <input
                        type='checkbox'
                        checked={doTransferCourse}
                        onChange={(e) => setDoTransferCourse(e.target.checked)}
                      />{' '}
                      Transfer to another course
                    </Label>
                  </FormGroup>
                  <FormGroup check>
                    <Label check>
                      <input
                        type='checkbox'
                        checked={doProgressLevel}
                        onChange={(e) => setDoProgressLevel(e.target.checked)}
                      />{' '}
                      Progress to next level
                    </Label>
                  </FormGroup>
                </div>
              </FormGroup>
            </Col>

            {/* Select Course */}
            {doTransferCourse && (
              <Col md='12'>
                <FormGroup>
                  <Label for='course'>Select Destination Course</Label>
                  <Select
                    id='course'
                    name='course'
                    options={courseOptions}
                    value={selectedCourse}
                    onChange={(option) => setSelectedCourse(option)}
                    placeholder='Search for a course...'
                    isClearable
                    isSearchable
                    className='basic-single'
                    classNamePrefix='select'
                  />
                </FormGroup>
              </Col>
            )}

            {/* Progress to Next Level */}
            {doProgressLevel && (
              <Col md='12'>
                <FormGroup>
                  <Label for='nextLevel'>Progress to Next Level</Label>
                  <Select
                    id='nextLevel'
                    name='nextLevel'
                    options={nextLevelOptions}
                    value={selectedNextLevel}
                    onChange={(option) => setSelectedNextLevel(option)}
                    placeholder='Select next level...'
                    isDisabled={nextLevelOptions.length === 0}
                    className='basic-single'
                    classNamePrefix='select'
                  />
                  {nextLevelOptions.length === 0 && (
                    <small className='text-danger'>
                      No next level available for these students
                    </small>
                  )}
                  <small className='text-muted d-block mt-2'>
                    This will progress students to the next level according to
                    the defined progression
                  </small>
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
          disabled={isProgressDisabled}
        >
          {userRoleFromStorage === USER_TYPES.RECEPTIONIST
            ? 'Transfer request'
            : 'Transfer Students'}
        </LoadingButton>
      </ModalFooter>
    </Modal>
  );
};

export default StudentTransferForm;
