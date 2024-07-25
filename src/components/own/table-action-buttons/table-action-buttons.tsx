import React from "react";
import { FaMagnifyingGlass, FaBan, FaPenToSquare } from "react-icons/fa6";

const TableActionButtons = () => {
  return (
    <div className="btn-group" role="group" aria-label="Basic example">
      <button type="button" className="btn btn-light">
        <FaMagnifyingGlass />
      </button>
      <button type="button" className="btn btn-danger">
        <FaBan />
      </button>
      <button type="button" className="btn btn-success">
        <FaPenToSquare />
      </button>
    </div>
  );
};

export default TableActionButtons;
