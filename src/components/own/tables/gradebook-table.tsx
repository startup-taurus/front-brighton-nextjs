import React, {
  ChangeEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { Button, Input, Table } from "reactstrap";
import { COMPONENTS_GRADEBOOK } from "../../../../utils/constants";
import {
  buildGradebookStructure,
  calculateAverage,
  calculateClassTotalAverage,
  calculateTotalAverage,
  formatGradebookComponents,
  calculateFinalGradingStatus,
} from "../../../../utils/utils";
import { debounce } from "lodash";
import { useRouter } from "next/router";
import { updateStudentGrade } from "../../../../helper/api-data/student-grades";
import { ComponentsGradebook } from "../../../../Types/GradingItem";
import { FaPlus } from "react-icons/fa6";
import {
  createAssignmentGradingItem,
  updateAssignmentGradingItem,
} from "../../../../helper/api-data/syllabus";
import { mutate } from "swr";

const GradebookTable = ({
  students,
  gradingItems,
  studentsGrades,
  gradingPercentages,
  syllabusId,
  notesPercentages,
}: any) => {
  const router = useRouter();
  const courseId = router.query.id as string;

  const [grades, setGrades] = useState<any>({});
  const [componentsGradebook, setComponentsGradebook] =
    useState<ComponentsGradebook>({
      assignments: [],
      progressTest: [],
      moversExam: [],
    });

  const gradingGrade = useMemo(
    () => buildGradebookStructure(gradingItems, students, studentsGrades),
    [gradingItems, students, studentsGrades],
  );

  useEffect(() => {
    const components = formatGradebookComponents(gradingItems);
    setComponentsGradebook(components);
  }, [gradingItems]);

  useEffect(() => {
    setGrades(gradingGrade);
  }, [gradingGrade]);

  const changeGrades = async (
    event: any,
    gradingItemId: any,
    studentId: any,
  ) => {
    let grade = event.target.value;
    if (grade === "") return;
    if (Number(grade) >= 0 && Number(grade) <= 10) {
      grade = Number(grade).toFixed(2);
      console.log();
      setGrades((grades: any) => ({
        ...grades,
        [gradingItemId]: {
          ...grades[gradingItemId],
          [studentId]: grade,
        },
      }));

      onSaveGrade({
        course_id: courseId,
        student_id: studentId,
        grading_item_id: gradingItemId,
        grade,
      });
    }
  };

  const onSaveGrade = useCallback(
    debounce(async (data: any) => {
      await updateStudentGrade(data);
    }, 600),
    [],
  );

  const addAssignmentCol = () => {
    createAssignmentGradingItem({
      syllabus_id: syllabusId,
      course_id: courseId,
    }).then(() => {
      mutate(`/course/get-grading-items/${courseId}`);
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
    onUpdateAssignmentGradingItem({ id, name: value });
  };

  const onUpdateAssignmentGradingItem = useCallback(
    debounce(async (data: any) => {
      await updateAssignmentGradingItem(data);
    }, 600),
    [],
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
      gradingPercentages,
    );

    const result = calculateFinalGradingStatus(notesPercentages, totalAverage);
    const resultClass = result?.split(" ")[0].toLowerCase();
    return (
      <>
        <td className="highlighted-col">{totalAverage}%</td>
        <td
          className={`text-nowrap ${resultClass ? `result-${resultClass}` : "gray-col"}`}
        >
          {result}
        </td>
      </>
    );
  };

  return (
    <>
      <Table responsive bordered className="report-table">
        <tbody>
          <tr className="py-2 border-none">
            <td className="border-none"></td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.assignments.length}
            >
              <div className="d-flex justify-content-between gap-2">
                {COMPONENTS_GRADEBOOK.ASSIGNMENTS}
                <Button
                  className="add-col-btn"
                  onClick={(e) => addAssignmentCol()}
                >
                  <FaPlus />
                </Button>
              </div>
            </td>
            <td className="border-none"></td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.progressTest.length}
            >
              {COMPONENTS_GRADEBOOK.PROGRESS_TESTS}
            </td>
            <td className="border-none"></td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.moversExam.length}
            >
              {COMPONENTS_GRADEBOOK.MOVERS_EXAM}
            </td>
          </tr>
          <tr className="py-2 border-none">
            <td className="border-none"></td>
            {componentsGradebook?.assignments?.map(
              (item: any, index: number) => (
                <td
                  className="col-vertical border-bottom text-center"
                  key={`assignments-title-${item.item_id}`}
                >
                  <Input
                    type="text"
                    className="assignments-input"
                    // @ts-ignore
                    onChange={(e) =>
                      onChangeAssignmentCol(e, item.item_id, index)
                    }
                    value={item.item_name ?? ""}
                  />
                </td>
              ),
            )}
            <td className="border-none"></td>
            {componentsGradebook?.progressTest?.map((item: any) => (
              <td
                className="col-vertical border-bottom text-center highlighted-col"
                key={`progressTest-title-${item.item_id}`}
              >
                {item.item_name}
              </td>
            ))}
            <td className="border-none"></td>
            {componentsGradebook?.moversExam?.map((item: any) => (
              <td
                className="col-vertical border-bottom text-center highlighted-col"
                key={`moversExam-title-${item.item_id}`}
              >
                {item.item_name}
              </td>
            ))}
          </tr>
          <tr className="py-2 border-none">
            <td className="border-none"></td>
          </tr>
          <tr>
            <td className="col-title">STUDENT</td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.assignments?.length}
            ></td>
            <td className="col-title">
              ASSIG. ({gradingPercentages?.assig_percentage}%)
            </td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.progressTest?.length}
            ></td>
            <td className="col-title">
              TEST. ({gradingPercentages?.test_percentage}%)
            </td>
            <td
              className="col-title"
              colSpan={componentsGradebook?.moversExam?.length}
            ></td>
            <td className="col-title">
              EXAM ({gradingPercentages?.exam_percentage}%)
            </td>
            <td className="col-title">TOTAL</td>
            <td className="col-title">GRADE</td>
          </tr>

          {students &&
            students.length > 0 &&
            grades &&
            students.map((student: any, i: number) => (
              <tr key={`grade-student-${i}`}>
                <td>{student.name}</td>
                {componentsGradebook?.assignments?.map((item: any, j) => (
                  <td className="td-container" key={`grade-note-${j}`}>
                    <Input
                      className="td-input input-percentage"
                      type="number"
                      onChange={(event) =>
                        changeGrades(event, item.item_id, student?.id)
                      }
                      value={grades[item.item_id][student.id] ?? ""}
                    />
                  </td>
                ))}
                <td>
                  {calculateAverage(
                    grades,
                    componentsGradebook?.assignments,
                    student.id,
                  )}
                  %
                </td>
                {componentsGradebook?.progressTest?.map((item: any, j) => (
                  <td
                    className="td-container"
                    key={`grade-note-progressTest-${j}`}
                  >
                    <Input
                      className="td-input input-percentage"
                      type="number"
                      onChange={(event) =>
                        changeGrades(event, item.item_id, student?.id)
                      }
                      value={grades[item.item_id][student.id] ?? ""}
                    />
                  </td>
                ))}
                <td>
                  {calculateAverage(
                    grades,
                    componentsGradebook?.progressTest,
                    student.id,
                  )}
                  %
                </td>
                {componentsGradebook?.moversExam?.map((item: any, j) => (
                  <td
                    className="td-container"
                    key={`grade-note-progressTest-${j}`}
                  >
                    <Input
                      className="td-input input-percentage"
                      type="number"
                      onChange={(event) =>
                        changeGrades(event, item.item_id, student?.id)
                      }
                      value={grades[item.item_id][student.id] ?? ""}
                    />
                  </td>
                ))}
                <td>
                  {calculateAverage(
                    grades,
                    componentsGradebook?.moversExam,
                    student.id,
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
        </tbody>
      </Table>
      <div className="d-flex justify-content-end">
        <div className="attendance-resume">
          <p className="field-description">CLASS AVG.</p>
          <p className="field-value">
            {calculateClassTotalAverage(
              grades,
              componentsGradebook,
              gradingPercentages,
              students,
            )}
            %
          </p>
        </div>
      </div>
    </>
  );
};

export default GradebookTable;
