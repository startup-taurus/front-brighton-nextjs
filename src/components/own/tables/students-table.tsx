import React from "react";
import { Table } from "reactstrap";
import {
  hoverTableData,
  studentsData,
} from "../../../../Data/table/ReactStrapTableData";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";

const StudentsTable = () => {
  return (
    <div className="table-responsive signal-table">
      <Table
        hover={true}
        className="table table-hover table-responsive uppercase-table"
      >
        <thead>
          <tr>
            <th scope="col">Acciones</th>
            <th scope="col">Estudiante</th>
            <th scope="col">Estado</th>
            <th scope="col">Metodo de pago</th>
            <th scope="col">Fecha de pago</th>
            <th scope="col">Estado de pago</th>
            <th scope="col">Pensión</th>
            <th scope="col">Curso</th>
            <th scope="col">Nivel</th>
          </tr>
        </thead>
        <tbody>
          {studentsData.map((item) => (
            <tr key={item.id}>
              <td>
                <TableActionButtons />
              </td>
              <td>
                {item.name}&nbsp;{item.lastName}
              </td>
              <td>
                <span
                  className={`badge ${item.isActive ? "badge-success" : "badge-danger"}`}
                >
                  {item.isActive ? "Activo" : "Desactivo"}
                </span>{" "}
              </td>
              <td>{item.paymentMethod}</td>
              <td>{item.paymentDate}</td>
              <td>
                <span
                  className={`badge ${item.isActive ? "badge-success" : "badge-danger"}`}
                >
                  {item.paymentStatus ? "Pagado" : "No Pagado"}{" "}
                </span>
              </td>
              <td>{item.paymentAmount}</td>
              <td>{item.course}</td>
              <td>{item.level}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
};

export default StudentsTable;
