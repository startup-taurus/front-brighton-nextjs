import React, { useContext } from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import LoadingButton from '../common/loading-button/LoadingButton';
import { createHoliday, updateHoliday } from 'helper/api-data/holidays';
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';
import { toast } from 'react-toastify';
import { USER_TYPES } from 'utils/constants';

const HolidayForm = ({ data, isOpen, toggle }: any) => {
  const { user } = useContext(UserContext);
  const { can } = usePermission();
  const isCoordinator = user?.role === USER_TYPES.COORDINATOR;
  const canCreateHoliday = can(PERMISSIONS.CREATE_HOLIDAY);
  const canEditHoliday = can(PERMISSIONS.EDIT_HOLIDAY);
  const save = async (data: any) => {
    if (isCoordinator && !canCreateHoliday) {
      toast.error('Coordinators do not have permission to create holidays');
      return;
    }
    try {
      const response = await createHoliday(data);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error('Error creating holiday:', error);
    }
  };

  const update = async (data: any) => {
    if (isCoordinator && !canEditHoliday) {
      toast.error('Coordinators do not have permission to edit holidays');
      return;
    }
    try {
      const response = await updateHoliday(data.id, data);
      if (response.statusCode === 200) {
        toggle();
      }
    } catch (error) {
      console.error('Error updating holiday:', error);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {data ? 'Edit Holiday' : 'Add New Holiday'}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  id: data.id,
                  holiday_name: data.holiday_name,
                  holiday_date: data.holiday_date,
                  description: data.description,
                  holiday_type: data.holiday_type,
                  status: data.status,
                }
              : {
                  holiday_name: '',
                  holiday_date: '',
                  description: '',
                  holiday_type: 'national',
                  status: 'active',
                }
          }
          onSubmit={(info) => (data ? update(info) : save(info))}
        >
          {(props) => {
            const { errors, handleSubmit, isSubmitting, dirty } = props;
            return (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className='row g-3'
              >
                <Col xs={6}>
                  <Label for='holiday_name'>Holiday Name</Label>
                  <Field
                    name='holiday_name'
                    as={Input}
                  />
                  <ErrorMessage
                    name='holiday_name'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='holiday_date'>Holiday Date</Label>
                  <Field
                    name='holiday_date'
                    as={Input}
                    type='date'
                  />
                  <ErrorMessage
                    name='holiday_date'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12}>
                  <Label for='description'>Description</Label>
                  <Field
                    name='description'
                    as={Input}
                    type='textarea'
                  />
                  <ErrorMessage
                    name='description'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='holiday_type'>Holiday Type</Label>
                  <Field
                    name='holiday_type'
                    as={Input}
                    type='select'
                  >
                    <option value='national'>National</option>
                    <option value='regional'>Regional</option>
                    <option value='local'>Local</option>
                  </Field>
                  <ErrorMessage
                    name='holiday_type'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='status'>Status</Label>
                  <Field
                    name='status'
                    as={Input}
                    type='select'
                    id='studentFilter'
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select status of student
                    </option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </Field>
                  <ErrorMessage
                    name='status'
                    component={FormFeedback}
                  />
                </Col>
                <Col
                  xs={12}
                  className='d-flex justify-content-end mt-5'
                >
                  <Button
                    color='cancel'
                    onClick={toggle}
                  >
                    Close
                  </Button>
                  &nbsp; &nbsp;
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isSubmitting}
                    disabled={data && !dirty}
                    loadingText={data ? 'Updating...' : 'Saving...'}
                    defaultText={data ? 'Update' : 'Save'}
                  />
                </Col>
              </form>
            );
          }}
        </Formik>
      </ModalBody>
    </Modal>
  );
};

export default HolidayForm;
