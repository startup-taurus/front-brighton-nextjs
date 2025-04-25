import React from 'react';
import { Row, Col, Button, Input } from 'reactstrap';
import Select, { Props as SelectProps } from 'react-select';

export interface StudentFiltersProps {
  courseInputValue: string;
  levelInputValue: string;
  isLoading: boolean;
  courseOptions: { value: string | number; label: string }[];
  levelOptions: { value: string | number; label: string }[];
  statusOptions?: { value: string; label: string }[];
  filters: { course: string; level: string; status: string; name: string };
  onCourseInput: (input: string) => void;
  onLevelInput: (input: string) => void;
  onCourseChange: (value: string) => void;
  onLevelChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onNameChange: (value: string) => void;
  loadMoreCourse: () => void;
  loadMoreLevel: () => void;
  onApply: () => void;
  onClear: () => void;
}

const defaultStatus = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
];

const menuPortal: SelectProps<any>['styles'] = {
  menuPortal: (base) => ({ ...base, zIndex: 2000 }),
};

const StudentFilters: React.FC<StudentFiltersProps> = ({
  courseInputValue,
  levelInputValue,
  courseOptions,
  levelOptions,
  statusOptions = defaultStatus,
  filters,
  isLoading,
  onCourseInput,
  onLevelInput,
  onCourseChange,
  onLevelChange,
  onStatusChange,
  onNameChange,
  loadMoreCourse,
  loadMoreLevel,
  onApply,
  onClear,
}) => {
  const isButtonDisabled =
    !filters.course &&
    !filters.level &&
    !filters.status &&
    !filters.name &&
    !courseInputValue &&
    !levelInputValue;

  return (
    <>
      <Row className='mb-3'>
        <Col md='3'>
          <label>Filter by Course</label>
          <Select
            options={courseOptions}
            placeholder='Filter by Course'
            isClearable
            value={
              courseOptions.find((o) => o.value === filters.course) || null
            }
            inputValue={courseInputValue}
            onInputChange={onCourseInput}
            onChange={(opt) => onCourseChange(opt?.value || '')}
            onMenuScrollToBottom={loadMoreCourse}
            menuPortalTarget={document.body}
            styles={menuPortal}
          />
        </Col>
        <Col md='3'>
          <label>Filter by Level</label>
          <Select
            options={levelOptions}
            placeholder='Filter by Level'
            isClearable
            value={levelOptions.find((o) => o.value === filters.level) || null}
            inputValue={levelInputValue}
            onInputChange={onLevelInput}
            onChange={(opt) => onLevelChange(opt?.value || '')}
            onMenuScrollToBottom={loadMoreLevel}
            menuPortalTarget={document.body}
            styles={menuPortal}
          />
        </Col>
        <Col md='3'>
          <label>Filter by Status</label>
          <Select
            options={statusOptions}
            placeholder='Filter by Status'
            isClearable
            value={
              statusOptions.find((o) => o.value === filters.status) || null
            }
            onChange={(opt) => onStatusChange(opt?.value || '')}
            menuPortalTarget={document.body}
            styles={menuPortal}
          />
        </Col>
        <Col md='3'>
          <label>Search by Student Name</label>
          <Input
            placeholder='Search by Student Name'
            value={filters.name}
            onChange={(e) => onNameChange(e.target.value)}
          />
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col className='text-end d-flex justify-content-end gap-2'>
          <Button
            color='secondary'
            onClick={onClear}
            outline
            disabled={isButtonDisabled}
            className='d-flex align-items-center'
          >
            Clear
          </Button>

          <Button
            color='primary'
            onClick={onApply}
            disabled={isButtonDisabled}
            className='d-flex align-items-center'
          >
            Filter
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default StudentFilters;
