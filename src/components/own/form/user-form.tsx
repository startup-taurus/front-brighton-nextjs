import React from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import { toast } from 'react-toastify';
import {
  Button,
  Col,
  FormFeedback,
  Input,
  InputGroup,
  InputGroupText,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from 'reactstrap';
import LoadingButton from '../common/loading-button/LoadingButton';
import { createUser, updateUser, checkDuplicateUser } from 'helper/api-data/user';
import { USER_ROLES } from '../../../../utils/constants';
import { validateEmailFormat } from '../../../../utils/utils';

const UserForm = ({ data, isOpen, toggle }: any) => {
  const save = async (formValues: any) => {
    try {
      const emailValidation = validateEmailFormat(formValues.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }

      const finalUsername = formValues.username.endsWith('Brighton') 
        ? formValues.username 
        : formValues.username + 'Brighton';
      
      const duplicateResponse = await checkDuplicateUser({
        email: formValues.email,
        username: finalUsername
      });
      
      if (duplicateResponse.data?.isValid === false) {
        toast.error(duplicateResponse.data?.message );
        return;
      }

      const response = await createUser(formValues);
      if (response.statusCode === 200) {
        toast.success('User created successfully!');
        toggle();
      }
    } catch (error) {
      console.error('Error al crear usuario:', error);
      toast.error('Error creating user');
    }
  };
  const NameField = ({ field, form, ...props }: any) => {
    const suffix = 'Brighton';
    let baseValue = field.value || '';
    if (baseValue.endsWith(suffix)) {
      baseValue = baseValue.slice(0, -suffix.length);
    }
    return (
      <InputGroup>
        <Input
          {...field}
          {...props}
          value={baseValue}
          onChange={(e) => {
            const newValue = e.target.value;
            form.setFieldValue(field.name, newValue + suffix);
          }}
        />
        <InputGroupText>{suffix.trim()}</InputGroupText>
      </InputGroup>
    );
  };

  const update = async (formValues: any) => {
    try {
      const emailValidation = validateEmailFormat(formValues.email);
      if (!emailValidation.isValid) {
        toast.error(emailValidation.message);
        return;
      }

      const finalUsername = formValues.username.endsWith('Brighton') 
        ? formValues.username 
        : formValues.username + 'Brighton';
      
      const duplicateResponse = await checkDuplicateUser({
        email: formValues.email,
        username: finalUsername,
        excludeUserId: formValues.id
      });
      
      if (duplicateResponse.data?.isValid === false) {
        toast.error(duplicateResponse.data?.message );
        return;
      }

      const response = await updateUser(formValues.id, formValues);
      if (response.statusCode === 200) {
        toast.success('User updated successfully!');
        toggle();
      }
    } catch (error) {
      console.error('Error al actualizar usuario:', error);
      toast.error('Error updating user');
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {data ? 'Edit User' : 'Add New User'}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  name: data.name,
                  username: data.username,
                  email: data.email,
                  password: data.password,
                  role: data.role,
                  status: data.status,
                }
              : {
                  name: '',
                  username: '',
                  email: '',
                  password: '',
                  role: '',
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
                className={`row g-3`}
              >
                <Col xs={6}>
                  <Label for='name'>Name</Label>
                  <Field
                    name='name'
                    as={Input}
                  />
                  <ErrorMessage
                    name='name'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='username'>Username</Label>
                  <Field
                    name='username'
                    as={Input}
                    component={NameField}
                  />
                  <ErrorMessage
                    name='username'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='email'>Email</Label>
                  <Field
                    name='email'
                    as={Input}
                  />
                  <ErrorMessage
                    name='email'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='password'>Password</Label>
                  <Field
                    name='password'
                    as={Input}
                    type='password'
                  />
                  <ErrorMessage
                    name='password'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='role'>Role</Label>
                  <Field
                    name='role'
                    as={Input}
                    type='select'
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select role of user
                    </option>
                    {USER_ROLES.map((role, index) => (
                      <option value={role.value}>{role.label}</option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name='role'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='status'>Status</Label>
                  <Field
                    name='status'
                    as={Input}
                    type='select'
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select status of user
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

export default UserForm;
