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
  createTransferData,
  approveTransfer,
} from 'helper/api-data/transfer-data';
import { USER_TYPES } from 'utils/constants';
import { getUserRoleFromLocalStorage } from 'utils/auth';
import { decrypt } from 'utils/encryption';

interface Option {
  label: string;
  value: number;
}

interface Props {
  isOpen: boolean;
  toggle: () => void;
  students: any[];
  isGroupTransfer?: boolean;
  description?: string;
  initialTransferData?: {
    id?: number;
    description?: string;
    selected_course?: Option;
    selected_level?: Option;
  };
  isViewOnly?: boolean;
  onSuccess?: (id: string) => void;
}

const StudentTransferForm: React.FC<Props> = ({
  isOpen,
  toggle,
  students,
  isGroupTransfer = false,
  description,
  initialTransferData,
  isViewOnly = false,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [courseOptions, setCourseOptions] = useState<Option[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Option | null>(null);
  const [selectedLevel, setSelectedLevel] = useState<Option | null>(null);

  const limit = 10;
  const { data: coursesData } = useSWR(['/course/get-active', limit], () =>
    getActiveCourses(1, limit)
  );

  const currentCourseIds = useMemo(() => {
    // Extraer todos los IDs de cursos de los estudiantes
    const ids = students.flatMap((s) => {
      // Verificar si el estudiante tiene cursos asignados en formato array
      if (s.course && Array.isArray(s.course) && s.course.length > 0) {
        return s.course.map((course: any) => course.id || course.course_id);
      }
      // Si el estudiante tiene un solo curso no en array
      if (s.course && s.course.id) {
        return [s.course.id];
      }

      if (
        s.coursesStudent &&
        Array.isArray(s.coursesStudent) &&
        s.coursesStudent.length > 0
      ) {
        return s.coursesStudent.map((cs: any) => cs.course_id);
      }
      return [];
    });
    console.log('Current course IDs:', ids);
    return ids;
  }, [students]);

  useEffect(() => {
    if (coursesData?.data) {
      const opts = coursesData.data.map(
        (course: any) =>
          ({
            value: course.id,
            label: `${course.course_number} - ${course.course_name} - ${course.syllabus.level.full_level}`,
            levelId: course.syllabus.level.id,
            levelLabel: course.syllabus.level.full_level,
          }) as any
      );
      setCourseOptions(opts as Option[]);

      // initial selections
      if (initialTransferData?.selected_course) {
        const foundCourse = opts.find(
          (o: any) => o.value === initialTransferData.selected_course!.value
        );
        const courseOpt = foundCourse || initialTransferData.selected_course!;
        setSelectedCourse(courseOpt as Option);
        // set level from initial or from found
        const lvl = initialTransferData.selected_level
          ? initialTransferData.selected_level
          : {
              label: (foundCourse as any)?.levelLabel,
              value: (foundCourse as any)?.levelId,
            };
        setSelectedLevel(lvl as Option);
      } else {
        setSelectedCourse(null);
        setSelectedLevel(null);
      }
    }
  }, [coursesData, initialTransferData]);

  const userRole = getUserRoleFromLocalStorage();

  const handleCourseChange = (opt: any) => {
    setSelectedCourse(opt);
    if (opt) {
      setSelectedLevel({ value: opt.levelId, label: opt.levelLabel });
    } else {
      setSelectedLevel(null);
    }
  };

  const handleSubmit = async () => {
    if (!selectedCourse && !isViewOnly) {
      toast.error('Please select a destination course.');
      return;
    }

    setIsLoading(true);
    const studentIds = students.map((s) => s.id);
    const encrypted = Cookies.get('user_id') || localStorage.getItem('user_id');
    const createdBy = encrypted ? Number(decrypt(encrypted)) : 0;

    try {
      let response;
      if (userRole === USER_TYPES.RECEPTIONIST) {
        response = await createTransferData({
          selected_course_id: selectedCourse?.value || null,
          selected_level_id: selectedLevel?.value || null,
          status_level_change: 'pending',
          description: description || initialTransferData?.description || '',
          is_group: isGroupTransfer,
          created_by_id: createdBy,
          student_ids: studentIds,
        });
      } else {
        const id = initialTransferData?.id;
        if (!id) {
          toast.error('Transfer ID is required to approve.');
          return;
        }
        response = await approveTransfer(id);
      }

      if ([200, 201].includes(response.statusCode)) {
        toast.success(response.message || 'Operation successful.');
        onSuccess && onSuccess(response.data?.id?.toString());
        toggle();
      } else {
        toast.error(response.message || 'Error processing request.');
      }
    } catch (error: any) {
      toast.error(error.message || 'Unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderReadOnly = (label: string, value?: string) => (
    <FormGroup>
      <Label>{label}</Label>
      <p className='form-control-static bg-light p-2 rounded text-dark'>
        {value || 'None'}
      </p>
    </FormGroup>
  );

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
      centered
    >
      <ModalHeader toggle={toggle}>
        {isViewOnly ? 'View Transfer' : 'Transfer Students'}
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
                {students.map((s) => (
                  <li
                    key={s.id}
                    className='list-group-item d-flex justify-content-between align-items-center'
                  >
                    <div>
                      <strong>{s.user?.name || s.name || 'N/A'}</strong>
                      <div className='text-muted small'>
                        Current Level: {s.level?.name || s.level || 'None'} |{' '}
                        Current Course: {s.course?.[0]?.course_number || 'None'}
                      </div>
                    </div>
                    <span
                      className={`badge bg-${s.status === 'active' ? 'success' : 'danger'}`}
                    >
                      {s.status}
                    </span>
                  </li>
                ))}
              </ul>
            </Col>

            {(initialTransferData?.description || description) &&
              renderReadOnly(
                'Description',
                description || initialTransferData?.description || ''
              )}

            {isViewOnly ? (
              <>{renderReadOnly('Destination Course', selectedCourse?.label)}</>
            ) : (
              <>
                <Col md='12'>
                  <FormGroup>
                    <Label for='course'>Destination Course</Label>
                    <Select
                      id='course'
                      options={courseOptions}
                      value={selectedCourse}
                      onChange={handleCourseChange}
                      placeholder='Search or select a course...'
                      isClearable
                      isSearchable
                      isOptionDisabled={(opt: Option) => {
                        // Verificar si el ID del curso está en la lista de cursos actuales
                        // Convertir a números para asegurar una comparación correcta
                        return currentCourseIds.some(
                          (id) => Number(id) === Number(opt.value)
                        );
                      }}
                    />
                    {!selectedCourse && (
                      <small className='text-danger'>Required</small>
                    )}
                  </FormGroup>
                </Col>
              </>
            )}
          </Row>
        </Form>
      </ModalBody>
      <ModalFooter>
        {isViewOnly ? (
          <Button
            color='secondary'
            onClick={toggle}
          >
            Close
          </Button>
        ) : (
          <>
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
            >
              {userRole === USER_TYPES.RECEPTIONIST
                ? 'Request Transfer'
                : 'Confirm Transfer'}
            </LoadingButton>
          </>
        )}
      </ModalFooter>
    </Modal>
  );
};

export default StudentTransferForm;

// no progression logic any more
