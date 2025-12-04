import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Container, Row } from 'reactstrap';
import useSWR, { mutate } from 'swr';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import RolesPermissionsTable from '../../../components/own/tables/roles-permissions-table';
import RolePermissionsForm from '../../../components/own/form/role-permissions-form';
import { 
  getPermissionsByRole, 
  updatePermissionsByRole, 
  syncPermissionsCatalog
} from '../../../../helper/api-data/permissions';
import { getRoles } from '../../../../helper/api-data/role';
import { STATUS_FILTER, USER_ROLES } from '../../../../utils/constants';
import { SelectOption } from 'Types/SelectType';
import { FiltersProps } from '../../../../Types/types';

const PageRolesPermissions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedRoleOpt, setSelectedRoleOpt] = useState<SelectOption | null>(null);
  const [selectedStatusOpt, setSelectedStatusOpt] = useState<SelectOption | null>(null);
  const [editingRole, setEditingRole] = useState<string | null>(null);

  const { data: rolesResponse, isLoading: loadingRoles } = useSWR('/roles', getRoles);

  const rolesData = useMemo(() => {
    return Array.isArray(rolesResponse?.data) ? rolesResponse.data : [];
  }, [rolesResponse]);

  const currentRole = useMemo(() => {
    if (!editingRole) return null;
    return rolesData.find((r: any) => String(r.name) === String(editingRole)) || null;
  }, [rolesData, editingRole]);

  useEffect(() => {
    syncPermissionsCatalog().then(() => {
      mutate('/roles');
    }).catch(() => {});
  }, []);

  const { data: rolePerms } = useSWR(
    editingRole ? ['/permissions/by-role', editingRole] : null,
    () => getPermissionsByRole(editingRole!)
  );

  const handleCreate = async (payload: any) => {
    if (!payload?.role_name) {
      setIsOpen(false);
      return;
    }

    try {
      await updatePermissionsByRole(payload.role_name, payload.permissions || []);

       mutate(['/permissions/by-role', payload.role_name]);
       mutate(['/permissions/me']);
      
       mutate('/roles');

      setIsOpen(false);
    } catch (error) {
      console.error('Error updating permissions:', error);
    }
  };

  const roleOptions: SelectOption[] = useMemo(
    () => USER_ROLES.map((r) => ({ value: r.value, label: r.label.toUpperCase() })),
    []
  );

  const filtered = useMemo(() => {
    return rolesData.filter((r: any) => {
      const matchRole = selectedRoleOpt
        ? String(r.name).toUpperCase() === selectedRoleOpt.label.toUpperCase()
        : true;
      
      const isActive = r.status === 1 || r.status === 'active' || r.status === true;
      const statusString = isActive ? 'active' : 'inactive';
      
      const matchStatus = selectedStatusOpt
        ? statusString === String(selectedStatusOpt.value).toLowerCase()
        : true;
      
      return matchRole && matchStatus;
    });
  }, [rolesData, selectedRoleOpt, selectedStatusOpt]);

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
                onReload={() => mutate('/roles')} 
                addButton={{
                  title: 'create role and permissions',
                  onClick: () => {
                    setEditingRole(null);
                    setIsOpen(true);
                  },
                }}
              />
            </CardHeader>
            <CardBody>
              <RolesPermissionsTable
                data={filtered} 
                loading={loadingRoles}
                onView={(row: { name: string }) => {
                  setEditingRole(row.name);
                  setIsOpen(true);
                }}
                onEdit={(row: { name: string }) => {
                  setEditingRole(row.name);
                  setIsOpen(true);
                }}
              />
            </CardBody>
          </Card>
        </Row>
      </Container>
      <RolePermissionsForm
        isOpen={isOpen}
        toggle={() => setIsOpen(false)}
        onSubmit={handleCreate}
        data={
          editingRole
            ? {
                role_name: editingRole,
                status:
                  currentRole && (currentRole.status === 1 || currentRole.status === 'active' || currentRole.status === true)
                    ? 'active'
                    : 'inactive',
                permissions: rolePerms?.data || [],
              }
            : null
        }
      />
    </div>
  );
};

export default PageRolesPermissions;