import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, Container, Row } from 'reactstrap';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import RolesPermissionsTable from '../../../components/own/tables/roles-permissions-table';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import { SelectOption } from 'Types/SelectType';
import { FiltersProps } from '../../../../Types/types';

const mockRoles = [
  { id: 1, name: 'coordinator', status: 'active', created_at: '2025-11-14T13:59:50', last_login: '2025-11-19T19:00:00' },
  { id: 2, name: 'receptionist', status: 'active', created_at: '2025-11-12T16:52:40', last_login: '1999-12-31T07:00:00' },
];

const PageRolesPermissions = () => {
  const [selectedRoleOpt, setSelectedRoleOpt] = useState<SelectOption | null>(null);
  const [selectedStatusOpt, setSelectedStatusOpt] = useState<SelectOption | null>(null);

  const roleOptions: SelectOption[] = useMemo(
    () => USER_ROLES.map((r) => ({ value: r.value, label: r.label.toUpperCase() })),
    []
  );

  const filtered = useMemo(() => {
    return mockRoles.filter((r) => {
      const matchRole = selectedRoleOpt
        ? r.name.toUpperCase() === selectedRoleOpt.label.toUpperCase()
        : true;
      const matchStatus = selectedStatusOpt
        ? String(r.status || 'active').toLowerCase() === String(selectedStatusOpt.value).toLowerCase()
        : true;
      return matchRole && matchStatus;
    });
  }, [selectedRoleOpt, selectedStatusOpt]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Select a role',
      name: 'role',
      type: 'select',
      value: selectedRoleOpt,
      items: roleOptions,
      onChange: setSelectedRoleOpt,
    },
    {
      labelName: 'Select Status',
      name: 'status',
      type: 'select',
      value: selectedStatusOpt,
      items: STATUS_FILTER,
      onChange: setSelectedStatusOpt,
    },
  ];

  return (
    <div className='page-body'>
      <Container className='basic_table' fluid>
        <Row>
          <TableFilters selectFilters={selectFilters} />
        </Row>
        <Row>
          <Card>
            <CardHeader className='d-flex justify-content-end'>
              <TableHeaderActions
                onReload={() => {}}
                addButton={{ title: 'create role and permissions', onClick: () => {} }}
              />
            </CardHeader>
            <CardBody>
              <RolesPermissionsTable
                data={filtered}
                loading={false}
                onView={() => {}}
                onEdit={() => {}}
              />
            </CardBody>
          </Card>
        </Row>
      </Container>
    </div>
  );
};

export default PageRolesPermissions;

