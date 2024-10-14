import React from "react";
import Image from "next/image";
import { ImgPath } from "utils/Constant";
import CustomTable from "@/components/own/custom-table/custom-table";

const columns = [
  {
    name: "STUDENT",
    selector: (row: { name: any }) => row?.name,
    sortable: true,
  },
  {
    name: "STATUS",
    selector: (row: { status: any }) => row.status,
    sortable: true,
    compact: true,
    width: "100px",
    cell: (row: any) => (
      <div className="status-cell text-uppercase">{row.status}</div>
    ),
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

const StudentTable = ({ students }: any) => {
  return (
    <div className="table-container-student">
      <CustomTable columns={columns} data={students} />
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
