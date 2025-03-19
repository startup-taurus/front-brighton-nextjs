import React, { useState } from 'react';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import TableActionButtons from '@/components/own/table-action-buttons/table-action-buttons';
import Swal from 'sweetalert2';
import StudentForm from '../form/student-form';
import DataTable from 'react-data-table-component';
import { setQueryStringValue } from '../../../../utils/utils';
import { deleteRegisteredStudent } from '../../../../helper/api-data/registered-student';
import RegisteredStudentDetail from '@/components/own/registered-student-detail/registered-student-detail';
import { toast } from 'react-toastify';

const StudentsRegisteredTable = ({
  students,
  page,
  rowPerPage,
  filters,
  loading,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);

  const toggleStudentForm = (data: any) => {
    setSelectedStudent({
      user: {
        id: data?.id,
        name: `${data?.first_name} ${data?.middle_name} ${data?.last_name} ${data?.second_last_name}`,
        lastName: '',
        email: data?.email,
      },
      age_category: data?.age_category,
      courseId: '',
      cedula: data?.id_number,
      birth_date: data?.birthday,
      level: data?.level,
      status: 'active',
      bookGiven: false,
      pendingPayments: false,
      emergency_contact_name: data?.emergency_contact_name || '',
      emergency_contact_phone: data?.emergency_contact_phone || '',
      emergency_contact_relationship: data?.emergency_contact_relationship || '',
      promotion: 'Page',
      observations: '',
    });

    setIsOpen(!isOpen);
    if (isOpen) {
      mutate([
        `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
      ]);
    }
  };

  const toggleDetail = (data: any) => {
    setSelectedData(data);
    setIsOpenDetail(!isOpenDetail);
  };

  const handleDelete = (row: any) => {
    Swal.fire({
      title: 'Are you sure you want to delete this record?',
      text: 'This action cannot be reversed',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Yes, delete!',
      cancelButtonText: 'Cancel',
      reverseButtons: true,
    }).then((result) => {
      if (result.isConfirmed) {
        deleteRegisteredStudent(row.id).then(() => {
          toast.success('Student deleted correctly!');
          mutate([
            `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
          ]);
        });
      }
    });
  };

  const onDelete = (id: any) => {
    deleteRegisteredStudent(id).then(() => {
      mutate([
        `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`,
      ]);
    });
  };

  if (!students?.data?.result) return null;

  const columns = [
    {
      name: 'Acción',
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggleDetail(row)}
          onTransfer={() => toggleStudentForm(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
      minWidth: '180px',
      sortable: false,
      center: false,
    },
    {
      name: 'ID',
      selector: (row: any) => `${row.id_number}`,
      sortable: true,
      center: false,
    },
    {
      name: 'Student name',
      selector: (row: any) =>
        `${row.first_name} ${row.middle_name} ${row.last_name} ${row.second_last_name}`,
      sortable: true,
      center: false,
    },
    {
      name: 'Phone',
      selector: (row: any) => `${row.phone_number}`,
      sortable: true,
      center: false,
    },
    {
      name: 'Email',
      selector: (row: any) => `${row.email ?? ''}`,
      sortable: true,
      center: false,
    },
    {
      name: 'Level',
      selector: (row: any) => `${row.level ?? ''}`,
      sortable: true,
      center: false,
    },
    {
      name: 'emergency contact name',
      selector: (row: any) => `${row.emergency_contact_name?? ''}`,
      sortable: true,
      center: false,
    },
    {
      name: 'emergency contact phone',
      selector: (row: any) => `${row.emergency_contact_phone?? ''}`,
      sortable: true,
      center: false,
    },
    {
      name: 'emergency contact relationship',
      selector: (row: any) => `${row.emergency_contact_relationship?? ''}`,
      sortable: true,
      center: false,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        columns={columns}
        data={students?.data.result}
        pagination
        paginationServer
        progressPending={loading}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        paginationTotalRows={students.data.totalCount}
        onChangePage={(page) => setQueryStringValue('page', page, router)}
        onChangeRowsPerPage={(newPerPage) =>
          setQueryStringValue('rowPerPage', newPerPage, router)
        }
        highlightOnHover
        selectableRows={false}
      />
      {isOpen && (
        <StudentForm
          isOpen={isOpen}
          toggle={toggleStudentForm}
          data={selectedStudent}
          onSuccessCreate={onDelete}
          isTransfer
        />
      )}
      {isOpenDetail && (
        <RegisteredStudentDetail
          isOpen={isOpenDetail}
          toggle={toggleDetail}
          data={selectedData}
        />
      )}
    </div>
  );
};

export default StudentsRegisteredTable;
