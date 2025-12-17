import React, { useMemo, useState } from 'react';
import { Modal, ModalHeader, ModalBody, Row, Col, Label, Input, Button, AccordionItem, AccordionHeader, AccordionBody, UncontrolledAccordion } from 'reactstrap';
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
  readOnly?: boolean;
};

const RolePermissionsForm = ({ isOpen, toggle, onSubmit, data, readOnly = false }: Props) => {
  const modules = useMemo(() => Object.keys(PERMISSION_MODULES), []);

  const formatPermissionLabel = (key: string) => {
    const overrides: Record<string, string> = {
      transfer_student: 'Create Transfer Students',
      add_grades: 'Add Assignments',
    };
    if (overrides[key]) return overrides[key];
    return key.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  };

  const initialValues = {
    role_name: data?.role_name || '',
    status: data?.status || STATUS.ACTIVE,
    selected_permissions: data?.permissions || [],
  };

  const validate = (values: any) => {
    const errors: any = {};
    if (readOnly) return errors;
    if (!values.role_name || String(values.role_name).trim() === '') {
      errors.role_name = 'Role name is required';
    }
    if (!values.status) {
      errors.status = 'Status is required';
    }
    return errors;
  };

  const isModuleAllSelected = (values: any, module: string, visiblePerms: string[]) => {
    const perms = visiblePerms || [];
    return perms.length > 0 && perms.every((p) => values.selected_permissions.includes(p));
  };

  const toggleModuleSelectAll = (values: any, setFieldValue: any, module: string, visiblePerms: string[]) => {
    if (readOnly) return;
    const perms = visiblePerms || [];
    const allSelected = isModuleAllSelected(values, module, perms);
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

  const toggleAccordion = (_id: string) => {};

  const getVisiblePermsForModule = (roleName: string, module: string) => {
    const rn = String(roleName || '').trim().toLowerCase();
    const isProfessor = rn === 'professor';
    const base = PERMISSION_MODULES[module] || [];
    const allowedProf = new Set<string>([
      'view_dashboard',
      'view_courses',
      'view_syllabus',
      'view_attendance',
      'mark_attendance',
      'view_gradebook',
      'add_grades',
      'edit_grades',
      'view_holidays',
      'view_cancelled_lessons',
      'create_cancelled_lesson',
      'view_student_reports',
      'create_student_report',
      'edit_student_report',
    ]);
    return isProfessor ? base.filter((p) => allowedProf.has(p)) : base;
  };

  return (
    <Modal isOpen={isOpen} toggle={toggle} size="lg" centered>
      <ModalHeader toggle={toggle}>
        {data ? (readOnly ? 'View role and permissions' : 'Edit role and permissions') : 'Add role and permissions'}
      </ModalHeader>
      <ModalBody>
        <Formik
          enableReinitialize
          initialValues={initialValues}
          validate={validate}
          onSubmit={async (values, helpers) => {
            if (readOnly) {
              helpers.setSubmitting(false);
              return;
            }
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
                      disabled={readOnly}
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
                      disabled={readOnly}
                      onChange={(e) => setFieldValue('status', e.target.value)}
                    >
                      <option value={STATUS.ACTIVE}>Active</option>
                      <option value={STATUS.INACTIVE}>Inactive</option>
                    </Input>
                  </Col>
                </Row>

                <Label className="mt-2 fw-bold fs-6">Permissions</Label>
                
                <Row className="mt-2">
                  {(() => {
                    const filteredModules = modules.filter((module) => {
                      const rn = String(values.role_name || '').trim().toLowerCase();
                      const isProfessor = rn === 'professor';
                      if (isProfessor && module === 'Courses') return false;
                      const visible = getVisiblePermsForModule(values.role_name, module);
                      return visible.length > 0;
                    });
                    const mid = Math.ceil(filteredModules.length / 2);
                    const left = filteredModules.slice(0, mid);
                    const right = filteredModules.slice(mid);

                    const renderAccordionCol = (list: string[]) => (
                      <UncontrolledAccordion stayOpen className="w-100">
                        {list.map((module) => {
                          const visiblePerms = getVisiblePermsForModule(values.role_name, module);
                          const allSelected = isModuleAllSelected(values, module, visiblePerms);
                          return (
                            <AccordionItem key={module}>
                              <AccordionHeader targetId={module}>
                                <div className="d-flex justify-content-between align-items-center w-100">
                                  <strong>{module}</strong>
                                  <Input
                                    type="checkbox"
                                    disabled={readOnly}
                                    checked={allSelected}
                                    onChange={() => toggleModuleSelectAll(values, setFieldValue, module, visiblePerms)}
                                  />
                                </div>
                              </AccordionHeader>
                              <AccordionBody accordionId={module}>
                                {visiblePerms.map((perm) => {
                                  const checked = values.selected_permissions.includes(perm);
                                  return (
                                    <div key={perm} className="form-check mb-1">
                                      <Input
                                        type="checkbox"
                                        className="form-check-input"
                                        id={`${module}-${perm}`}
                                        checked={checked}
                                        disabled={readOnly}
                                        onChange={() => {
                                          if (readOnly) return;
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
                                      <Label className="form-check-label" htmlFor={`${module}-${perm}`}>
                                        {formatPermissionLabel(perm)}
                                      </Label>
                                    </div>
                                  );
                                })}
                              </AccordionBody>
                            </AccordionItem>
                          );
                        })}
                      </UncontrolledAccordion>
                    );

                    return (
                      <>
                        <Col md={6} className="mb-3">{renderAccordionCol(left)}</Col>
                        <Col md={6} className="mb-3">{renderAccordionCol(right)}</Col>
                      </>
                    );
                  })()}
                </Row>

                <div className="d-flex justify-content-end mt-4">
                  <Button color="secondary" onClick={toggle} disabled={isSubmitting}>
                    Cancel
                  </Button>
                  &nbsp;&nbsp;
                  {!readOnly && (
                    <LoadingButton
                      color="primary"
                      type="submit"
                      isLoading={isSubmitting}
                      loadingText={data ? 'Updating...' : 'Saving...'}
                      defaultText={data ? 'Update' : 'Save'}
                    />
                  )}
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
