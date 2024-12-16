import React from "react";
import { ErrorMessage, Field, Formik } from "formik";
import {
  Button,
  Col,
  FormFeedback,
  Input,
  Label,
  Modal,
  ModalBody,
  ModalHeader,
} from "reactstrap";

import * as Yup from "yup";
import { parse } from "date-fns";
import {
  createCancelLesson,
  updateCancelLesson,
} from "../../../../helper/api-data/cancelled-lessons";
import { mutate } from "swr";
import { useRouter } from "next/router";
import { toast } from "react-toastify";

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

  const validations = Yup.object().shape({
    cancel_reason: Yup.string()
      .required("The cancel reason is required")
      .min(3, "The minimum length of the description is 3 letters "),
    cancel_date: Yup.date()
      .transform((value, originalValue, schema) => {
        if (schema.isType(value)) {
          return value;
        }
        const result = parse(originalValue, "dd-MM-yyyy", new Date());
        return result;
      })
      .typeError("Select a valid date")
      .required("The cancel date is required"),
  });

  const onSubmit = (body: any, { setSubmitting }: any) => {
    console.log(body);
    setSubmitting(true);
    if (data) {
      updateCancelLesson(data?.id, body).then(() => {
        toast.success("Record updated correctly");
        onClose();
      });
    } else {
      body.course_id = router?.query?.id;
      createCancelLesson(body).then((res) => {
        if (res.statusCode === 200) {
          toast.success("Record saved correctly");
          onClose();
        }
      });
    }
    setSubmitting(false);
  };

  const onClose = () => {
    mutate(`/cancelled-lesson/get-all-by-course/${router?.query?.id}`);
    setData(null);
    toggleModal();
  };

  return (
    <Modal className="modal-dialog-centered" isOpen={isOpen} toggle={onClose}>
      <ModalHeader toggle={onClose}>
        {data ? "Edit cancelled class" : "Add cancelled class"}
      </ModalHeader>
      <ModalBody>
        <div className="modal-toggle-wrapper">
          <Formik
            initialValues={data ? data : { cancel_reason: "", cancel_date: "" }}
            onSubmit={onSubmit}
            validationSchema={validations}
          >
            {({ errors, handleSubmit, isSubmitting, touched }) => (
              <form
                noValidate
                autoComplete="off"
                onSubmit={handleSubmit}
                className={`row g-3`}
              >
                <Col xs={12}>
                  <Label for="cancel_reason">Cancel Reason</Label>
                  <Field
                    id="cancel_reason"
                    name="cancel_reason"
                    invalid={touched.cancel_reason && !!errors.cancel_reason}
                    as={Input}
                  />
                  <ErrorMessage name="cancel_reason" component={FormFeedback} />
                </Col>
                <Col xs={12}>
                  <Label for="cancel_date">Cancel Date</Label>
                  <Field
                    id="cancel_date"
                    name="cancel_date"
                    type="date"
                    placeholder="dd/mm/yyyy"
                    invalid={touched.cancel_date && !!errors.cancel_date}
                    as={Input}
                  />
                  <ErrorMessage name="cancel_date" component={FormFeedback} />
                </Col>

                <Col xs={12} className="d-flex justify-content-center gap-2">
                  <Button color="secondary" onClick={onClose}>
                    Close
                  </Button>
                  <Button color="primary" type="submit" disabled={isSubmitting}>
                    {data ? "Edit" : "Save"}
                  </Button>
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
