import React from "react";
import { FaMagnifyingGlass, FaBan, FaPenToSquare } from "react-icons/fa6";

const TableActionButtons = ({ onView, onBlock, onEdit }: any) => {
  return (
    <div className="btn-group" role="group" aria-label="Basic example">
      <button type="button" className="btn btn-light" onClick={onView}>
        <FaMagnifyingGlass />
      </button>
      <button type="button" className="btn btn-danger" onClick={onBlock}>
        <FaBan />
      </button>
      <button type="button" className="btn btn-success" onClick={onEdit}>
        <FaPenToSquare />
      </button>
    </div>
  );
};

export default TableActionButtons;
