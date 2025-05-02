import React from 'react';
import Image from 'next/image';
import { ImgPath } from 'utils/Constant';
import CustomTable from '@/components/own/custom-table/custom-table';

const columns = [
  {
    name: 'STUDENT',
    selector: (row: { name: any }) => row?.name,
    sortable: true,
  },

  {
    name: 'STATUS',
    selector: (row: any) => {
      if (row.status === 'active') {
        return row.is_retired ? 'Retired' : 'Active';
      }
      return 'Inactive';
    },
    sortable: true,
    compact: true,
    width: '100px',
    cell: (row: any) => {
      const text =
        row.status === 'active'
          ? row.is_retired
            ? 'Retired'
            : 'Active'
          : 'Inactive';
      return <div className='status-cell text-uppercase'>{text}</div>;
    },
  },
];

const StudentTable = ({ students }: any) => {
  return (
    <div className='table-container-student'>
      <CustomTable
        columns={columns}
        data={students}
      />
      <div className='decorative-image-container'>
        <Image
          className='decorative-image'
          src={`${ImgPath}/course/image-of-table.png`}
          alt='logo'
          layout='responsive'
          width={100}
          height={100}
        />
      </div>
    </div>
  );
};

export default StudentTable;
