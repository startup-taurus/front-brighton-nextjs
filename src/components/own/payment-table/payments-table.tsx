import React, { useState } from "react";
import { Table } from "reactstrap";
import {
  hoverTableData,
  studentsData,
} from "../../../../Data/table/ReactStrapTableData";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import TableFooter from "@/components/own/table-footer/table-footer";
import StudentForm from "@/components/own/student-form/student-form";
import Swal from "sweetalert2";
import StudentDetail from "@/components/own/student-detail/student-datail";

const PaymentTable = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);

  const [selectedData, setSelectedData] = useState(null);
  const toggle = (data: any) => {
    setSelectedData(data);
    setIsOpen(!isOpen);
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
  };

  const buttonStyle = Swal.mixin({
    customClass: {
      cancelButton: "btn-danger",
      confirmButton: "btn btn-success",
    },
    buttonsStyling: true,
  });

  const handleAlert = () => {
    buttonStyle.fire({
      title: "Está seguro?",
      text: "Esta acción no se puede revertir!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Si, desactivar!",
      cancelButtonText: "No, cancelar!",
      reverseButtons: true,
    });
  };

  return (
    <>
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
              <th scope="col">Curso</th>
              <th scope="col">Nivel</th>
              <th scope="col">Monto de Pago</th>
              <th scope="col">Mes de Pago</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.map((item) => (
              <tr key={item.id}>
                <td>
                  <TableActionButtons
                    onView={() => toggleDetail(item)}
                    onBlock={() => handleAlert()}
                    onEdit={() => toggle(item)}
                  />
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

                <td>{item.course}</td>
                <td>{item.level}</td>
                <td>{item.paymentAmount}</td>
                <td>{item.payment}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <TableFooter />

      <StudentForm isOpen={isOpen} toggle={toggle} data={selectedData} />
      <StudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      />
    </>
  );
};

export default PaymentTable;
