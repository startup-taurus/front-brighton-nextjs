import React, { useMemo, useState, useEffect } from 'react';
import { Card, CardHeader, CardBody, Container, Row } from 'reactstrap';
import useSWR, { mutate } from 'swr';
import TableHeaderActions from '@/components/own/table-header-actions/table-header-actions';
import TableFilters from '@/components/own/table-filters/table-filters';
import RolesPermissionsTable from '../../../components/own/tables/roles-permissions-table';
import RolePermissionsForm from '../../../components/own/form/role-permissions-form';
import { useRouter } from 'next/router';
import { 
  getPermissionsByRole, 
  updatePermissionsByRole, 
  syncPermissionsCatalog
} from '../../../../helper/api-data/permissions';
import { getRoles, updateRoleMeta, createRole } from '../../../../helper/api-data/role';
import { STATUS_FILTER, FILTER_KEYS } from '../../../../utils/constants';
import { FiltersProps } from '../../../../Types/types';
import { getFiltersString } from '../../../../utils/utils';

const PageRolesPermissions = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<string | null>(null);
  const [isReloading, setIsReloading] = useState(false);
  const router = useRouter();

  const filters = getFiltersString(router);
  const { data: rolesResponse, isLoading: loadingRoles, isValidating } = useSWR([`/roles${filters ? `?${filters}` : ''}`], getRoles);

  const rolesData = useMemo(() => {
    return Array.isArray(rolesResponse?.data) ? rolesResponse.data : [];
  }, [rolesResponse]);

  const currentRole = useMemo(() => {
    if (!editingRole) return null;
    return rolesData.find((r: any) => String(r.name) === String(editingRole)) || null;
  }, [rolesData, editingRole]);

  useEffect(() => {
    syncPermissionsCatalog().then(() => {
      mutate([`/roles${filters ? `?${filters}` : ''}`]);
    }).catch(() => {});
  }, []);

  useEffect(() => {
    setIsReloading(true);
    mutate([`/roles${filters ? `?${filters}` : ''}`]);
    const t = setTimeout(() => setIsReloading(false), 500);
    return () => clearTimeout(t);
  }, [router.query.role, router.query.status]);

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
      if (!editingRole) {
        await createRole({ name: payload.role_name, status: payload.status });
      } else {
        await updateRoleMeta(editingRole, { name: payload.role_name, status: payload.status });
      }

      await updatePermissionsByRole(payload.role_name, payload.permissions || []);

      mutate(['/permissions/by-role', payload.role_name]);
      mutate(['/permissions/me']);
      mutate([`/roles${filters ? `?${filters}` : ''}`]);

      setIsOpen(false);
    } catch (error) {
    }
  };

  const roleOptions = useMemo(
    () => rolesData.map((r: any) => ({ value: String(r.name), label: String(r.name).toUpperCase() })),
    [rolesData]
  );
  const handleReload = async () => {
    setIsReloading(true);
    try {
      await mutate([`/roles${filters ? `?${filters}` : ''}`]);
    } finally {
      setTimeout(() => setIsReloading(false), 500);
    }
  };
  const roleFilter = typeof router.query.role === 'string' ? router.query.role : '';
  const statusFilter = typeof router.query.status === 'string' ? router.query.status : '';
  const filtered = useMemo(() => {
    return rolesData.filter((roleItem: any) => {
      const matchRole = roleFilter
        ? String(roleItem.name).toLowerCase() === String(roleFilter).toLowerCase()
        : true;
      const isActive = roleItem.status === 1 || roleItem.status === 'active' || roleItem.status === true;
      const statusString = isActive ? 'active' : 'inactive';
      const matchStatus = statusFilter
        ? statusString === String(statusFilter).toLowerCase()
        : true;
      return matchRole && matchStatus;
    });
  }, [rolesData, roleFilter, statusFilter]);

  const selectFilters: FiltersProps[] = [
    {
      labelName: 'Select a role',
      name: FILTER_KEYS.ROLE,
      type: 'select',
      items: roleOptions,
    },
    {
      labelName: 'Select Status',
      name: FILTER_KEYS.STATUS,
      type: 'select',
      items: STATUS_FILTER,
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
                onReload={handleReload} 
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
                loading={loadingRoles || isValidating || isReloading}
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