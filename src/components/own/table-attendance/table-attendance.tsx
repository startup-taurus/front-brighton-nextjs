import React, {
  useEffect,
  useState,
  useMemo,
  ChangeEvent,
  useCallback,
  useContext,
} from 'react';
import { Input, Table, Alert, Badge, Button, Collapse } from 'reactstrap';
import {
  countAbsences,
  countAttendance,
  formatDate,
  getColorOfAssistance,
} from '../../../../utils/utils';
import { createAttendance } from '../../../../helper/api-data/attendance';
import { updateLessonTaught } from '../../../../helper/api-data/course-schedule';
import { toast } from 'react-toastify';
import { debounce } from 'lodash';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import { STATUS, USER_TYPES } from 'utils/constants';
import { FaChevronUp, FaChevronDown } from 'react-icons/fa';

type TableAttendanceProps = {
  courseSchedule: any;
  studentsAttendance: Record<number, Record<number, string>>;
  students: Array<any>;
  courseStatus?: string;
};

type AttendanceStatistics = {
  attendanceCount: number;
  attendancePercentage: number;
};

const TableAttendance: React.FC<TableAttendanceProps> = ({
  courseSchedule = [],
  studentsAttendance,
  students = [],
  courseStatus,
}) => {
  const [dates, setDates] = useState(studentsAttendance);
  const [scheduleItems, setScheduleItems] = useState(courseSchedule);
  const [showInactive, setShowInactive] = useState(false);
  const { user } = useContext(UserContext);
  const { canPermission } = usePermission();
  const canMarkAttendance = canPermission(PERMISSIONS.MARK_ATTENDANCE);

  useEffect(() => setDates(studentsAttendance), [studentsAttendance]);
  useEffect(() => setScheduleItems(courseSchedule), [courseSchedule]);

  const isTransferredCourse =
    typeof courseStatus === 'string' &&
    courseStatus.toLowerCase() === STATUS.TRANSFERRED;

  const changeAttendance = async (
    e: ChangeEvent<HTMLSelectElement>,
    scheduleId: number,
    studentId: number
  ) => {
    const status = e.target.value;
    setDates((prev) => ({
      ...prev,
      [scheduleId]: {
        ...prev[scheduleId],
        [studentId]: status,
      },
    }));
    await createAttendance({
      course_schedule_id: scheduleId,
      student_id: studentId,
      status,
    });
  };

  const calculateAttendance = (id: number): AttendanceStatistics =>
    countAttendance(dates, id);
  const calculateAbsence = (id: number): AttendanceStatistics =>
    countAbsences(dates, id);

  const updateScheduleItem = (
    e: ChangeEvent<HTMLInputElement | HTMLSelectElement>,
    lessonId: number,
    scheduleIndex: number
  ) => {
    const value = e.target.value;
    setScheduleItems((prevScheduleItems: any) =>
      prevScheduleItems.map((scheduleItem: any, itemIndex: any) =>
        itemIndex === scheduleIndex
          ? { ...scheduleItem, lesson_taught: value }
          : scheduleItem
      )
    );
    debouncedSave(value, lessonId);
  };

  const debouncedSave = useCallback(
    debounce(
      (lesson: string, id: number) =>
        updateLessonTaught(id, { lesson_taught: lesson }),
      600
    ),
    []
  );

  const renderStats = (id: number) => {
    const {
      attendanceCount: attendanceCount,
      attendancePercentage: attendancePercentage,
    } = calculateAttendance(id);
    const {
      attendanceCount: absenceCount,
      attendancePercentage: absencePercentage,
    } = calculateAbsence(id);
    return (
      <>
        <td>{attendanceCount}</td>
        <td>{attendancePercentage}%</td>
        <td>{absenceCount}</td>
        <td className={getColorOfAssistance(absencePercentage)}>
          {absencePercentage}%
        </td>
      </>
    );
  };

  const active = useMemo(
    () =>
      isTransferredCourse
        ? students.filter((student) => student.status !== STATUS.INACTIVE)
        : students.filter(
            (student) =>
              !student.is_retired && student.status !== STATUS.INACTIVE
          ),
    [students, isTransferredCourse]
  );
  const inactive = useMemo(
    () =>
      isTransferredCourse
        ? students.filter((student) => student.status === STATUS.INACTIVE)
        : students.filter(
            (student) => student.is_retired || student.status === STATUS.INACTIVE
          ),
    [students, isTransferredCourse]
  );
  const toggleInactive = () => setShowInactive((p) => !p);

  const totalCols = scheduleItems.length + 4;

  const StudentRow = (student: any, index: number) => (
    <tr
      key={index}
      className={
        student.status === STATUS.INACTIVE ||
        (student.is_retired && !isTransferredCourse)
          ? 'bg-light'
          : ''
      }
    >
      <td
        className={`student-col ${
          student.status === STATUS.INACTIVE ||
          (student.is_retired && !isTransferredCourse)
            ? 'd-flex  align-items-start align-md-center justify-center-start '
            : ''
        }`}
      >
        {student.name.toUpperCase()}
        {(student.is_retired || student.status === STATUS.INACTIVE) && (
          <Badge color='primary' pill size='sm' className='mt-2 mt-md-0 ms-md-2'>
            {student.status === STATUS.INACTIVE
              ? 'INACTIVE'
              : isTransferredCourse
              ? 'TRANSFERRED'
              : 'RETIRED'}
          </Badge>
        )}
      </td>
      {scheduleItems.map((scheduleItem: any, scheduleItemIndex: number) => (
        <td key={scheduleItemIndex} className='td-attendance'>
          <Input
            type='select'
            className={`td-input attendance-input bg-transparent text-dark ${!canMarkAttendance ? 'cursor-no-allowed' : ''}`}
            value={dates[scheduleItem.id]?.[student.id] || ''}
            onChange={(e: any) =>
              changeAttendance(e, scheduleItem.id, student.id)
            }
            disabled={!canMarkAttendance}
          >
            <option value=''> </option>
            <option value='present'>P</option>
            <option value='absent'>F</option>
            <option value='late'>A</option>
            <option value='recovered'>R</option>
          </Input>
        </td>
      ))}
      {renderStats(student.id)}
    </tr>
  );

  return (
    <div>
      <Table responsive bordered className='main-table w-100'>
        <thead>
          <tr>
            <th className='main-col-title'>STUDENT</th>
            {scheduleItems.map((scheduleItem: any, scheduleIndex: number) => (
              <th
                key={scheduleIndex}
                className='col-vertical'
              >
                {formatDate(scheduleItem.scheduled_date)}
              </th>
            ))}
            <th
              className='main-col-title'
              colSpan={2}
            >
              ATTENDANCE
            </th>
            <th
              className='main-col-title'
              colSpan={2}
            >
              ABSENCES
            </th>
          </tr>
        </thead>
        <tbody>
          {active.length ? (
            active.map(StudentRow)
          ) : (
            <tr>
              <td
                colSpan={totalCols}
                className='text-center'
              >
                This course doesn't have student
              </td>
            </tr>
          )}
          {inactive.length > 0 && (
            <tr>
              <td
                colSpan={totalCols + 1}
                className=' py-3 bg-light cursor-pointer position-relative'
                onClick={toggleInactive}
              >
                <span className='text-dark'>
                  {showInactive ? 'Hide' : 'Show'} {isTransferredCourse ? 'inactive' : 'inactive/retired'} students ({inactive.length})
                </span>
                <span
                  className={`toggle-icon  ${!canMarkAttendance ? 'toggle-icon no-professor ' : ''}  `}
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
          {inactive.map(StudentRow)}
        </Collapse>
        <tbody>
          <tr className='py-2'>
            <td className='border-none' />
          </tr>
          <tr>
            <td className='main-col-description'>LESSON:</td>
            {scheduleItems.map((scheduleItem: any, scheduleIndex: number) => (
              <td
                key={scheduleIndex}
                className='col-vertical'
              >
                <Input
                  type='text'
                  className={`attendance-input bg-white text-black ${!canMarkAttendance ? 'cursor-no-allowed' : ''}`}
                  onChange={(e) =>
                    updateScheduleItem(e, scheduleItem.id, scheduleIndex)
                  }
                  value={scheduleItem.lesson_taught ?? ''}
                  disabled={!canMarkAttendance}
                />
              </td>
            ))}
            <td
              className='main-col-description'
              colSpan={4}
            />
          </tr>
        </tbody>
        <tbody>
          <tr>
            <td className='main-col-description'>CURRICULUM:</td>
            {scheduleItems.map((scheduleItem: any, scheduleIndex: number) => (
              <td
                key={scheduleIndex}
                className='col-vertical highlighted-col text-center'
              >
                {scheduleItem.syllabusItem.item_name}
              </td>
            ))}
            <td
              className='main-col-description'
              colSpan={4}
            />
          </tr>
        </tbody>
      </Table>
    </div>
  );
};

export default TableAttendance;
