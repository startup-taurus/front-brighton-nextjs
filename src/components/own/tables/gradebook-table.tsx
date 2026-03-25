import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
  useContext,
} from 'react';
import { Button, Input, Table, Alert, Badge, Collapse } from 'reactstrap';
import { FaTrash } from 'react-icons/fa';
import {
  COMPONENTS_GRADEBOOK,
  STATUS,
  USER_TYPES,
} from '../../../../utils/constants';
import {
  buildGradebookStructure,
  calculateAverage,
  calculateClassTotalAverage,
  calculateTotalAverage,
  formatGradebookComponents,
  calculateFinalGradingStatus,
} from '../../../../utils/utils';
import { debounce, throttle } from 'lodash';
import { useRouter } from 'next/router';
import { updateStudentGrade } from '../../../../helper/api-data/student-grades';
import { ComponentsGradebook } from '../../../../Types/GradingItem';
import { FaPlus } from 'react-icons/fa6';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';
import { upsertCourseAssignmentItem, deleteCourseAssignmentItem } from '../../../../helper/api-data/course';
import { mutate } from 'swr';
import Swal from 'sweetalert2';
import { deleteRegisteredStudent } from '../../../../helper/api-data/registered-student';
import { toast } from 'react-toastify';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

const GradebookTable = ({
  students,
  gradingItems,
  studentsGrades,
  gradingPercentages,
  syllabusId,
  notesPercentages,
  courseStatus,
}: any) => {
  const router = useRouter();
  const courseId = router.query.id as string;
  const { user } = useContext(UserContext);
  const { canPermission } = usePermission();
  const canAddGrades = canPermission(PERMISSIONS.ADD_GRADES);
  const canEditGrades = canPermission(PERMISSIONS.EDIT_GRADES);

  const isTransferredCourse =
    typeof courseStatus === 'string' &&
    courseStatus.toLowerCase() === STATUS.TRANSFERRED;

  const [grades, setGrades] = useState<any>({});
  const [showInactive, setShowInactive] = useState(false);
  const [componentsGradebook, setComponentsGradebook] =
    useState<ComponentsGradebook>({
      assignments: [],
      progressTest: [],
      moversExam: [],
    });

  const isInputDisabled = (student: any) => {
    return (
      !canEditGrades ||
      student?.is_retired ||
      student?.status === STATUS.INACTIVE
    );
  };

  const gradingGrade = useMemo(
    () => buildGradebookStructure(gradingItems, students, studentsGrades),
    [gradingItems, students, studentsGrades]
  );

  useEffect(() => {
    const components = formatGradebookComponents(gradingItems);
    setComponentsGradebook(components);
  }, [gradingItems]);

  useEffect(() => {
    setGrades(gradingGrade);
  }, [gradingGrade]);

  const getGradeDisplayValue = (gradingItemId: any, studentId: any) => {
    const value = grades?.[gradingItemId]?.[studentId];

    if (value === null || value === undefined || value === '') {
      return '';
    }

    const numericValue = Number(value);

    if (Number.isNaN(numericValue)) {
      return '';
    }

    const [integerPart, decimalPart] = numericValue.toFixed(2).split('.');
    return `${integerPart.padStart(3, '0')}.${decimalPart}`;
  };

  const onChangeGrades = async (
    event: any,
    gradingItemId: any,
    studentId: any,
    isRetired: boolean
  ) => {
    if (isRetired) {
      return;
    }

    const newRawDigits = event.target.value.replace(/\D/g, '');

    if (!newRawDigits) {
      setGrades((grades: any) => ({
        ...grades,
        [gradingItemId]: {
          ...grades[gradingItemId],
          [studentId]: '',
        },
      }));
      onSaveGrade({
        course_id: courseId,
        student_id: studentId,
        grading_item_id: gradingItemId,
        grade: null,
      });
      return;
    }

    const last5digits = newRawDigits.slice(-5);
    const paddedDigits = last5digits.padStart(5, '0');
    let finalGrade = paddedDigits.slice(0, -2) + '.' + paddedDigits.slice(-2);
    let numericGrade = Number(finalGrade);

    if (numericGrade > 100) {
      numericGrade = 100;
      finalGrade = '100.00';
    }

    setGrades((grades: any) => ({
      ...grades,
      [gradingItemId]: {
        ...grades[gradingItemId],
        [studentId]: finalGrade,
      },
    }));

    onSaveGrade({
      course_id: courseId,
      student_id: studentId,
      grading_item_id: gradingItemId,
      grade: numericGrade,
    });
  };

  const handleBackSpace = async (
    event: any,
    gradingItemId: any,
    studentId: any
  ) => {
    if (event.key === 'Delete') {
      event.preventDefault();
      setGrades((grades: any) => ({
        ...grades,
        [gradingItemId]: {
          ...grades[gradingItemId],
          [studentId]: '',
        },
      }));

      onSaveGrade({
        course_id: courseId,
        student_id: studentId,
        grading_item_id: gradingItemId,
        grade: null,
      });
      return;
    }

    if (event.key === 'Backspace') {
      event.preventDefault();
      const currentValue = grades?.[gradingItemId]?.[studentId];
      const currentNumeric = Number(currentValue);

      if (currentValue !== '' && !Number.isNaN(currentNumeric) && currentNumeric === 0) {
        setGrades((grades: any) => ({
          ...grades,
          [gradingItemId]: {
            ...grades[gradingItemId],
            [studentId]: '',
          },
        }));

        onSaveGrade({
          course_id: courseId,
          student_id: studentId,
          grading_item_id: gradingItemId,
          grade: null,
        });
        return;
      }

      let rawGrade = String(grades?.[gradingItemId]?.[studentId] ?? '').replace(
        /\D/g,
        ''
      );

      if (!rawGrade.length) {
        return;
      }

      rawGrade = rawGrade.slice(0, -1);

      if (!rawGrade.length) {
        setGrades((grades: any) => ({
          ...grades,
          [gradingItemId]: {
            ...grades[gradingItemId],
            [studentId]: '',
          },
        }));

        onSaveGrade({
          course_id: courseId,
          student_id: studentId,
          grading_item_id: gradingItemId,
          grade: null,
        });
        return;
      }

      const padded = rawGrade.padStart(5, '0');
      let finalGrade = padded.slice(0, -2) + '.' + padded.slice(-2);
      let numeric = Number(finalGrade);

      if (numeric > 100) {
        numeric = 100;
        finalGrade = '100.00';
      }

      setGrades((grades: any) => ({
        ...grades,
        [gradingItemId]: {
          ...grades[gradingItemId],
          [studentId]: finalGrade,
        },
      }));

      onSaveGrade({
        course_id: courseId,
        student_id: studentId,
        grading_item_id: gradingItemId,
        grade: numeric,
      });
    }
  };

  const onSaveGrade = useMemo(
    () =>
      throttle(async (data: any) => {
        await updateStudentGrade(data);
      }, 250, { leading: true, trailing: true }),
    []
  );

  const addAssignmentCol = () => {
    Swal.fire({
      title: 'Are you sure you want to add a new assignment?',
      text: 'This action cannot be reversed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, add!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        const assignmentNumber = componentsGradebook?.assignments.length + 1;
        const assignmentName = `Assignment ${assignmentNumber}`;
        upsertCourseAssignmentItem(courseId, { name: assignmentName }).then(() => {
          mutate(`/course/get-grading-items/${courseId}`);
        });
      }
    });
  };

  const onChangeAssignmentCol = (e: ChangeEvent, id: any, index: number) => {
    const value = (e.target as HTMLInputElement).value;
    let assignments = componentsGradebook.assignments;
    assignments[index].item_name = value;

    setComponentsGradebook({
      ...componentsGradebook,
      assignments,
    });
    renameAssignmentDebounced(courseId, id, value);
  };

  const renameAssignmentDebounced = useCallback(
    debounce(async (cid: string, itemId: any, name: string) => {
      await upsertCourseAssignmentItem(cid, { itemId, name });
      mutate(`/course/get-grading-items/${cid}`);
    }, 600),
    []
  );

  const renderAverageCols = ({
    grades,
    componentsGradebook,
    student,
    gradingPercentages,
  }: any) => {
    const totalAverage = calculateTotalAverage(
      grades,
      componentsGradebook,
      student.id,
      gradingPercentages
    );

    const result = calculateFinalGradingStatus(notesPercentages, totalAverage);
    const resultClass = result?.split(' ')[0].toLowerCase();
    return (
      <>
        <td className='highlighted-col'>{totalAverage}%</td>
        <td
          className={`text-nowrap ${resultClass ? `result-${resultClass}` : 'gray-col'}`}
        >
          {result}
        </td>
      </>
    );
  };

  const active = useMemo(
    () =>
      isTransferredCourse
        ? students.filter(
            (student: any) => student.status !== STATUS.INACTIVE
          )
        : students.filter(
            (student: any) =>
              !student.is_retired && student.status !== STATUS.INACTIVE
          ),
    [students, isTransferredCourse]
  );

  const inactive = useMemo(
    () =>
      isTransferredCourse
        ? students.filter(
            (student: any) => student.status === STATUS.INACTIVE
          )
        : students.filter(
            (student: any) =>
              student.is_retired || student.status === STATUS.INACTIVE
          ),
    [students, isTransferredCourse]
  );

  const toggleInactive = () => setShowInactive((p) => !p);

  return (
    <>
      <div className='small text-muted mb-2'>
        Empty = pending (not averaged), 0 = recorded grade.
      </div>
      <Table
        responsive
        bordered
        className='report-table '
      >
        <tbody>
          <tr className='py-2 border-none'>
            <td className='border-none'></td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.assignments.length}
            >
              <div className='d-flex justify-content-between gap-2 '>
                {COMPONENTS_GRADEBOOK.ASSIGNMENTS}
                <span className='ms-2 small text-muted'>
                  {componentsGradebook?.assignments?.some((a: any) => a.origin === 'course') ? '' : ''}
                </span>
                <Button
                  className='add-col-btn'
                  onClick={(e) => addAssignmentCol()}
                  disabled={!canAddGrades}
                >
                  <FaPlus />
                </Button>
              </div>
            </td>
            <td className='border-none'></td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.progressTest.length}
            >
              {COMPONENTS_GRADEBOOK.PROGRESS_TESTS}
            </td>
            <td className='border-none'></td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.moversExam.length}
            >
              {COMPONENTS_GRADEBOOK.MOVERS_EXAM}
            </td>
          </tr>
          <tr className='py-2 border-none'>
            <td className='border-none'></td>
            {componentsGradebook?.assignments?.map(
              (item: any, index: number) => (
                <td
                  className={`col-vertical border-bottom text-center text-dark ${ !canEditGrades ? 'cursor-no-allowed' : ''}`}
                  key={`assignments-title-${item.item_id}`}
                >
                  <Input
                    type='text'
                    className='assignments-input bg-white text-black'
                    onChange={(e) =>
                      onChangeAssignmentCol(e, item.item_id, index)
                    }
                    value={item.item_name ?? ''}
                    disabled={!canEditGrades || item.origin === 'syllabus'}
                  />
                </td>
              )
            )}
            <td className='border-none'></td>
            {componentsGradebook?.progressTest?.map((item: any) => (
              <td
                className='col-vertical border-bottom text-center highlighted-col'
                key={`progressTest-title-${item.item_id}`}
              >
                {item.item_name}
              </td>
            ))}
            <td className='border-none'></td>
            {componentsGradebook?.moversExam?.map((item: any) => (
              <td
                className='col-vertical border-bottom text-center highlighted-col'
                key={`moversExam-title-${item.item_id}`}
              >
                {item.item_name}
              </td>
            ))}
          </tr>
          <tr className='py-2 border-none'>
            <td className='border-none'></td>
          </tr>
          <tr>
            <td className='col-title'>STUDENT</td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.assignments?.length}
            ></td>
            <td className='col-title'>
              ASSIG. ({gradingPercentages?.assig_percentage}%)
            </td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.progressTest?.length}
            ></td>
            <td className='col-title'>
              TEST. ({gradingPercentages?.test_percentage}%)
            </td>
            <td
              className='col-title'
              colSpan={componentsGradebook?.moversExam?.length}
            ></td>
            <td className='col-title'>
              EXAM ({gradingPercentages?.exam_percentage}%)
            </td>
            <td className='col-title'>TOTAL</td>
            <td className='col-title'>GRADE</td>
          </tr>

          {active.length > 0 &&
            grades &&
            active.map((student: any, i: number) => (
              <tr key={`grade-student-${i}`}>
                <td className='student-col'>{student.name.toUpperCase()}</td>
                {componentsGradebook?.assignments?.map((item: any, j) => (
                  <td
                    className='td-container'
                    key={`grade-note-${j}`}
                  >
                    <Input
                      className={`td-input input-percentage bg-transparent text-black ${!canEditGrades ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
                      onChange={(event) =>
                        onChangeGrades(
                          event,
                          item.item_id,
                          student?.id,
                          student?.is_retired
                        )
                      }
                      onKeyDown={(event) =>
                        handleBackSpace(event, item.item_id, student?.id)
                      }
                      value={getGradeDisplayValue(item.item_id, student.id)}
                      disabled={isInputDisabled(student)}
                    />
                  </td>
                ))}
                <td
                  className={`text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
                >
                  {calculateAverage(
                    grades,
                    componentsGradebook?.assignments,
                    student.id
                  )}
                  %
                </td>
                {componentsGradebook?.progressTest?.map((item: any, j) => (
                  <td
                    className='td-container'
                    key={`grade-note-progressTest-${j}`}
                  >
                    <Input
                      className={`td-input input-percentage bg-transparent text-black ${!canEditGrades ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
                      onChange={(event) =>
                        onChangeGrades(
                          event,
                          item.item_id,
                          student?.id,
                          student?.is_retired
                        )
                      }
                      onKeyDown={(event) =>
                        handleBackSpace(event, item.item_id, student?.id)
                      }
                      value={getGradeDisplayValue(item.item_id, student.id)}
                      disabled={isInputDisabled(student)}
                    />
                  </td>
                ))}
                <td
                  className={`text-black ${student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
                >
                  {calculateAverage(
                    grades,
                    componentsGradebook?.progressTest,
                    student.id
                  )}
                  %
                </td>
                {componentsGradebook?.moversExam?.map((item: any, j) => (
                  <td
                    className='td-container'
                    key={`grade-note-progressTest-${j}`}
                  >
                    <Input
                      className={`td-input input-percentage bg-transparent text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
                      onChange={(event) =>
                        onChangeGrades(
                          event,
                          item.item_id,
                          student?.id,
                          student?.is_retired
                        )
                      }
                      onKeyDown={(event) =>
                        handleBackSpace(event, item.item_id, student?.id)
                      }
                      value={getGradeDisplayValue(item.item_id, student.id)}
                      disabled={isInputDisabled(student)}
                    />
                  </td>
                ))}
                <td
                  className={`text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
                >
                  {calculateAverage(
                    grades,
                    componentsGradebook?.moversExam,
                    student.id
                  )}
                  %
                </td>
                {renderAverageCols({
                  grades,
                  componentsGradebook,
                  student,
                  gradingPercentages,
                })}
              </tr>
            ))}

          {inactive.length > 0 &&(
            <tr>
              <td
                colSpan={35}
                className='py-3 bg-light cursor-pointer position-relative'
                onClick={toggleInactive}
              >
                <span className='text-dark'>
                  {showInactive ? 'Hide' : 'Show'} {isTransferredCourse ? 'inactive' : 'inactive/retired'} students ({inactive.length})
                </span>
                <span
                  className={`toggle-icon  ${!canEditGrades ? 'toggle-icon no-professor ' : ''}  `}
                >
                  {showInactive ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              </td>
            </tr>
          )}
        </tbody>
        <Collapse
          tag='tbody'
          isOpen={showInactive}
          timeout={0}
        >
          {inactive.map((student: any, i: number) => (
            <tr
              key={`grade-student-inactive-${i}`}
              className={
                student?.is_retired || student?.status === STATUS.INACTIVE
                  ? 'bg-light'
                  : ''
              }
            >
              <td
                className={`student-col ${student?.is_retired || student?.status === STATUS.INACTIVE ? 'd-flex  align-items-start align-md-center justify-center-start ' : ''}`}
              >
                {student.name.toUpperCase()}
                {(student?.is_retired ||
                  student?.status === STATUS.INACTIVE) && (
                  <Badge
                    color='primary'
                    pill
                    size='sm'
                    className='mt-2 mt-md-0 ms-md-2'
                  >
                    {student?.status === STATUS.INACTIVE
                      ? 'Inactive'
                      : isTransferredCourse
                      ? 'Transferred'
                      : 'Retired'}
                  </Badge>
                )}
              </td>
              {componentsGradebook?.assignments?.map((item: any, j) => (
                <td
                  className='td-container'
                  key={`grade-note-inactive-${j}`}
                >
                  <Input
                    className={`td-input input-percentage bg-transparent text-black ${ !canEditGrades ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
                    onChange={(event) =>
                      onChangeGrades(
                        event,
                        item.item_id,
                        student?.id,
                        student?.is_retired
                      )
                    }
                    onKeyDown={(event) =>
                      handleBackSpace(event, item.item_id, student?.id)
                    }
                    value={getGradeDisplayValue(item.item_id, student.id)}
                    disabled={isInputDisabled(student)}
                  />
                </td>
              ))}
              <td
                className={`text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
              >
                {calculateAverage(
                  grades,
                  componentsGradebook?.assignments,
                  student.id
                )}
                %
              </td>
              {componentsGradebook?.progressTest?.map((item: any, j) => (
                <td
                  className='td-container'
                  key={`grade-note-progressTest-inactive-${j}`}
                >
                  <Input
                    className={`td-input input-percentage bg-transparent text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark cursor-no-allowed'}`}
                    onChange={(event) =>
                      onChangeGrades(
                        event,
                        item.item_id,
                        student?.id,
                        student?.is_retired
                      )
                    }
                    onKeyDown={(event) =>
                      handleBackSpace(event, item.item_id, student?.id)
                    }
                    value={getGradeDisplayValue(item.item_id, student.id)}
                    disabled={isInputDisabled(student)}
                  />
                </td>
              ))}
              <td
                className={`text-black ${ student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
              >
                {calculateAverage(
                  grades,
                  componentsGradebook?.progressTest,
                  student.id
                )}
                %
              </td>
              {componentsGradebook?.moversExam?.map((item: any, j) => (
                <td
                  className='td-container'
                  key={`grade-note-progressTest-inactive-${j}`}
                >
                  <Input
                    className={`td-input input-percentage bg-transparent text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
                    onChange={(event) =>
                      onChangeGrades(
                        event,
                        item.item_id,
                        student?.id,
                        student?.is_retired
                      )
                    }
                    onKeyDown={(event) =>
                      handleBackSpace(event, item.item_id, student?.id)
                    }
                    value={getGradeDisplayValue(item.item_id, student.id)}
                    disabled={isInputDisabled(student)}
                  />
                </td>
              ))}
              <td
                className={`text-black ${!canEditGrades || student?.is_retired ? 'cursor-no-allowed' : ''} ${(student?.is_retired || student?.status === STATUS.INACTIVE) && 'text-dark'}`}
              >
                {calculateAverage(
                  grades,
                  componentsGradebook?.moversExam,
                  student.id
                )}
                %
              </td>
              {renderAverageCols({
                grades,
                componentsGradebook,
                student,
                gradingPercentages,
              })}
            </tr>
          ))}
        </Collapse>
      </Table>
      <div className='d-flex justify-content-end'>
        <div className='attendance-resume'>
          <p className='field-description'>CLASS AVG.</p>
          <p className='field-value'>
            {calculateClassTotalAverage(
              grades,
              componentsGradebook,
              gradingPercentages,
              students
            )}
            %
          </p>
        </div>
      </div>
    </>
  );
};

export default GradebookTable;
