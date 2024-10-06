import React from "react";
import { Table } from "reactstrap";
import { tr } from "date-fns/locale";

const ReportTable = ({ columns = [], data = [], resumeRowTitle }: any) => {
  if (columns && columns.length === 0) return null;
  return (
    <Table responsive bordered className="report-table">
      <thead>
        <tr>
          {columns?.map((col: any, index: number) => (
            <th className="col-title" key={`col-report-${index}-${col.name}`}>
              {col.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {!data || data.length === 0 ? (
          <tr>
            <td colSpan={columns.length} className="text-center">
              No data to show
            </td>
          </tr>
        ) : (
          <>
            {data.map((row: any, index: number) => (
              <tr key={`report-table-row-${index}`}>
                {columns?.map((col: any, index: number) => (
                  <td
                    className={col.className}
                    key={`row-report-table-${index}`}
                  >
                    {col.selector(row)}
                  </td>
                ))}
              </tr>
            ))}
            <tr>
              <td colSpan={4} className="highlighted-col resume-title-col">
                {resumeRowTitle}
              </td>
              <td className="resume-title-col text-center">24.4%</td>
            </tr>
          </>
        )}
      </tbody>
    </Table>
  );
};

export default ReportTable;
