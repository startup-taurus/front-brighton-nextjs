import React from "react";
import DataTable from "react-data-table-component";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import CustomTable from "@/components/own/custom-table/custom-table";

const columns = [
  {
    name: "STUDENT",
    selector: (row: { student: any }) => row.student,
    sortable: true,
  },
  {
    name: "STATUS",
    selector: (row: { status: any }) => row.status,
    sortable: true,
    compact: true,
    width: "100px",
    cell: (row: any) => <div className="status-cell">{row.status}</div>,
  },
];

const data = [
  {
    id: 1,
    student: "PIERINA VALENTINA CEVALLOS MALDONADO",
    status: "ACTIVE",
  },
  {
    id: 2,
    student: "ENRIQUE LEONARDO GARCÍA CARRILLO",
    status: "ACTIVE",
  },
  {
    id: 3,
    student: "MATEO NICOLAS INTRIAGO BARRETO",
    status: "ACTIVE",
  },
  {
    id: 4,
    student: "MATÍAS AGUSTÍN VALERA ALMEIDA",
    status: "ACTIVE",
  },
  {
    id: 5,
    student: "JOAQUÍN CÉSAR MORENO TAMAYO",
    status: "ACTIVE",
  },
  {
    id: 6,
    student: "ARIANA VICTORIA MORENO TAMAYO",
    status: "ACTIVE",
  },
  {
    id: 7,
    student: "SABRINA DANIELA ANDRADE CARRASCO",
    status: "ACTIVE",
  },
];

const StudentTable = () => {
  return (
    <div className="table-container-student">
      <CustomTable columns={columns} data={data} />
      <div className="decorative-image-container">
        <Image
          className="decorative-image"
          src={`${ImgPath}/course/image-of-table.png`}
          alt="logo"
          layout="responsive"
          width={100}
          height={100}
        />
      </div>
    </div>
  );
};

export default StudentTable;
