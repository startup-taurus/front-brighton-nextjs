import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Container, Row } from 'reactstrap';
import { useRouter } from 'next/router';
import useSWR from 'swr';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import { FiltersProps } from '../../../../Types/types';
import { getAllLevels } from '../../../../helper/api-data/level';
import { getActiveCourses } from '../../../../helper/api-data/course';
import { STATUS_LEVEL_CHANGE, USER_TYPES } from '../../../../utils/constants';
import StudentTransferForm from '@/components/own/form/student-transfer-form';
import TransferStudentsTable from '@/components/own/tables/transfer-students-table';
import StudentSelectorModal, {
  StudentOption,
} from '@/components/own/student-slector-modal/StudentSelectorModal';
import { getUserRoleFromLocalStorage } from 'utils/auth';
import { SelectOption } from 'Types/SelectType';

const TransferStudents = () => {
  const router = useRouter();
  const [isSelectorModalOpen, setIsSelectorModalOpen] = useState(false);
  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [studentsToTransfer, setStudentsToTransfer] = useState<StudentOption[]>(
    []
  );
  const [isGroupMode, setIsGroupMode] = useState(false);
  const [transferDescription, setTransferDescription] = useState('');

  const [reload, setReload] = useState(false);

  const limit = 10;
  const [coursePage, setCoursePage] = useState(1);
  const [courseSearch, setCourseSearch] = useState('');
  const [courseOptions, setCourseOptions] = useState<any[]>([]);
  const [levelOptions, setLevelOptions] = useState<any[]>([]);
  const [courseFilter, setCourseFilter] = useState<SelectOption | null>(null);
  const [levelFilter, setLevelFilter] = useState<SelectOption | null>(null);

  const { data: courseData } = useSWR(
    ['/course/get-active', coursePage, limit, courseSearch],
    () => getActiveCourses(coursePage, limit, courseSearch)
  );
  const { data: levelData } = useSWR(
    ['/level/get-all'],
    () => getAllLevels(1, 100, '', true)
  );

  useEffect(() => {
    if (courseData?.data) {
      const coursesArray = Array.isArray(courseData.data)
        ? courseData.data
        : courseData.data.result;

      const newOptions = coursesArray.map((course: any) => ({
        value: course.id,
        label: course.course_number,
      }));

      setCourseOptions((prevOptions) => {
        const combinedOptions = [...prevOptions, ...newOptions];
        return combinedOptions.filter(
          (currentOption, currentIndex) =>
            combinedOptions.findIndex(
              (option) => option.value === currentOption.value
            ) === currentIndex
        );
      });
    }
  }, [courseData]);

  useEffect(() => {
    if (levelData?.data?.results) {
      const options = levelData.data.results.map((level: any) => ({
        value: level.id,
        label: level.full_level,
      }));
      setLevelOptions(options);
    }
  }, [levelData]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Status',
      name: 'status_level_change',
      type: 'select',
      items: STATUS_LEVEL_CHANGE,
    },
    { labelName: 'Description', name: 'description', type: 'text' },
    {
      labelName: 'Type',
      name: 'is_group',
      type: 'select',
      items: [
        { value: 'true', label: 'Group' },
        { value: 'false', label: 'Individual' },
      ],
    },
    {
      labelName: 'Course',
      name: 'selected_course_id',
      type: 'select',
      items: courseOptions.length > 0 ? courseOptions : [],
      value: courseFilter,
      inputValue: courseSearch,
      onChange: (option) => {
        setCourseFilter(option);
      },
      onInputChange: (value) => setCourseSearch(value),
      onMenuScrollToBottom: () => setCoursePage((page) => page + 1),
      isAsync: true,
    },
    {
      labelName: 'Level',
      name: 'selected_level_id',
      type: 'select',
      items: levelOptions,
      value: levelFilter,
      onChange: (option) => {
        setLevelFilter(option);
      },
    },
    { labelName: 'Created From', name: 'created_at_from', type: 'date' },
    { labelName: 'Created To', name: 'created_at_to', type: 'date' },
  ];

  const toggleSelectorModal = () => {
    if (isSelectorModalOpen) {
      setStudentsToTransfer([]);
      setIsGroupMode(false);
    }
    setIsSelectorModalOpen(!isSelectorModalOpen);
  };

  const toggleTransferModal = () => {
    if (isTransferModalOpen) {
      setReload((r) => !r);
      setStudentsToTransfer([]);
      setIsGroupMode(false);
    }
    setIsTransferModalOpen(!isTransferModalOpen);
  };

  const handleSelectionComplete = (
    selected: StudentOption[],
    group: boolean,
    description: string
  ) => {
    setStudentsToTransfer(selected);
    setIsGroupMode(group);
    setTransferDescription(description);
    setIsSelectorModalOpen(false);
    setIsTransferModalOpen(true);
  };

  const handleTransferSuccess = (identifier: string) => {
    setReload((r) => !r);
    toggleTransferModal();
  };

  const userRole = getUserRoleFromLocalStorage();

  return (
    <div className='page-body'>
      <Container
        className='basic_table'
        fluid
      >
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={() => setReload((r) => !r)}
                addButton={
                  userRole === USER_TYPES.RECEPTIONIST
                    ? {
                        title: 'Create Transfer',
                        onClick: toggleSelectorModal,
                      }
                    : undefined
                }
              />
            </CardHeader>
            <div className='pb-4'>
              <TransferStudentsTable reload={reload} />
            </div>
          </Card>
        </Row>
      </Container>
      {isSelectorModalOpen && (
        <StudentSelectorModal
          isOpen={isSelectorModalOpen}
          toggle={toggleSelectorModal}
          onNext={handleSelectionComplete}
        />
      )}

      {isTransferModalOpen && studentsToTransfer.length > 0 && (
        <StudentTransferForm
          isOpen={isTransferModalOpen}
          toggle={toggleTransferModal}
          students={studentsToTransfer}
          isGroupTransfer={isGroupMode}
          description={transferDescription}
          onSuccess={handleTransferSuccess}
        />
      )}
    </div>
  );
};

export default TransferStudents;
