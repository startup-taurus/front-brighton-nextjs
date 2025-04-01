import React from 'react';
import { Button } from 'reactstrap';
import PermissionGuard from './PermissionGuard';
import { PERMISSIONS } from '../../utils/permissions';

const PermissionExample: React.FC = () => {
  return (
    <div className='permission-example-container'>
      <h2>Role-Based Access Control Example</h2>
      <PermissionGuard permission={PERMISSIONS.VIEW_STUDENTS}>
        <div className='card mb-3'>
          <div className='card-body'>
            <h4>Student Management</h4>
            <p>
              This section is visible to users with the VIEW_STUDENTS
              permission.
            </p>
            <PermissionGuard permission={PERMISSIONS.CREATE_STUDENT}>
              <Button
                color='primary'
                className='me-2'
              >
                Add New Student
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.EDIT_STUDENT}>
              <Button
                color='secondary'
                className='me-2'
              >
                Edit Student
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.DELETE_STUDENT}>
              <Button color='danger'>Delete Student</Button>
            </PermissionGuard>
          </div>
        </div>
      </PermissionGuard>

      <PermissionGuard
        anyPermissions={[
          PERMISSIONS.VIEW_GRADEBOOK,
          PERMISSIONS.ADD_GRADES,
          PERMISSIONS.EDIT_GRADES,
        ]}
      >
        <div className='card mb-3'>
          <div className='card-body'>
            <h4>Gradebook Access</h4>
            <p>
              This section is visible to users with ANY gradebook-related
              permission.
            </p>

            <PermissionGuard permission={PERMISSIONS.ADD_GRADES}>
              <Button
                color='success'
                className='me-2'
              >
                Add Grades
              </Button>
            </PermissionGuard>

            <PermissionGuard permission={PERMISSIONS.EDIT_GRADES}>
              <Button color='warning'>Edit Grades</Button>
            </PermissionGuard>
          </div>
        </div>
      </PermissionGuard>

      <PermissionGuard
        allPermissions={[PERMISSIONS.VIEW_COURSES, PERMISSIONS.CREATE_COURSE]}
      >
        <div className='card mb-3'>
          <div className='card-body'>
            <h4>Course Administration</h4>
            <p>
              This section requires BOTH view and create course permissions.
            </p>
            <Button color='info'>Manage Courses</Button>
          </div>
        </div>
      </PermissionGuard>

      <PermissionGuard
        permission={PERMISSIONS.VIEW_FINANCIAL_REPORTS}
        fallback={
          <div className='card mb-3 bg-light'>
            <div className='card-body'>
              <h4>Financial Reports</h4>
              <p className='text-muted'>
                You don't have permission to view financial reports.
              </p>
              <p className='text-muted'>
                Please contact an administrator if you need access.
              </p>
            </div>
          </div>
        }
      >
        <div className='card mb-3'>
          <div className='card-body'>
            <h4>Financial Reports</h4>
            <p>
              This section is only visible to users with financial report
              access.
            </p>
            <Button color='primary'>View Reports</Button>
          </div>
        </div>
      </PermissionGuard>
    </div>
  );
};

export default PermissionExample;
