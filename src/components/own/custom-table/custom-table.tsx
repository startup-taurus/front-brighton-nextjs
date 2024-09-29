import React from "react";
import DataTable from "react-data-table-component";

const CustomTable = ({ columns, data }: any) => {
  return (
    <DataTable
      columns={columns}
      data={data}
      customStyles={customStyles}
      className="border-table"
      highlightOnHover
      pointerOnHover
      dense={false}
    />
  );
};

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#F9A825",
      fontWeight: "bold",
      fontSize: "16px",
      color: "#ffffff",
      paddingTop: "0px",
    },
  },

  cells: {
    style: {
      padding: "10px",
    },
  },
  rows: {
    style: {
      minHeight: "25px",
    },
  },
};

export default CustomTable;
