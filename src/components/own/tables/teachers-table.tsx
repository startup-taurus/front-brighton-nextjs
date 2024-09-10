import StudentDetail from "@/components/own/student-detail/student-datail";
import StudentForm from "@/components/own/student-form/student-form";
import TableActionButtons from "@/components/own/table-action-buttons/table-action-buttons";
import TableFooter from "@/components/own/table-footer/table-footer";
import { useState } from "react";
import { Table } from "reactstrap";
import Swal from "sweetalert2";
import { teachersData } from "../../../../Data/table/ReactStrapTableData";
import TeachersForm from "../teachers-form/teachers-form";

const TeachersTable = () => {
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
              <th scope="col">Docente</th>
              <th scope="col">Cédula</th>
              <th scope="col">Correo</th>
              <th scope="col">Estado</th>
              <th scope="col">Télefono</th>
              <th scope="col">Ultima Conexión</th>
            </tr>
          </thead>
          <tbody>
            {teachersData.map((item) => (
              <tr key={item.id}>
                <td>
                  <TableActionButtons
                    onBlock={() => handleAlert()}
                    onEdit={() => toggle(item)}
                  />
                </td>
                <td>
                  {item.name}&nbsp;{item.lastName}
                </td>
                <td>{item.dni}</td>
                <td>{item.email}</td>
                <td>{item.status ? "Activo" : "Desactivo"}</td>
                <td>{item.phone}</td>
                <td>{item.lastLoginDate}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      <TableFooter />

      <TeachersForm isOpen={isOpen} toggle={toggle} data={selectedData} />
      <StudentDetail
        isOpen={isOpenDetail}
        toggle={toggleDetail}
        data={selectedData}
      />
    </>
  );
};

export default TeachersTable;
