import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Button, Input, Modal, ModalBody, ModalFooter, ModalHeader, Table } from 'reactstrap';
import { toast } from 'react-toastify';

import { updateStudentGrade } from '../../../../helper/api-data/student-grades';
import { MissingGradeItem } from '../../../../utils/emissionValidation';
import {
  buildGradebookStructure,
  calculateAverage,
  calculateFinalGradingStatus,
  calculateTotalAverage,
  formatGradebookComponents,
} from '../../../../utils/utils';

type Props = {
  isOpen: boolean;
  toggle: () => void;
  courseId: string | number;
  studentId: string | number;
  missingItems: MissingGradeItem[];
  gradingItems?: any[];
  gradesByStudent?: any[];
  gradingPercentages?: any;
  notesPercentages?: any;
  studentName?: string;
  onCompleted?: () => Promise<void> | void;
  onSubmit?: () => Promise<void> | void;
  submitLabel?: string;
};

const CompleteMissingGradesModal = ({
  isOpen,
  toggle,
  courseId,
  studentId,
  missingItems,
  gradingItems = [],
  gradesByStudent = [],
  gradingPercentages,
  notesPercentages,
  studentName,
  onCompleted,
  onSubmit,
  submitLabel = 'Save',
}: Props) => {
  const [grades, setGrades] = useState<any>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const refreshTimeoutRef = useRef<any>(null);

  const componentsGradebook = useMemo(
    () => formatGradebookComponents(gradingItems),
    [gradingItems]
  );

  const baseGrades = useMemo(
    () =>
      buildGradebookStructure(
        gradingItems,
        [{ id: studentId }],
        gradesByStudent || []
      ),
    [gradingItems, studentId, gradesByStudent]
  );

  useEffect(() => {
    if (!isOpen) return;
    setGrades(baseGrades);
  }, [isOpen, baseGrades]);

  useEffect(() => {
    return () => {
      if (refreshTimeoutRef.current) {
        clearTimeout(refreshTimeoutRef.current);
      }
    };
  }, []);

  const triggerRefresh = () => {
    if (!onCompleted) return;
    if (refreshTimeoutRef.current) {
      clearTimeout(refreshTimeoutRef.current);
    }
    refreshTimeoutRef.current = setTimeout(() => {
      onCompleted();
    }, 350);
  };

  const onSaveGrade = async (data: any) => {
    try {
      await updateStudentGrade(data);
      triggerRefresh();
    } catch {
      toast.error('Error saving grade.');
    }
  };

  const getGradeDisplayValue = (gradingItemId: number, currentStudentId: string | number) => {
    const value = grades?.[gradingItemId]?.[currentStudentId];

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

  const onChangeGrades = (event: any, gradingItemId: number, currentStudentId: string | number) => {
    const newRawDigits = event.target.value.replace(/\D/g, '');

    if (!newRawDigits) {
      setGrades((prev: any) => ({
        ...prev,
        [gradingItemId]: {
          ...prev[gradingItemId],
          [currentStudentId]: '',
        },
      }));

      onSaveGrade({
        course_id: Number(courseId),
        student_id: Number(currentStudentId),
        grading_item_id: Number(gradingItemId),
        grade: null,
      });
      return;
    }

    const last5digits = newRawDigits.slice(-5);
    const paddedDigits = last5digits.padStart(5, '0');
    let finalGrade = `${paddedDigits.slice(0, -2)}.${paddedDigits.slice(-2)}`;
    let numericGrade = Number(finalGrade);

    if (numericGrade > 100) {
      numericGrade = 100;
      finalGrade = '100.00';
    }

    setGrades((prev: any) => ({
      ...prev,
      [gradingItemId]: {
        ...prev[gradingItemId],
        [currentStudentId]: finalGrade,
      },
    }));

    onSaveGrade({
      course_id: Number(courseId),
      student_id: Number(currentStudentId),
      grading_item_id: Number(gradingItemId),
      grade: numericGrade,
    });
  };

  const handleBackspace = (
    event: React.KeyboardEvent<HTMLInputElement>,
    gradingItemId: number,
    currentStudentId: string | number
  ) => {
    if (event.key === 'Delete') {
      event.preventDefault();
      setGrades((prev: any) => ({
        ...prev,
        [gradingItemId]: {
          ...prev[gradingItemId],
          [currentStudentId]: '',
        },
      }));

      onSaveGrade({
        course_id: Number(courseId),
        student_id: Number(currentStudentId),
        grading_item_id: Number(gradingItemId),
        grade: null,
      });
      return;
    }

    if (event.key !== 'Backspace') {
      return;
    }

    event.preventDefault();

    const currentValue = grades?.[gradingItemId]?.[currentStudentId] ?? '';
    const currentNumeric = Number(currentValue);

    if (currentValue !== '' && !Number.isNaN(currentNumeric) && currentNumeric === 0) {
      setGrades((prev: any) => ({
        ...prev,
        [gradingItemId]: {
          ...prev[gradingItemId],
          [currentStudentId]: '',
        },
      }));

      onSaveGrade({
        course_id: Number(courseId),
        student_id: Number(currentStudentId),
        grading_item_id: Number(gradingItemId),
        grade: null,
      });
      return;
    }

    let rawGrade = String(currentValue).replace(/\D/g, '');
    if (!rawGrade.length) {
      return;
    }

    rawGrade = rawGrade.slice(0, -1);

    if (!rawGrade.length) {
      setGrades((prev: any) => ({
        ...prev,
        [gradingItemId]: {
          ...prev[gradingItemId],
          [currentStudentId]: '',
        },
      }));

      onSaveGrade({
        course_id: Number(courseId),
        student_id: Number(currentStudentId),
        grading_item_id: Number(gradingItemId),
        grade: null,
      });
      return;
    }

    const padded = rawGrade.padStart(5, '0');
    let finalGrade = `${padded.slice(0, -2)}.${padded.slice(-2)}`;
    let numeric = Number(finalGrade);

    if (numeric > 100) {
      numeric = 100;
      finalGrade = '100.00';
    }

    setGrades((prev: any) => ({
      ...prev,
      [gradingItemId]: {
        ...prev[gradingItemId],
        [currentStudentId]: finalGrade,
      },
    }));

    onSaveGrade({
      course_id: Number(courseId),
      student_id: Number(currentStudentId),
      grading_item_id: Number(gradingItemId),
      grade: numeric,
    });
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (onCompleted) {
        await onCompleted();
      }
      if (onSubmit) {
        await onSubmit();
      } else {
        toggle();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatPercent = (value: any) => {
    const numeric = Number(value);
    if (!Number.isFinite(numeric)) return '0.00';
    return numeric.toFixed(2);
  };

  const assignmentsAverage = calculateAverage(
    grades,
    componentsGradebook?.assignments,
    String(studentId)
  );

  const progressTestAverage = calculateAverage(
    grades,
    componentsGradebook?.progressTest,
    String(studentId)
  );

  const moversExamAverage = calculateAverage(
    grades,
    componentsGradebook?.moversExam,
    String(studentId)
  );

  const totalAverage = calculateTotalAverage(
    grades,
    componentsGradebook,
    String(studentId),
    gradingPercentages
  );

  const finalGrade = calculateFinalGradingStatus(notesPercentages, totalAverage);

  const hasAssignments = componentsGradebook?.assignments?.length > 0;
  const hasProgressTests = componentsGradebook?.progressTest?.length > 0;
  const hasMoversExam = componentsGradebook?.moversExam?.length > 0;

  return (
    <Modal isOpen={isOpen} toggle={toggle} size='lg'>
      <ModalHeader toggle={toggle}>Complete missing grades</ModalHeader>
      <ModalBody style={{ maxHeight: '70vh', overflowY: 'auto', overflowX: 'auto' }}>
        {gradingItems.length === 0 ? (
          <p>No missing grades found.</p>
        ) : (
          <>
            <div className='small text-muted mb-2'>
              Empty = pending, 0 = valid recorded grade. Grades are saved automatically.
            </div>
            <Table responsive bordered className='report-table mb-0'>
              <tbody>
                <tr className='py-2 border-none'>
                  <td className='col-title' rowSpan={2}>STUDENT</td>
                  {hasAssignments && (
                    <td className='col-title' colSpan={componentsGradebook.assignments.length + 1}>
                      ASSIGNMENTS
                    </td>
                  )}
                  {hasProgressTests && (
                    <td className='col-title' colSpan={componentsGradebook.progressTest.length + 1}>
                      PROGRESS TESTS
                    </td>
                  )}
                  {hasMoversExam && (
                    <td className='col-title' colSpan={componentsGradebook.moversExam.length + 1}>
                      MOVERS EXAM
                    </td>
                  )}
                  <td className='col-title' rowSpan={2}>TOTAL</td>
                  <td className='col-title' rowSpan={2}>GRADE</td>
                </tr>
                <tr>
                  {componentsGradebook.assignments.map((item: any) => (
                    <td key={`assignment-name-${item.item_id}`} className='col-vertical border-bottom text-center highlighted-col'>
                      {item.item_name}
                    </td>
                  ))}
                  {hasAssignments && (
                    <td className='col-title'>ASSIG. ({formatPercent(gradingPercentages?.assig_percentage)}%)</td>
                  )}
                  {componentsGradebook.progressTest.map((item: any) => (
                    <td key={`progress-name-${item.item_id}`} className='col-vertical border-bottom text-center highlighted-col'>
                      {item.item_name}
                    </td>
                  ))}
                  {hasProgressTests && (
                    <td className='col-title'>TEST. ({formatPercent(gradingPercentages?.test_percentage)}%)</td>
                  )}
                  {componentsGradebook.moversExam.map((item: any) => (
                    <td key={`exam-name-${item.item_id}`} className='col-vertical border-bottom text-center highlighted-col'>
                      {item.item_name}
                    </td>
                  ))}
                  {hasMoversExam && (
                    <td className='col-title'>EXAM ({formatPercent(gradingPercentages?.exam_percentage)}%)</td>
                  )}
                </tr>
                <tr>
                  <td className='student-col'>{(studentName || `Student ${studentId}`).toUpperCase()}</td>
                  {componentsGradebook.assignments.map((item: any) => (
                    <td className='td-container' key={`assignment-input-${item.item_id}`}>
                      <Input
                        className='td-input input-percentage bg-transparent text-black'
                        value={getGradeDisplayValue(item.item_id, studentId)}
                        onChange={(event) => onChangeGrades(event, item.item_id, studentId)}
                        onKeyDown={(event) => handleBackspace(event, item.item_id, studentId)}
                      />
                    </td>
                  ))}
                  {hasAssignments && <td>{assignmentsAverage}%</td>}
                  {componentsGradebook.progressTest.map((item: any) => (
                    <td className='td-container' key={`progress-input-${item.item_id}`}>
                      <Input
                        className='td-input input-percentage bg-transparent text-black'
                        value={getGradeDisplayValue(item.item_id, studentId)}
                        onChange={(event) => onChangeGrades(event, item.item_id, studentId)}
                        onKeyDown={(event) => handleBackspace(event, item.item_id, studentId)}
                      />
                    </td>
                  ))}
                  {hasProgressTests && <td>{progressTestAverage}%</td>}
                  {componentsGradebook.moversExam.map((item: any) => (
                    <td className='td-container' key={`exam-input-${item.item_id}`}>
                      <Input
                        className='td-input input-percentage bg-transparent text-black'
                        value={getGradeDisplayValue(item.item_id, studentId)}
                        onChange={(event) => onChangeGrades(event, item.item_id, studentId)}
                        onKeyDown={(event) => handleBackspace(event, item.item_id, studentId)}
                      />
                    </td>
                  ))}
                  {hasMoversExam && <td>{moversExamAverage}%</td>}
                  <td>{totalAverage}%</td>
                  <td>{finalGrade}</td>
                </tr>
              </tbody>
            </Table>
          </>
        )}
      </ModalBody>
      <ModalFooter>
        <Button color='secondary' onClick={toggle} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button color='primary' onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default CompleteMissingGradesModal;
