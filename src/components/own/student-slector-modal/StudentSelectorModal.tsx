import React, { useState, useEffect } from 'react';
import {
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Row,
  Col,
  Button,
  FormGroup,
  Label,
  Input,
  Spinner,
  Alert,
} from 'reactstrap';
import useSWR, { mutate } from 'swr';
import InfiniteScroll from 'react-infinite-scroll-component';
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from 'react-beautiful-dnd';
import { getAllStudent } from 'helper/api-data/student';
import { getActiveCourses } from 'helper/api-data/course';
import { getAllLevels } from 'helper/api-data/level';
import StudentFilters from './student-filters';
import {
  FiUser,
  FiUsers,
  FiChevronRight,
  FiChevronLeft,
  FiInfo,
  FiAlertTriangle,
  FiSearch,
  FiArrowRight,
  FiAlertCircle,
} from 'react-icons/fi';
import { getSimpleFiltersString } from 'utils/utils';
import Swal from 'sweetalert2';
import { GROUP_MINIMUM } from 'utils/constants';

export interface StudentOption {
  id: number;
  user: { name: string };
  level?: { id: number; name: string } | null;
  course?: { course_number: string }[] | null;
  status?: string;
}

interface StudentSelectorModalProps {
  isOpen: boolean;
  toggle: () => void;
  onNext: (
    selected: StudentOption[],
    isGroup: boolean,
    description: string
  ) => void;
}

const StudentSelectorModal: React.FC<StudentSelectorModalProps> = ({
  isOpen,
  toggle,
  onNext,
}) => {
  const [isGroup, setIsGroup] = useState(false);
  const [available, setAvailable] = useState<StudentOption[]>([]);
  const [selected, setSelected] = useState<StudentOption[]>([]);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetching, setIsFetching] = useState(false);

  const [filters, setFilters] = useState({
    course: '',
    level: '',
    status: '',
    name: '',
  });
  const [filtersApplied, setFiltersApplied] = useState(filters);
  const [description, setDescription] = useState('');
  const [hoveredDroppable, setHoveredDroppable] = useState<string | null>(null);
  const [validationError, setValidationError] = useState('');
  const [forceRefresh, setForceRefresh] = useState(0);
  const limit = 10;
  const [coursePage, setCoursePage] = useState(1);
  const [levelPage, setLevelPage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [levelSearch, setLevelSearch] = useState('');
  const [courseOptions, setCourseOptions] = useState<
    { value: number; label: string }[]
  >([]);
  const [levelOptions, setLevelOptions] = useState<
    { value: number; label: string }[]
  >([]);

  useEffect(() => {
    if (isGroup && selected.length > 0 && selected.length < GROUP_MINIMUM) {
      setValidationError(
        `Group mode requires at least ${GROUP_MINIMUM} students`
      );
    } else {
      setValidationError('');
    }
  }, [isGroup, selected.length]);

  useEffect(() => {
    if (!isGroup && selected.length > 1) {
      const firstStudent = selected[0];
      setSelected([firstStudent]);
    }
  }, [isGroup]);

  const { data: courseData } = useSWR(
    ['modal-courses', coursePage, courseSearch],
    () => getActiveCourses(coursePage, limit, courseSearch)
  );
  useEffect(() => {
    if (!courseData?.data) return;
    const opts = courseData.data.map((c: any) => ({
      value: c.id,
      label: `${c.course_number} - ${c.course_name}`,
    }));
    setCourseOptions((prev) =>
      Array.from(new Map([...prev, ...opts].map((o) => [o.value, o])).values())
    );
  }, [courseData]);

  const { data: levelData } = useSWR(
    ['/level/get-all', levelPage, levelSearch],
    () => getAllLevels(levelPage, limit, levelSearch)
  );
  useEffect(() => {
    if (!levelData?.data) return;
    const list = Array.isArray(levelData.data)
      ? levelData.data
      : Array.isArray(levelData.data.result)
        ? levelData.data.result
        : [];
    const opts = list.map((l: any) => ({
      value: l.id,
      label: l.name || l.full_level || `${l.level}`,
    }));
    setLevelOptions((prev) =>
      Array.from(new Map([...prev, ...opts].map((o) => [o.value, o])).values())
    );
  }, [levelData]);

  useEffect(() => {
    if (!isOpen) {
      setAvailable([]);
      setSelected([]);
      setPage(1);
      setHasMore(true);
      setFilters({ course: '', level: '', status: '', name: '' });
      setFiltersApplied({ course: '', level: '', status: '', name: '' });
      setDescription('');
      setIsGroup(false);
      setValidationError('');
      setForceRefresh(0);
      setIsFetching(false);
    }
  }, [isOpen]);

  const buildFilterString = () => {
    return Object.entries(filtersApplied)
      .filter(([, v]) => v)
      .map(([k, v]) => {
        const paramKey = k === 'level' ? 'level_id' : k;
        return `${paramKey}=${encodeURIComponent(v)}`;
      })
      .join('&');
  };

  const fetchStudents = async (currentPage: number) => {
    setIsFetching(true);
    try {
      const response = await getAllStudent(
        currentPage,
        limit,
        buildFilterString()
      );
      if (response?.data) {
        const list = Array.isArray(response.data)
          ? response.data
          : Array.isArray(response.data.result)
            ? response.data.result
            : [];

        const mapped = list.map((student: any) => ({
          id: student.id,
          user: student.user,
          level: student.level ?? null,
          course: student.course ?? null,
          status: student.status ?? '',
        }));

        if (currentPage === 1) {
          setAvailable(mapped);
        } else {
          setAvailable((prev) => [...prev, ...mapped]);
        }

        setHasMore(list.length >= limit);
      } else {
        if (currentPage === 1) {
          setAvailable([]);
        }
        setHasMore(false);
      }
    } catch (error) {
      console.error('Error fetching students:', error);
      if (currentPage === 1) {
        setAvailable([]);
      }
      setHasMore(false);
    } finally {
      setIsFetching(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStudents(page);
    }
  }, [isOpen, page, forceRefresh]);

  const { data, error, isValidating } = useSWR(
    isOpen
      ? ['/student/get-all', page, limit, buildFilterString(), forceRefresh]
      : null,
    () => getAllStudent(page, limit, buildFilterString()),
    {
      revalidateOnFocus: false,
      dedupingInterval: 0,
      refreshWhenHidden: false,
      revalidateIfStale: false,
      shouldRetryOnError: false,
      onSuccess: (data) => {
        if (data?.data) {
          const list = Array.isArray(data.data)
            ? data.data
            : Array.isArray(data.data.result)
              ? data.data.result
              : [];

          const mapped = list.map((student: any) => ({
            id: student.id,
            user: student.user,
            level: student.level ?? null,
            course: student.course ?? null,
            status: student.status ?? '',
          }));

          if (page === 1) {
            setAvailable(mapped);
          } else {
            setAvailable((prev) => [...prev, ...mapped]);
          }

          setHasMore(list.length >= limit);
        } else {
          if (page === 1) {
            setAvailable([]);
          }
          setHasMore(false);
        }
        setIsFetching(false);
      },
    }
  );

  const loadMore = () => {
    if (!isFetching && hasMore) {
      setPage((p) => p + 1);
    }
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;
    setHoveredDroppable(null);

    const sourceList =
      source.droppableId === 'available' ? available : selected;
    const destList =
      destination.droppableId === 'available' ? available : selected;

    if (
      destination.droppableId === 'selected' &&
      source.droppableId === 'available'
    ) {
      const moved = available[source.index];
      if (isGroup && selected.length > 0) {
        const firstLevelId = selected[0].level?.id;
        if (moved.level?.id !== firstLevelId) {
          Swal.fire({
            icon: 'error',
            title: 'Error',
            text: 'You can only select students from the same level.',
          });
          return;
        }
      }
      setValidationError('');
    }
    if (source.droppableId === destination.droppableId) {
      const items = Array.from(sourceList);
      const [moved] = items.splice(source.index, 1);
      items.splice(destination.index, 0, moved);
      source.droppableId === 'available'
        ? setAvailable(items)
        : setSelected(items);
    } else {
      if (destination.droppableId === 'selected') {
        const sourceItems = Array.from(sourceList);
        const [moved] = sourceItems.splice(source.index, 1);

        if (!isGroup) {
          setAvailable([...selected, ...sourceItems]);
          setSelected([moved]);
        } else {
          const destItems = Array.from(destList);
          destItems.splice(destination.index, 0, moved);
          setAvailable(sourceItems);
          setSelected(destItems);
        }
      } else {
        const sourceItems = Array.from(sourceList);
        const [moved] = sourceItems.splice(source.index, 1);
        const destItems = Array.from(destList);
        destItems.unshift(moved);
        setSelected(sourceItems);
        setAvailable(destItems);
      }
    }
  };

  const handleNext = () => {
    if (isGroup && selected.length < GROUP_MINIMUM) {
      setValidationError(
        `Group mode requires at least ${GROUP_MINIMUM} students`
      );
      return;
    }

    onNext(selected, isGroup, description);
  };

  const handleAddStudent = (student: StudentOption) => {
    if (
      isGroup &&
      selected.length > 0 &&
      student.level?.id !== selected[0].level?.id
    ) {
      setValidationError(
        'Group mode: you can only select students from the same level.'
      );
      return;
    }

    setValidationError('');

    setAvailable((previousAvailableList) =>
      previousAvailableList.filter(
        (availableStudent) => availableStudent.id !== student.id
      )
    );

    if (isGroup) {
      setSelected((previousSelectedList) => [...previousSelectedList, student]);
    } else {
      setSelected((previousSelectedList) => {
        if (previousSelectedList.length > 0) {
          const previouslySelectedStudent = previousSelectedList[0];
          setAvailable((innerAvailableList) => [
            previouslySelectedStudent,
            ...innerAvailableList,
          ]);
        }
        return [student];
      });
    }
  };

  const handleRemoveStudent = (student: StudentOption) => {
    setSelected((prev) => prev.filter((student) => student.id !== student.id));
    setAvailable((prev) => [...prev, student]);
  };

  const handleFilterApply = () => {
    setFiltersApplied({ ...filters });
    setAvailable([]);
    setPage(1);
    setHasMore(true);
    setIsFetching(true);
    setForceRefresh((prev) => prev + 1);
  };

  const handleFilterClear = () => {
    setCourseSearch('');
    setLevelSearch('');
    const emptyFilters = {
      course: '',
      level: '',
      status: '',
      name: '',
    };
    setFilters(emptyFilters);
    setFiltersApplied(emptyFilters);
    setAvailable([]);
    setPage(1);
    setHasMore(true);
    setIsFetching(true);
    setForceRefresh((prev) => prev + 1);
  };

  const getListStyle = (isDraggingOver: boolean, listId: string) => ({
    background:
      isDraggingOver || hoveredDroppable === listId ? '#e9f5fe' : '#f8f9fa',
    padding: 12,
    minHeight: 400,
    maxHeight: 400,
    height: '100%',
    border:
      isDraggingOver || hoveredDroppable === listId
        ? '2px dashed #3a86ff'
        : '2px dashed #cfd4da',
    borderRadius: 8,
    transition: 'all 0.2s ease',
    position: 'relative' as const,
    overflow: 'auto' as const,
  });

  const getItemStyle = (isDragging: boolean) => ({
    background: isDragging ? '#f0f7ff' : 'white',
    padding: '10px 15px',
    margin: '0 0 8px 0',
    borderRadius: 6,
    boxShadow: isDragging
      ? '0 5px 10px rgba(0, 0, 0, 0.1)'
      : '0 1px 3px rgba(0, 0, 0, 0.08)',
    border: '1px solid',
    borderColor: isDragging ? '#3a86ff' : '#e6e8eb',
    transition: 'all 0.2s ease',
    display: 'flex' as const,
    alignItems: 'center' as const,
    justifyContent: 'space-between' as const,
  });

  const isLoading = isValidating || isFetching;

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='xl'
      centered
    >
      <ModalHeader toggle={toggle}>
        <div className='d-flex align-items-center'>
          <FiUsers
            className='me-2'
            size={20}
          />
          Student Selection
        </div>
      </ModalHeader>
      <ModalBody className='pt-4'>
        <FormGroup>
          <Label className='mb-1 fw-bold d-flex align-items-center'>
            <FiInfo className='me-1' />
            Description:
          </Label>
          <Input
            type='textarea'
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder='Enter a description for the transfer'
          />
        </FormGroup>

        <FormGroup
          tag='fieldset'
          className='mb-4'
        >
          <Label className='mb-2 fw-bold d-flex align-items-center'>
            <FiUsers className='me-1' />
            Mode:
          </Label>
          <div className='d-flex'>
            <FormGroup
              check
              className='me-4'
            >
              <Label
                check
                className='d-flex align-items-center'
              >
                <Input
                  type='radio'
                  checked={!isGroup}
                  onChange={() => setIsGroup(false)}
                  className='me-2'
                />{' '}
                <FiUser className='me-1' /> Individual
              </Label>
            </FormGroup>
            <FormGroup check>
              <Label
                check
                className='d-flex align-items-center'
              >
                <Input
                  type='radio'
                  checked={isGroup}
                  onChange={() => setIsGroup(true)}
                  className='me-2'
                />{' '}
                <FiUsers className='me-1' /> Group
              </Label>
            </FormGroup>
          </div>
        </FormGroup>

        <div className='p-3 rounded mb-4'>
          <StudentFilters
            courseOptions={courseOptions}
            levelOptions={levelOptions}
            filters={filters}
            courseInputValue={courseSearch}
            levelInputValue={levelSearch}
            onCourseInput={setCourseSearch}
            onLevelInput={setLevelSearch}
            onCourseChange={(v) =>
              setFilters((prev) => ({ ...prev, course: v }))
            }
            onLevelChange={(v) => setFilters((prev) => ({ ...prev, level: v }))}
            onStatusChange={(v) =>
              setFilters((prev) => ({ ...prev, status: v }))
            }
            onNameChange={(v) => setFilters((prev) => ({ ...prev, name: v }))}
            loadMoreCourse={() => setCoursePage((p) => p + 1)}
            loadMoreLevel={() => setLevelPage((p) => p + 1)}
            onApply={handleFilterApply}
            onClear={handleFilterClear}
            isLoading={isLoading}
          />
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <Row className='mb-4 d-flex justify-content-center'>
            <Col
              md='5'
              className='mx-4'
            >
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <h6 className='fw-bold d-flex align-items-center mb-0'>
                  <FiUser className='me-2' />
                  Available Students
                </h6>
                <span className='badge bg-primary rounded-pill'>
                  {available.length}
                </span>
              </div>
              <Droppable droppableId='available'>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={getListStyle(snapshot.isDraggingOver, 'available')}
                    onMouseEnter={() => setHoveredDroppable('available')}
                    onMouseLeave={() => setHoveredDroppable(null)}
                    className='student-droppable'
                    id='scrollableDiv'
                  >
                    {hoveredDroppable === 'available' &&
                      !snapshot.isDraggingOver && (
                        <div className='drop-hint'>
                          <div className='text-center text-muted p-2'>
                            <FiArrowRight size={20} />
                            <p className='mb-0 mt-1'>Drop students here</p>
                          </div>
                        </div>
                      )}

                    {isLoading && available.length === 0 && (
                      <div className='text-center my-5 p-4'>
                        <Spinner
                          size='lg'
                          color='secondary'
                        />
                        <p className='mt-3 mb-0'>Loading students...</p>
                      </div>
                    )}

                    <InfiniteScroll
                      dataLength={available.length}
                      next={loadMore}
                      hasMore={hasMore && !isLoading}
                      loader={
                        <div className='text-center my-3'>
                          <Spinner
                            size='sm'
                            color='primary'
                          />
                        </div>
                      }
                      scrollableTarget='scrollableDiv'
                    >
                      {available.length === 0 && !hasMore && !isLoading && (
                        <div className='text-center text-muted p-4'>
                          <FiAlertTriangle
                            size={20}
                            className='mb-2'
                          />
                          <p className='mb-0'>No students available</p>
                        </div>
                      )}
                      {available.map((student, idx) => (
                        <Draggable
                          key={student.id}
                          draggableId={`avail-${student.id}`}
                          index={idx}
                        >
                          {(prov, snapshot) => (
                            <div
                              ref={prov.innerRef}
                              {...prov.draggableProps}
                              {...prov.dragHandleProps}
                              style={{
                                ...getItemStyle(snapshot.isDragging),
                                ...prov.draggableProps.style,
                              }}
                              className='student-item'
                            >
                              <div className='d-flex align-items-center'>
                                <FiUser className='me-2 text-secondary' />
                                <span>{student.user.name}</span>
                              </div>
                              <div
                                className='px-1'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleAddStudent(student);
                                }}
                              >
                                <FiChevronRight
                                  className='text-muted drag-icon'
                                  style={{ cursor: 'pointer' }}
                                />
                              </div>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                    </InfiniteScroll>
                  </div>
                )}
              </Droppable>
            </Col>

            <Col
              md='5'
              className='mx-4'
            >
              <div className='d-flex justify-content-between align-items-center mb-2'>
                <h6 className='fw-bold d-flex align-items-center mb-0'>
                  <FiUsers className='me-2' />
                  Selected Students
                </h6>
                <div>
                  <span
                    className={`badge ${isGroup && selected.length < GROUP_MINIMUM && selected.length > 0 ? 'bg-warning' : 'bg-success'} rounded-pill`}
                  >
                    {selected.length}
                    {isGroup && ` / ${GROUP_MINIMUM}+`}
                  </span>
                </div>
              </div>
              <Droppable droppableId='selected'>
                {(provided, snapshot) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    style={getListStyle(snapshot.isDraggingOver, 'selected')}
                    onMouseEnter={() => setHoveredDroppable('selected')}
                    onMouseLeave={() => setHoveredDroppable(null)}
                    className='student-droppable'
                  >
                    {hoveredDroppable === 'selected' &&
                      !snapshot.isDraggingOver && (
                        <div className='drop-hint'>
                          <div className='text-center text-muted p-2'>
                            <FiArrowRight size={20} />
                            <p className='mb-0 mt-1'>
                              {!isGroup
                                ? 'Drop one student here'
                                : 'Drop students here'}
                            </p>
                          </div>
                        </div>
                      )}

                    {selected.length === 0 && (
                      <div className='text-center text-muted p-4'>
                        <FiUsers
                          size={20}
                          className='mb-2'
                        />
                        <p className='mb-0'>No students selected</p>
                        {isGroup && (
                          <p className='small text-muted'>
                            Group mode requires at least {GROUP_MINIMUM}{' '}
                            students
                          </p>
                        )}
                      </div>
                    )}
                    {selected.map((student, idx) => (
                      <Draggable
                        key={student.id}
                        draggableId={`sel-${student.id}`}
                        index={idx}
                      >
                        {(prov, snapshot) => (
                          <div
                            ref={prov.innerRef}
                            {...prov.draggableProps}
                            {...prov.dragHandleProps}
                            style={{
                              ...getItemStyle(snapshot.isDragging),
                              ...prov.draggableProps.style,
                              borderColor: snapshot.isDragging
                                ? '#28a745'
                                : '#e6e8eb',
                              borderLeftColor: '#28a745',
                              borderLeftWidth: 4,
                            }}
                            className='student-item'
                          >
                            <div className='d-flex align-items-center'>
                              <FiUser className='me-2 text-success' />
                              <span>{student.user.name}</span>
                            </div>
                            <div
                              className='px-1'
                              onClick={(e) => {
                                e.stopPropagation();
                                handleRemoveStudent(student);
                              }}
                            >
                              <FiChevronLeft
                                className='text-muted drag-icon'
                                style={{ cursor: 'pointer' }}
                              />
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
              {isGroup && selected.length < GROUP_MINIMUM && (
                <div className='text-danger d-flex align-items-center mb-3 mt-2'>
                  <FiAlertCircle className='me-2' />
                  <span>
                    Group mode: You can select multiple students. Minimum{' '}
                    {GROUP_MINIMUM} students required.
                  </span>
                </div>
              )}

              {!isGroup && selected.length === 0 && (
                <div className='text-danger d-flex align-items-center mb-3 mt-2'>
                  <FiAlertCircle className='me-2' />
                  <span>
                    Individual mode: Only one student can be selected at a time.
                  </span>
                </div>
              )}

              {validationError && (
                <div className='text-danger d-flex align-items-center mb-3'>
                  <FiAlertTriangle className='me-2' />
                  <span>{validationError}</span>
                </div>
              )}
            </Col>
          </Row>
        </DragDropContext>
      </ModalBody>

      <ModalFooter className='bg-light'>
        <Button
          color='secondary'
          onClick={toggle}
          className='d-flex align-items-center'
        >
          Cancel
        </Button>
        <Button
          color='primary'
          onClick={handleNext}
          disabled={
            selected.length === 0 ||
            (isGroup && selected.length < GROUP_MINIMUM)
          }
          className='d-flex align-items-center'
        >
          Next <FiArrowRight className='ms-1' />
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default StudentSelectorModal;
