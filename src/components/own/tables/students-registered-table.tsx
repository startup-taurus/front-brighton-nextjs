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
import TableSkeleton from '../common/table-skeleton/TableSkeleton';

const StudentsRegisteredTable = ({
  students,
  page,
  rowPerPage,
  filters,
  loading,
  onReload,
}: any) => {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isOpenDetail, setIsOpenDetail] = useState(false);
  const [selectedData, setSelectedData] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isChangingPage, setIsChangingPage] = useState(false);

  const key = `/registered-student/get-all?page=${page}&rowPerPage=${rowPerPage}${filters ? `&${filters}` : ''}`;

  const toggleStudentForm = (data: any) => {
    setSelectedStudent({
      user: {
        id: data?.id,
        name: `${data?.first_name} ${data?.middle_name} ${data?.last_name} ${data?.second_last_name}`,
        lastName: '',
        email: data?.email,
      },
      phone_number: data?.phone_number,
      age_category: data?.age_category,
      courseId: '',
      cedula: data?.id_number,
      birth_date: data?.birthday,
      level_id: data?.level?.id,
      status: 'active',
      book_given: 'false',
      pendingPayments: false,
      emergency_contact_name: data?.emergency_contact_name || '',
      emergency_contact_phone: data?.emergency_contact_phone || '',
      emergency_contact_relationship:
        data?.emergency_contact_relationship || '',
      promotion: 'Page',
      observations: '',
    });

    setIsOpen(!isOpen);
    if (isOpen) {
      mutate(key);
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
        setIsDeleting(true);
        deleteRegisteredStudent(row.id).then(() => {
          toast.success('Student deleted correctly!');
          mutate(key).finally(() => {
            setTimeout(() => setIsDeleting(false), 500);
          });
        }).catch(() => {
          setIsDeleting(false);
        });
      }
    });
  };

  const onDelete = (id: any) => {
    setIsDeleting(true);
    deleteRegisteredStudent(id).then(() => {
      mutate(key).finally(() => {
        setTimeout(() => setIsDeleting(false), 500);
      });
    }).catch(() => {
      setIsDeleting(false);
    });
  };

  const handlePageChange = (newPage: number) => {
    setIsChangingPage(true);
    setQueryStringValue('page', newPage, router);
    setTimeout(() => setIsChangingPage(false), 800);
  };

  const handleRowsPerPageChange = (newPerPage: number) => {
    setIsChangingPage(true);
    setQueryStringValue('rowPerPage', newPerPage, router);
    setTimeout(() => setIsChangingPage(false), 800);
  };

  const isLoadingData = loading || isDeleting || isChangingPage;

  if (isLoadingData) {
    return (
      <TableSkeleton rows={10} columns={8} showHeader={true} animated={true} />
    );
  }

  if (!students?.data?.result) return null;

  const columns = [
    {
      name: 'Actions',
      cell: (row: any) => (
        <TableActionButtons
          onView={() => toggleDetail(row)}
          onTransfer={() => toggleStudentForm(row)}
          onDelete={() => handleDelete(row)}
        />
      ),
      width: '160px',
      minWidth: '160px',
      maxWidth: '160px',
      sortable: false,
      center: true,
    },
    {
      name: 'ID',
      selector: (row: any) => `${row.id_number}`.toUpperCase(),
      sortable: true,
      center: true,
      width: '120px',
      minWidth: '120px',
    },
    {
      name: 'Student name',
      selector: (row: any) =>
        `${row.first_name} ${row.middle_name} ${row.last_name} ${row.second_last_name}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Phone',
      selector: (row: any) => `${row.phone_number}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Email',
      selector: (row: any) => `${row.email ?? ''}`,
      sortable: true,
      center: true,
    },
    {
      name: 'Level',
      selector: (row: any) => `${row.level?.name ?? ''}`.toUpperCase(),
      sortable: true,
      center: true,
    },
    {
      name: 'Emergency contact name',
      sortable: true,
      center: true,
      wrap: true,
      minWidth: '180px',
      selector: (row: any) => row.emergency_contact_name,
    },
    {
      name: 'Emergency contact phone',
      sortable: true,
      center: true,
      wrap: true,
      minWidth: '160px',
      selector: (row: any) => row.emergency_contact_phone,
    },
    {
      name: 'Emergency contact relationship',
      sortable: true,
      center: true,
      wrap: true,
      minWidth: '200px',
      selector: (row: any) => row.emergency_contact_relationship,
    },
  ];

  return (
    <div className="table-responsive signal-table">
      <DataTable
        columns={columns}
        data={students?.data.result}
        pagination
        paginationServer
        progressPending={isLoadingData}
        paginationDefaultPage={page ?? 1}
        paginationPerPage={rowPerPage ?? 10}
        paginationTotalRows={students.data.totalCount}
        onChangePage={handlePageChange}
        onChangeRowsPerPage={handleRowsPerPageChange}
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