import React from 'react';
import { Row, Col, Button, Input } from 'reactstrap';
import Select, { Props as SelectProps } from 'react-select';

export interface SyllabusFiltersProps {
  levelInputValue: string;
  isLoading: boolean;
  levelOptions: { value: string | number; label: string }[];
  filters: { syllabus_name: string; level_id: string };
  onLevelInput: (input: string) => void;
  onLevelChange: (value: string) => void;
  onSyllabusNameChange: (value: string) => void;
  loadMoreLevel: () => void;
  onApply: () => void;
  onClear: () => void;
}

const menuPortal: SelectProps<any>['styles'] = {
  menuPortal: (base) => ({ ...base, zIndex: 2000 }),
};

const SyllabusFilters: React.FC<SyllabusFiltersProps> = ({
  levelInputValue,
  levelOptions,
  filters,
  isLoading,
  onLevelInput,
  onLevelChange,
  onSyllabusNameChange,
  loadMoreLevel,
  onApply,
  onClear,
}) => {
  const hasFilters = 
    (filters.syllabus_name && filters.syllabus_name.trim() !== '') ||
    (filters.level_id && filters.level_id.toString().trim() !== '');

  return (
    <>
      <Row className='mb-3'>
        <Col md='6'>
          <label>Syllabus Name</label>
          <Input
            placeholder='Search by Syllabus Name'
            value={filters.syllabus_name}
            onChange={(e) => onSyllabusNameChange(e.target.value)}
          />
        </Col>
        <Col md='6'>
          <label>Filter by Level</label>
          <Select
            options={levelOptions}
            placeholder='Select Level'
            isClearable
            value={levelOptions.find((o) => String(o.value) === String(filters.level_id)) || null} 
            inputValue={levelInputValue}
            onInputChange={onLevelInput}
            onChange={(opt) => onLevelChange(opt?.value ? String(opt.value) : '')}
            onMenuScrollToBottom={loadMoreLevel}
            menuPortalTarget={document.body}
            styles={menuPortal}
            isLoading={isLoading}
          />
        </Col>
      </Row>

      <Row className='mb-3'>
        <Col className='text-end d-flex justify-content-end gap-2'>
          <Button
            color='secondary'
            onClick={onClear}
            outline
            disabled={!hasFilters}
            className='d-flex align-items-center'
          >
            Clear
          </Button>

          <Button
            color='primary'
            onClick={onApply}
            disabled={!hasFilters}
            className='d-flex align-items-center'
          >
            Filter
          </Button>
        </Col>
      </Row>
    </>
  );
};

export default SyllabusFilters;