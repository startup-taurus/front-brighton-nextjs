import {
  Id,
  Status,
  SignalName,
  Security,
  Stage,
  Schedule,
  TeamLead,
} from "utils/Constant";

const HoverableRowsTableHead = () => {
  return (
    <thead>
      <tr>
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
  );
};

export default HoverableRowsTableHead;
