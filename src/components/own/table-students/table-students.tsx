import React from "react";
import DataTable from "react-data-table-component";
import Image from "next/image";
import { ImgPath } from "utils/Constant";

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
    compact : true,
    width: "100px",
    cell: (row: {
      status:
        | string
        | number
        | boolean
        | React.ReactElement<any, string | React.JSXElementConstructor<any>>
        | Iterable<React.ReactNode>
        | React.ReactPortal
        | null
        | undefined;
    }) => <div className="status-cell">{row.status}</div>,
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
      <DataTable
        columns={columns}
        data={data}
        customStyles={customStyles}
        className="border-table"
        highlightOnHover
      />
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

const customStyles = {
  headCells: {
    style: {
      backgroundColor: "#F9A825",
      fontWeight: "bold",
      fontSize: "16px",
      color: "#ffffff",
      paddingTop: '0px',  
    },
  },

  cells: {
    style: {
      padding: "10px",
    },
  },
  rows: {
    style: {
        minHeight: '25px',
    },
},
};

export default StudentTable;
