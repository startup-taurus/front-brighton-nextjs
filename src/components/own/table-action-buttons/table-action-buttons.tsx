import React from 'react';
import { FaCopy } from 'react-icons/fa';
import {
  FaMagnifyingGlass,
  FaBan,
  FaPenToSquare,
  FaCheck,
  FaTrash,
  FaArrowRightArrowLeft,
} from 'react-icons/fa6';
import { Tooltip } from 'react-tooltip';

const TableActionButtons = ({
  onView,
  onBlock,
  onEdit,
  onDelete,
  status,
  onCopy,
  onTransfer,
  disabled = false,
  viewDisabled,
  blockButtonVariant = 'cancel',
}: any) => {
  return (
    <>
      <div
        className='btn-group mobile-action-buttons'
        role='group'
        aria-label='Basic example'
      >
        {onView && (
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
        {onBlock && (
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
        {onEdit && (
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
        {onCopy && (
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
        {onTransfer && (
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
        {onDelete && (
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
          content='Transfer to student'
        />
        <Tooltip
          id='on-delete'
          place='top'
          content='Delete'
        />
      </div>
    </>
  );
};

export default TableActionButtons;