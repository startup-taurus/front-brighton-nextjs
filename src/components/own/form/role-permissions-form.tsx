import React, { useMemo, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, Label, Input, Button } from 'reactstrap';
import { Formik } from 'formik';
import { toast } from 'react-toastify';
import LoadingButton from '../common/loading-button/LoadingButton';
import { STATUS } from 'utils/constants';
import { PERMISSION_MODULES } from 'utils/permissions';

type Props = {
  isOpen: boolean;
  toggle: () => void;
  onSubmit: (data: any) => Promise<void> | void;
  data?: { role_name: string; status: string; permissions: string[] } | null;
};

const RolePermissionsForm = ({ isOpen, toggle, onSubmit, data }: Props) => {
  const modules = useMemo(() => Object.keys(PERMISSION_MODULES), []);
  const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});

  const formatPermissionLabel = (key: string) =>
    key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

  const initialValues = {
    role_name: data?.role_name || '',
    status: data?.status || STATUS.ACTIVE,
    selected_permissions: data?.permissions || [],
  };

  const validate = (values: any) => {
    const errors: any = {};
    if (!values.role_name || String(values.role_name).trim() === '') {
      errors.role_name = 'Role name is required';
    }
    if (!values.status) {
      errors.status = 'Status is required';
    }
    return errors;
  };

  const isModuleAllSelected = (values: any, module: string) => {
    const perms = PERMISSION_MODULES[module] || [];
    return perms.length > 0 && perms.every((p) => values.selected_permissions.includes(p));
  };

  const toggleModuleSelectAll = (values: any, setFieldValue: any, module: string) => {
    const perms = PERMISSION_MODULES[module] || [];
    const allSelected = isModuleAllSelected(values, module);
    if (allSelected) {
      setFieldValue(
        'selected_permissions',
        values.selected_permissions.filter((p: string) => !perms.includes(p))
      );
    } else {
      const merged = new Set<string>([...values.selected_permissions, ...perms]);
      setFieldValue('selected_permissions', Array.from(merged));
    }
  };

  const toggleCollapse = (module: string) =>
    setCollapsed((prev) => ({ ...prev, [module]: !prev[module] }));

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {data ? 'Edit role and permissions' : 'Add role and permissions'}
      </ModalHeader>
      <ModalBody>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={validate}
          onSubmit={async (values, helpers) => {
            if (!values.role_name || !values.status) {
              toast.error('Please fill in the required fields');
              helpers.setSubmitting(false);
              return;
            }

            try {
              await onSubmit({
                role_name: values.role_name.trim(),
                status: values.status,
                permissions: values.selected_permissions,
              });

              toast.success(
                data
                  ? 'Role permissions updated successfully'
                  : 'New role created successfully'
              );

              toggle();
            } catch (error) {
              console.error(error);
              toast.error('Error saving role permissions');
            } finally {
              helpers.setSubmitting(false);
            }
          }}
        >
          {(props) => {
            const { values, errors, touched, handleSubmit, setFieldValue, isSubmitting } = props;

            return (
              <form noValidate onSubmit={handleSubmit}>
                <Row className="mb-3">
                  <Col md={6}>
                    <Label className="fw-bold fs-6">Role Name</Label>
                    <Input
                      value={values.role_name}
                      onChange={(e) => setFieldValue('role_name', e.target.value)}
                      invalid={touched.role_name && !!errors.role_name}
                      placeholder="Enter role name"
                    />
                  </Col>
                  <Col md={6}>
                    {/* CAMBIO: Clases fw-bold y fs-5 */}
                    <Label className="fw-bold fs-6">Status</Label>
                    <Input
                      type="select"
                      value={values.status}
                      onChange={(e) => setFieldValue('status', e.target.value)}
                    >
                      <option value={STATUS.ACTIVE}>Active</option>
                      <option value={STATUS.INACTIVE}>Inactive</option>
                    </Input>
                  </Col>
                </Row>

                <Label className="mt-2 fw-bold fs-6">Permissions</Label>
                
                <Row className="mt-2">
                  {modules.map((module) => {
                    const perms = PERMISSION_MODULES[module] || [];
                    const collapsedModule = !!collapsed[module];
                    const allSelected = isModuleAllSelected(values, module);

                    return (
                      <Col md={6} key={module} className="mb-3">
                        <div className="p-2 border rounded">
                          <div className="d-flex justify-content-between align-items-center mb-2">
                            <strong>{module}</strong>
                            <div className="d-flex align-items-center gap-2">
                              <Input
                                type="checkbox"
                                checked={allSelected}
                                onChange={() => toggleModuleSelectAll(values, setFieldValue, module)}
                              />
                              
                              {/* CAMBIO: Botón limpio (color="link") sin bordes, solo la flecha */}
                              <Button
                                size="sm"
                                color="link" 
                                className="text-decoration-none text-dark p-0"
                                style={{ fontSize: '1.2rem', lineHeight: 1, width: '24px' }}
                                onClick={() => toggleCollapse(module)}
                              >
                                {collapsedModule ? '▸' : '▾'}
                              </Button>
                            </div>
                          </div>

                          {!collapsedModule && (
                            <div>
                              {perms.map((perm) => {
                                const checked = values.selected_permissions.includes(perm);
                                return (
                                  <div key={perm} className="form-check mb-1">
                                    <Input
                                      type="checkbox"
                                      className="form-check-input"
                                      id={`${module}-${perm}`}
                                      checked={checked}
                                      onChange={() => {
                                        if (checked) {
                                          setFieldValue(
                                            'selected_permissions',
                                            values.selected_permissions.filter((p: string) => p !== perm)
                                          );
                                        } else {
                                          setFieldValue('selected_permissions', [
                                            ...values.selected_permissions,
                                            perm,
                                          ]);
                                        }
                                      }}
                                    />
                                    <Label
                                      className="form-check-label"
                                      htmlFor={`${module}-${perm}`}
                                    >
                                      {formatPermissionLabel(perm)}
                                    </Label>
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      </Col>
                    );
                  })}
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  &nbsp;&nbsp;
                  <LoadingButton
                    color="primary"
                    type="submit"
                    isLoading={isSubmitting}
                    loadingText={data ? 'Updating...' : 'Saving...'}
                    defaultText={data ? 'Update' : 'Save'}
                  />
                </div>
              </form>
            );
          }}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default RolePermissionsForm;