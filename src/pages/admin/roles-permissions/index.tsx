import React, { useMemo, useState } from 'react';
import { Card, CardHeader, CardBody, Container, Row } from 'reactstrap';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import RolesPermissionsTable from '../../../components/own/tables/roles-permissions-table';
import RolePermissionsForm from '../../../components/own/form/role-permissions-form';
import { getPermissionsByRole, updatePermissionsByRole } from '../../../../helper/api-data/permissions';
import useSWR, { mutate } from 'swr';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import { SelectOption } from 'Types/SelectType';
import { FiltersProps } from '../../../../Types/types';

const STATIC_ROLES = USER_ROLES.map((r, idx) => ({ id: idx + 1, name: r.value, status: 'active' }));

const PageRolesPermissions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleOpt, setSelectedRoleOpt] = useState<SelectOption | null>(null);
  const [selectedStatusOpt, setSelectedStatusOpt] = useState<SelectOption | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const { data: rolePerms } = useSWR(editingRole ? ['/permissions/by-role', editingRole] : null, () => getPermissionsByRole(editingRole!));

  const handleCreate = async (payload: any) => {
    if (!payload?.role_name) { setIsOpen(false); return; }
    await updatePermissionsByRole(payload.role_name, payload.permissions || []);
    mutate(['/permissions/me']);
    setIsOpen(false);
  };

  const roleOptions: SelectOption[] = useMemo(
    () => USER_ROLES.map((r) => ({ value: r.value, label: r.label.toUpperCase() })),
    []
  );

  const filtered = useMemo(() => {
    return STATIC_ROLES.filter((r) => {
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
                addButton={{ title: 'create role and permissions', onClick: () => setIsOpen(true) }}
              />
            </CardHeader>
            <CardBody>
              <RolesPermissionsTable
                data={filtered}
                loading={false}
                onView={(row: { name: string }) => { setEditingRole(row.name); setIsOpen(true); }}
                onEdit={(row: { name: string }) => { setEditingRole(row.name); setIsOpen(true); }}
              />
            </CardBody>
          </Card>
        </Row>
      </Container>
      <RolePermissionsForm isOpen={isOpen} toggle={() => setIsOpen(false)} onSubmit={handleCreate} data={editingRole ? { role_name: editingRole, status: 'active', permissions: (rolePerms?.data || []) } : null} />
    </div>
  );
};

export default PageRolesPermissions;

