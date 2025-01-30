import React from "react";
import { FaSyncAlt } from "react-icons/fa";
import { FaCirclePlus } from "react-icons/fa6";

type TableHeaderActions = {
  onReload?: () => void;
  addButton?: {
    title: string;
    onClick: () => void;
  };
};

const TableHeaderActions = ({ onReload, addButton }: TableHeaderActions) => {
  return (
    <div className="d-flex gap-2">
      {onReload && (
        <button
          type="button"
          className="btn btn-update small-btn"
          onClick={onReload}
        >
          <FaSyncAlt />
        </button>
      )}
      {addButton && (
        <button
          type="button"
          className="btn btn-save small-btn"
          onClick={addButton.onClick}
        >
          <FaCirclePlus /> <span>{addButton.title}</span>
        </button>
      )}
    </div>
  );
};

export default TableHeaderActions;
