import React from 'react';
import { FaCopy } from 'react-icons/fa';
import {
  FaMagnifyingGlass,
  FaBan,
  FaPenToSquare,
  FaCheck,
  FaTrash,
  FaArrowRightArrowLeft,
  FaClipboardList,
  FaUnlock,
  FaBookOpen,
} from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';
import usePermission from '../../../../hooks/usePermission';
import { ACTION_PERMISSIONS } from '../../../../utils/permissions';

const TableActionButtons = ({
  onView,
  onBlock,
  onEdit,
  onDelete,
  status,
  onCopy,
  onTransfer,
  onAttendance,
  onGradebook,
  onActivate,
  onTransferCourse,
  disabled = false,
  viewDisabled,
  blockButtonVariant = 'cancel',
  transferTooltip = 'Transfer to course',
  module,
}: any) => {
  const { can } = usePermission();
  const canAction = (action: string): boolean => {
    if (!module) return true;
    const required = ACTION_PERMISSIONS[module]?.[action];
    if (!required) return true;
    return can(required);
  };
  return (
    <>
      <div
        className='btn-group mobile-action-buttons'
        role='group'
        aria-label='Basic example'
      >
        {onView && canAction('view') && (
          <button
            type='button'
            className='btn btn-light'
            onClick={onView}
            data-tooltip-id='on-view'
            disabled={viewDisabled ?? disabled}
          >
            <FaMagnifyingGlass />
          </button>
        )}
        {onAttendance && canAction('attendance') && (
          <button
            type='button'
            className='btn btn-info'
            onClick={onAttendance}
            data-tooltip-id='on-attendance'
            disabled={disabled}
          >
            <FaClipboardList />
          </button>
        )}
        {onGradebook && canAction('gradebook') && (
          <button
            type='button'
            className='btn btn-primary'
            onClick={onGradebook}
            data-tooltip-id='on-gradebook'
            disabled={disabled}
          >
            <FaBookOpen />
          </button>
        )}
        {onActivate && canAction('activate') && (
          <button
            type='button'
            className='btn btn-success'
            onClick={onActivate}
            data-tooltip-id='on-activate'
            disabled={disabled}
          >
            <FaUnlock />
          </button>
        )}
        {onBlock && canAction('block') && (
          <button
            type='button'
            className={`btn btn-${blockButtonVariant}`}
            onClick={onBlock}
            data-tooltip-id='on-block'
            disabled={disabled}
          >
            {!status ? <FaBan /> : <FaCheck />}
          </button>
        )}
        {onEdit && canAction('edit') && (
          <button
            type='button'
            className='btn btn-save'
            onClick={onEdit}
            data-tooltip-id='on-edit'
            disabled={disabled}
          >
            <FaPenToSquare />
          </button>
        )}
        {onCopy && canAction('copy') && (
          <button
            type='button'
            className='btn btn-cancel'
            onClick={onCopy}
            data-tooltip-id='on-copy'
            disabled={disabled}
          >
            <FaCopy />
          </button>
        )}
        {onTransfer && canAction('transfer') && (
          <button
            type='button'
            className='btn btn-cancel'
            onClick={onTransfer}
            data-tooltip-id='on-transfer'
            disabled={disabled}
          >
            <FaArrowRightArrowLeft />
          </button>
        )}
        {onTransferCourse && canAction('transfer_course') && (
          <button
            type='button'
            className='btn btn-cancel'
            onClick={onTransferCourse}
            data-tooltip-id='on-transfer-course'
            disabled={disabled}
          >
            <FaArrowRightArrowLeft />
          </button>
        )}
        {onDelete && canAction('delete') && (
          <button
            type='button'
            className='btn btn-danger'
            onClick={onDelete}
            data-tooltip-id='on-delete'
            disabled={disabled}
          >
            <FaTrash />
          </button>
        )}
        <Tooltip
          id='on-view'
          place='top'
          content='View detail'
        />
        <Tooltip
          id='on-attendance'
          place='top-start'
          content='View attendance'
        />
        <Tooltip
          id='on-gradebook'
          place='top-start'
          content='View gradebook'
        />
        <Tooltip
          id='on-activate'
          place='top'
          content='Activate user and reset failed attempts'
        />
        <Tooltip
          id='on-block'
          place='top'
          content='Block or enable'
        />
        <Tooltip
          id='on-edit'
          place='top'
          content='Edit'
        />
        <Tooltip
          id='on-copy'
          place='top'
          content='Duplicate'
        />
        <Tooltip
          id='on-transfer'
          place='top'
          content={transferTooltip}
        />
        <Tooltip
          id='on-transfer-course'
          place='top'
          content='Transfer to course'
        />
        <Tooltip
          id='on-delete'
          place='top'
          content='Delete'
        />
      </div>
    </>
  );
}

export default TableActionButtons;
