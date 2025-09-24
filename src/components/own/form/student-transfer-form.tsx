import React, { useEffect, useMemo, useState, useCallback } from 'react';
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
  updateTransferData,
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
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearchTerm, setCourseSearchTerm] = useState('');
  const [hasMoreCourses, setHasMoreCourses] = useState(true);

  const limit = 10;

  const { data: coursesData, isLoading: isLoadingCourses } = useSWR(
    [`/course/get-active`, coursePage, limit, courseSearchTerm],
    () => getActiveCourses(coursePage, limit, courseSearchTerm),
    { revalidateOnFocus: false }
  );

  const currentCourseId = useMemo(() => {
    const ids = students.flatMap((student) => {
      if (
        student.course &&
        Array.isArray(student.course) &&
        student.course.length > 0
      ) {
        return student.course.map((c: any) => c.id ?? c.course_id);
      }
      if (student.course && student.course.id) {
        return [student.course.id];
      }
      if (
        student.coursesStudent &&
        Array.isArray(student.coursesStudent) &&
        student.coursesStudent.length > 0
      ) {
        return student.coursesStudent.map((cs: any) => cs.course_id);
      }
      return [];
    });
    return ids.length > 0 ? ids[0] : null;
  }, [students]);

  useEffect(() => {
    if (coursesData?.data) {
      const opts = coursesData.data
        .filter((course: any) => course.syllabus?.level) 
        .map(
          (course: any) =>
            ({
              value: course.id,
              label: `${course.course_number} - ${course.course_name} - ${course.syllabus.level.full_level}`,
              levelId: course.syllabus.level.id,
              levelLabel: course.syllabus.level.full_level,
            }) as any
        );

      if (coursePage === 1) {
        setCourseOptions(opts as Option[]);
      } else {
        setCourseOptions((prevOpts) => {
          const existingValues = new Set(prevOpts.map((opt) => opt.value));
          const filteredNewOpts = opts.filter(
            (opt: any) => !existingValues.has(opt.value)
          );
          return [...prevOpts, ...filteredNewOpts];
        });
      }
      setHasMoreCourses(opts.length === limit);

      if (initialTransferData?.selected_course) {
        const foundCourse = opts.find(
          (o: any) => o.value === initialTransferData.selected_course!.value
        );
        const courseOpt = foundCourse || initialTransferData.selected_course!;
        setSelectedCourse(courseOpt as Option);

        const lvl = initialTransferData.selected_level
          ? initialTransferData.selected_level
          : {
              label: (foundCourse as any)?.levelLabel,
              value: (foundCourse as any)?.levelId,
            };
        setSelectedLevel(lvl as Option);
      }
    }
  }, [coursesData, initialTransferData, coursePage, limit]);

  const userRole = getUserRoleFromLocalStorage();

  const handleCourseChange = (opt: any) => {
    setSelectedCourse(opt);
    if (opt) {
      setSelectedLevel({ value: opt.levelId, label: opt.levelLabel });
    } else {
      setSelectedLevel(null);
    }
  };

  const handleCourseScrollToBottom = useCallback(() => {
    if (hasMoreCourses && !isLoadingCourses) {
      setCoursePage((prevPage) => prevPage + 1);
    }
  }, [hasMoreCourses, isLoadingCourses]);

  const handleCourseInputChange = (inputValue: string) => {
    setCourseSearchTerm(inputValue);
    setCoursePage(1);
    setHasMoreCourses(true);
  };

  const handleSubmit = async () => {
    if (!selectedCourse && !isViewOnly) {
      toast.error('Please select a destination course.');
      return;
    }

    setIsLoading(true);
    const studentIds = students.map((student) => student.id);
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

        await updateTransferData(id, {
          selected_course_id: selectedCourse!.value,
          selected_level_id: selectedLevel!.value,
        });

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
      <p className="form-control-static bg-light p-2 rounded text-dark">
        {value || 'None'}
      </p>
    </FormGroup>
  );

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {isViewOnly ? 'View Transfer' : 'Transfer Students'}
      </ModalHeader>
      <ModalBody>
        <Form>
          <Row>
            <Col md="12">
              <h5>Students ({students.length})</h5>
              <ul
                className="list-group mb-4"
                style={{ maxHeight: '150px', overflowY: 'auto' }}
              >
                {students.map((student) => (
                  <li
                    key={student.id}
                    className="list-group-item d-flex justify-content-between align-items-center"
                  >
                    <div>
                      <strong>
                        {`${student.user?.name || student.name || 'N/A'}`.toUpperCase()}
                      </strong>
                      <div className="text-muted small">
                        Current Level:{' '}
                        {`${student.level?.name || student.level || 'None'}`.toUpperCase()} |{' '}
                        Current Course:{' '}
                        {`${student.course?.[0]?.course_number || 'None'}`.toUpperCase()}
                      </div>
                    </div>
                    <span
                      className={`badge bg-${student.status === 'active' ? 'success' : 'danger'}`}
                    >
                      {`${student.status}`.toUpperCase()}
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
                <Col md="12">
                  <FormGroup>
                    <Label for="course">Destination Course</Label>
                    <Select
                      id="course"
                      options={courseOptions}
                      value={selectedCourse}
                      onChange={handleCourseChange}
                      placeholder="Search or select a course..."
                      isClearable
                      isSearchable
                      isOptionDisabled={() => false}
                      onMenuScrollToBottom={handleCourseScrollToBottom}
                      onInputChange={handleCourseInputChange}
                      isLoading={isLoadingCourses}
                      filterOption={null}
                    />
                    {!selectedCourse && (
                      <small className="text-danger">Required</small>
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
          <Button color="secondary" onClick={toggle}>
            Close
          </Button>
        ) : (
          <>
            <Button color="secondary" onClick={toggle}>
              Cancel
            </Button>
            <LoadingButton
              color="primary"
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
