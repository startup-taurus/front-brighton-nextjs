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
import { UserContext } from '../../../../helper/User';
import usePermission from '../../../../hooks/usePermission';
import { PERMISSIONS } from '../../../../utils/permissions';

import * as Yup from 'yup';
import { parse } from 'date-fns';
import {
  createCancelLesson,
  updateCancelLesson,
} from '../../../../helper/api-data/cancelled-lessons';
import { mutate } from 'swr';
import { useRouter } from 'next/router';
import { toast } from 'react-toastify';
import { USER_TYPES } from 'utils/constants';

type CancelledLessonsFormProps = {
  data?: any;
  isOpen: boolean;
  toggleModal: () => void;
  setData: (data: any) => void;
};

const CancelledLessonsForm = ({
  data,
  isOpen,
  toggleModal,
  setData,
}: CancelledLessonsFormProps) => {
  const router = useRouter();
  const { user } = useContext(UserContext);
  const { can } = usePermission();

  const validations = Yup.object().shape({
    cancel_reason: Yup.string()
      .required('The cancel reason is required')
      .min(3, 'The minimum length of the description is 3 letters '),
    cancel_date: Yup.date()
      .transform((value, originalValue, schema) => {
        if (schema.isType(value)) {
          return value;
        }
        const result = parse(originalValue, 'dd-MM-yyyy', new Date());
        return result;
      })
      .typeError('Select a valid date')
      .required('The cancel date is required'),
  });

  const onSubmit = (body: any, { setSubmitting }: any) => {
    const required = data ? PERMISSIONS.EDIT_CANCELLED_LESSON : PERMISSIONS.CREATE_CANCELLED_LESSON;
    if (!can(required)) {
      toast.error('You do not have permission to perform this action');
      setSubmitting(false);
      return;
    }
    setSubmitting(true);
    if (data) {
      updateCancelLesson(data?.id, body).then(() => {
        setSubmitting(false);
        toast.success('Record updated correctly');
        onClose();
      });
    } else {
      body.course_id = router?.query?.id;
      createCancelLesson(body).then((res) => {
        setSubmitting(false);
        if (res.statusCode === 200) {
          toast.success('Record saved correctly');
          onClose();
        }
      });
    }
  };

  const onClose = () => {
    mutate(`/cancelled-lesson/get-all-by-course/${router?.query?.id}`);
    setData(null);
    toggleModal();
  };

  return (
    <Modal
      className='modal-dialog-centered'
      isOpen={isOpen}
      toggle={onClose}
    >
      <ModalHeader toggle={onClose}>
        {data ? 'Edit cancelled class' : 'Add cancelled class'}
      </ModalHeader>
      <ModalBody>
        <div className='modal-toggle-wrapper'>
          <Formik
            initialValues={data ? data : { cancel_reason: '', cancel_date: '' }}
            onSubmit={onSubmit}
            validationSchema={validations}
          >
            {({ errors, handleSubmit, isSubmitting, touched }) => (
              <form
                noValidate
                autoComplete='off'
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={12}>
                  <Label for='cancel_reason'>Cancel Reason</Label>
                  <Field
                    id='cancel_reason'
                    name='cancel_reason'
                    invalid={touched.cancel_reason && !!errors.cancel_reason}
                    as={Input}
                  />
                  <ErrorMessage
                    name='cancel_reason'
                    component={FormFeedback}
                  />
                </Col>
                <Col xs={12}>
                  <Label for='cancel_date'>Cancel Date</Label>
                  <Field
                    id='cancel_date'
                    name='cancel_date'
                    type='date'
                    placeholder='dd/mm/yyyy'
                    invalid={touched.cancel_date && !!errors.cancel_date}
                    as={Input}
                  />
                  <ErrorMessage
                    name='cancel_date'
                    component={FormFeedback}
                  />
                </Col>

                <Col
                  xs={12}
                  className='d-flex justify-content-center gap-2'
                >
                  <Button
                    color='secondary'
                    onClick={onClose}
                  >
                    Close
                  </Button>
                  <LoadingButton
                    color='primary'
                    type='submit'
                    isLoading={isSubmitting}
                    loadingText={data ? 'Updating...' : 'Saving...'}
                    defaultText={data ? 'Edit' : 'Save'}
                    disabled={!can(data ? PERMISSIONS.EDIT_CANCELLED_LESSON : PERMISSIONS.CREATE_CANCELLED_LESSON)}
                  />
                </Col>
              </form>
            )}
          </Formik>
        </div>
      </ModalBody>
    </Modal>
  );
};

export default CancelledLessonsForm;
