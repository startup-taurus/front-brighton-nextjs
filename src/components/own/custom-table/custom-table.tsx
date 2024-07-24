import React from "react";
import { useTable, useSortBy } from "react-table";

import { Table } from "reactstrap";

const CustomTable = ({ columns, data }: any) => {
  const table = useTable({ columns, data }, useSortBy);

  const { getTableProps, getTableBodyProps, headerGroups, rows, prepareRow } =
    table;

  return (
    <div className="table-responsive signal-table">
      <Table
        hover={true}
        className="table-border-horizontal"
        {...getTableProps()}
      >
        <thead>
          {headerGroups.map((headerGroup, index) => (
            <tr
              {...headerGroup.getHeaderGroupProps()}
              key={`table-header-row-${index}`}
            >
              {headerGroup.headers.map((column, index) => (
                <th
                  {...column.getHeaderProps()}
                  scope="col"
                  key={`table-header-col-${index}`}
                >
                  {column.render("Header")}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row, index) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()} key={`table-body-row-${index}`}>
                {row.cells.map((cell, index) => (
                  <td key={`table-body-col-${index}`}>{cell.render("Cell")}</td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
};

export default CustomTable;
