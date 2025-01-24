import React from "react";
import { FaCopy } from "react-icons/fa";
import {
  FaMagnifyingGlass,
  FaBan,
  FaPenToSquare,
  FaCheck,
} from "react-icons/fa6";

const TableActionButtons = ({
  onView,
  onBlock,
  onEdit,
  status,
  onCopy,
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
      {onCopy && (
        <button type="button" className="btn btn-cancel" onClick={onCopy}>
          <FaCopy />
        </button>
      )}
    </div>
  );
};

export default TableActionButtons;
