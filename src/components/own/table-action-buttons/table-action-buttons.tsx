import React from "react";
import {
  FaMagnifyingGlass,
  FaBan,
  FaPenToSquare,
  FaCheck,
  FaTrash,
} from "react-icons/fa6";

const TableActionButtons = ({
  onView,
  onBlock,
  onEdit,
  onDelete,
  status,
}: any) => {
  return (
    <div className="btn-group" role="group" aria-label="Basic example">
      {onView && (
        <button type="button" className="btn btn-light" onClick={onView}>
          <FaMagnifyingGlass />
        </button>
      )}
      {onBlock && (
        <button type="button" className="btn btn-cancel" onClick={onBlock}>
          {!status ? <FaBan /> : <FaCheck />}
        </button>
      )}
      {onEdit && (
        <button type="button" className="btn btn-save" onClick={onEdit}>
          <FaPenToSquare />
        </button>
      )}
      {onDelete && (
        <button type="button" className="btn btn-danger" onClick={onDelete}>
          <FaTrash />
        </button>
      )}
    </div>
  );
};

export default TableActionButtons;
