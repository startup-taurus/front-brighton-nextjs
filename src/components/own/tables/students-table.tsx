import React from "react";
import { Table } from "reactstrap";
import {
  hoverTableData,
  studentsData,
} from "../../../../Data/table/ReactStrapTableData";

const StudentsTable = () => {
  return (
    <div className="table-responsive signal-table">
      <Table hover={true} className="table-border-horizontal">
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
              <td></td>
              <td>
                {item.name}&nbsp;{item.lastName}
              </td>
              <td>{item.isActive ? "Activo" : "Desactivo"}</td>
              <td>{item.paymentMethod}</td>
              <td>{item.paymentDate}</td>
              <td>{item.paymentStatus ? "Pagado" : "No Pagado"}</td>
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
