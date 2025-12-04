import React from 'react';
import DataTable, { TableColumn } from 'react-data-table-component';
import TableActionButtons from '../table-action-buttons/table-action-buttons';
import { formatDateLocale } from '../../../../utils/utils';

const RolesPermissionsTable = ({ data = [], loading = false, onView, onEdit }: any) => {
  const columns: TableColumn<any>[] = [
    {
      name: 'Actions',
      width: '140px',
      cell: (row) => (
        <TableActionButtons
          onView={() => onView(row)}
          onEdit={() => onEdit(row)}
        />
      ),
    },
    {
      name: 'Roles',
      selector: (row) => String(row.name || '').toUpperCase(),
      sortable: true,
    },
    {
      name: 'Status',
      selector: (row) => {
        const v = row?.status;
        return v === 1 || v === '1' || v === true || String(v).toLowerCase() === 'active' ? 'active' : 'inactive';
      },
      sortable: true,
      width: '140px',
      cell: (row) => {
        const isActive = row?.status === 1 || row?.status === '1' || row?.status === true || String(row?.status).toLowerCase() === 'active';
        return (
          <span className={`badge ${isActive ? 'badge-light-success' : 'badge-light-secondary'}`}>
            {isActive ? 'active' : 'inactive'}
          </span>
        );
      },
    },
    {
      name: 'Created At',
      selector: (row) => row.created_at || '',
      cell: (row) => (row.created_at ? formatDateLocale(row.created_at) : '-'),
      sortable: true,
    },
    {
      name: 'Last Update',
      selector: (row) => row.updated_at || '',
      cell: (row) => (row.updated_at ? formatDateLocale(row.updated_at) : '-'),
      sortable: true,
    },
  ];

  return (
    <div className='table-responsive signal-table'>
      <DataTable
        data={Array.isArray(data) ? data : []}
        columns={columns}
        progressPending={loading}
        highlightOnHover
        pagination
      />
    </div>
  );
};

export default RolesPermissionsTable;