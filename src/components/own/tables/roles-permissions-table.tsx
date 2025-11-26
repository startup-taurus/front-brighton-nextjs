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
      selector: (row) => String(row.status || 'active'),
      sortable: true,
      width: '140px',
      cell: (row) => (
        <span className={`badge ${String(row.status || 'active') === 'active' ? 'badge-light-success' : 'badge-light-secondary'}`}>
          {String(row.status || 'active')}
        </span>
      ),
    },
    {
      name: 'Created At',
      selector: (row) => row.created_at || '',
      cell: (row) => formatDateLocale(row.created_at || '') || '',
      sortable: true,
    },
    {
      name: 'Last Login',
      selector: (row) => row.last_login || '',
      cell: (row) => formatDateLocale(row.last_login || '') || '',
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

