import React, { useState, useEffect } from 'react';
import { ErrorMessage, Field, Formik } from 'formik';
import { toast } from 'react-toastify';
import * as Yup from 'yup';

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
import { createProfessor, updateProfessor } from 'helper/api-data/professor';
import { ImgPath, UrlImage } from 'utils/Constant';
import { validateEmailFormat } from '../../../../utils/utils';
import usePermission from 'hooks/usePermission';
import { PERMISSIONS } from 'utils/permissions';

const TeacherForm = ({ data, isOpen, toggle, onReload }: any) => {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { canPermission } = usePermission();
  const canToggleStatus = canPermission(PERMISSIONS.TOGGLE_TEACHER_STATUS);

  useEffect(() => {
    if (data && data.user?.image) {
      setImagePreview(
        `${UrlImage}/${data.user.image}?t=${new Date().getTime()}`
      );
    } else if (!isOpen) {
      setImagePreview(null);
    }
  }, [isOpen, data, data?.user?.image]);

const save = async (formValues: any) => {
  try {
    const emailValidation = validateEmailFormat(formValues.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    const formData = new FormData();
    Object.keys(formValues).forEach((key) => {
      formData.append(key, formValues[key]);
    });

    const response = await createProfessor(formData);
    if (response.statusCode === 200) {
      toast.success('Teacher created successfully!');
      if (onReload) {
        onReload();
      }
      toggle(null, true);
    }
  } catch (error) {
    toast.error('Error creating teacher');
  }
};

const update = async (values: any) => {
  try {
    const emailValidation = validateEmailFormat(values.email);
    if (!emailValidation.isValid) {
      toast.error(emailValidation.message);
      return;
    }

    const { id, image, ...rest } = values;

    const formData = new FormData();
    
    Object.entries(rest).forEach(([key, value]) => {
      formData.append(key, value as any);
    });

    if (image instanceof File) {
      formData.append('image', image);
    } else if (typeof image === 'string' && image) {
      formData.append('image', image);
    }

    const res = await updateProfessor(id, formData);
    if (res.statusCode === 200) {
      toast.success('Teacher updated successfully!');
      
      if (image instanceof File && res.data?.user?.image) {
        setImagePreview(`${UrlImage}/${res.data.user.image}?t=${new Date().getTime()}`);
      }
      
      if (onReload) {
        onReload();
      }
      toggle(null, true);
    }
  } catch (error) {
    toast.error('Error updating teacher');
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

  return (
    <Modal
      isOpen={isOpen}
      toggle={toggle}
      size='lg'
    >
      <ModalHeader toggle={toggle}>
        {data ? 'Edit Profesor' : 'Add New Professor'}
      </ModalHeader>
      <ModalBody>
        <Formik
          initialValues={
            data
              ? {
                  ...data,
                  name: data?.user?.name,
                  username: data?.user?.username,
                  email: data.email,
                  password: '',
                  status: data.status,
                  cedula: data.cedula,
                  hourly_rate: data.hourly_rate,
                  phone: data.phone,
                  role: data.user?.role,
                  image: data?.user?.image,
                  report_link: data.report_link,
                }
              : {
                  name: '',
                  username: '',
                  email: '',
                  password: '',
                  status: 'active',
                  cedula: '',
                  hourly_rate: '',
                  phone: '',
                  role: '',
                  image: '',
                  report_link: '',
                }
          }
          validationSchema={validations}
          onSubmit={(info) => (data ? update(info) : save(info))}
        >
          {(props) => {
            const { errors, handleSubmit, isSubmitting, setFieldValue, dirty, touched } =
              props;
            const handleImageChange = (
              event: React.ChangeEvent<HTMLInputElement>
            ) => {
              const file = event.target.files?.[0];
              if (file) {
                setImagePreview(URL.createObjectURL(file));
                setFieldValue('image', file);
              }
            };

            return (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col
                  xs={12}
                  className='user-profile d-flex justify-content-center'
                >
                  <div className='hovercard text-center card mt-2'>
                    <div className='card-header mt-4'></div>
                    <div className='user-image'>
                      <div className='avatar'>
                        <img
                          alt='User Avatar'
                          src={imagePreview || `${ImgPath}/user/7.jpg`}
                          className='step1 media'
                        />
                      </div>
                      <div className='icon-wrapper step2'>
                        <i className='icofont icofont-pencil-alt-5'>
                          <input
                            className='upload'
                            type='file'
                            name='image'
                            id='image'
                            onChange={handleImageChange}
                            accept='image/*'
                            style={{
                              left: 0,
                              opacity: 0,
                              position: 'absolute',
                              right: 0,
                            }}
                          />
                        </i>
                      </div>
                    </div>
                  </div>
                </Col>
                <Col xs={6}>
                  <Label for='name'>Name</Label>
                  <Field
                    name='name'
                    as={Input}
                    invalid={touched.name && !!errors.name}
                  />
                  <ErrorMessage
                    name='name'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='username'>Username </Label>
                  <Field
                    name='username'
                    as={Input}
                    component={NameField}
                    invalid={touched.username && !!errors.username}
                  />
                  <ErrorMessage
                    name='username'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='email'>Email </Label>
                  <Field
                    name='email'
                    as={Input}
                    invalid={touched.email && !!errors.email}
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
                  <Label for='status'>Status</Label>
                  <Field
                    name='status'
                    as={Input}
                    type='select'
                    disabled={!canToggleStatus}
                  >
                    <option
                      value=''
                      disabled
                    >
                      Select status of professor
                    </option>
                    <option value='active'>Active</option>
                    <option value='inactive'>Inactive</option>
                  </Field>
                  <ErrorMessage
                    name='status'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='cedula'>Cédula</Label>
                  <Field
                    name='cedula'
                    as={Input}
                    invalid={touched.cedula && !!errors.cedula}
                  />
                  <ErrorMessage
                    name='cedula'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='hourly_rate'>Hourly Rate </Label>
                  <Field
                    name='hourly_rate'
                    as={Input}
                    type='number'
                    step='0.01'
                    invalid={touched.hourly_rate && !!errors.hourly_rate}
                  />
                  <ErrorMessage
                    name='hourly_rate'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={6}>
                  <Label for='phone'>Phone</Label>
                  <Field
                    name='phone'
                    as={Input}
                  />
                  <ErrorMessage
                    name='phone'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12}>
                  <Label for='report_link'>Report link </Label>
                  <Field
                    name='report_link'
                    as={Input}
                  />
                  <ErrorMessage
                    name='report_link'
                    component={FormFeedback}
                  />
                </Col>

                <Col
                  xs={12}
                  className='d-flex justify-content-end mt-5'
                >
                  <Button
                    color='danger'
                    onClick={toggle}
                  >
                    Close
                  </Button>
                  &nbsp; &nbsp;
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isSubmitting}
                    loadingText={data ? 'Updating...' : 'Saving...'}
                    defaultText={data ? 'Update' : 'Save'}
                    disabled={data && !dirty}
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

export default TeacherForm;

const validations = Yup.object().shape({
  name: Yup.string().required('The name is required'),
  username: Yup.string().required('The username is required'),
  email: Yup.string()
    .email('Please enter a valid email')
    .required('The email is required'),
  cedula: Yup.string()
    .min(10, 'Cédula must be exactly 10 characters long')
    .max(10, 'Cédula must be exactly 10 characters long')
    .required('Cédula is required'),
  hourly_rate: Yup.number()
    .positive('Hourly rate must be a positive number')
    .required('Hourly rate is required'),
});
