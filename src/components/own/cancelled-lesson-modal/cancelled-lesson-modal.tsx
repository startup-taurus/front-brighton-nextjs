import CommonModal from "CommonElements/Ui-kits/CommonModal";
import Image from "next/image";
import React, { useState } from "react";
import { Button } from "reactstrap";
import { CenteredError, Centeredtext, Close } from "utils/Constant";

type propsType = {
  isOpen: boolean;
  toggle: () => void;
};

const CancelLessonModal = ({ isOpen, toggle }: propsType) => {
  const ModalData = {
    isOpen,
    class: "modal-dialog-centered",
    toggler: toggle,
    title: "Centered Modal",
  };
  return (
    <CommonModal modalData={ModalData}>
      <div className="modal-toggle-wrapper">
        <Button
          color="secondary"
          className="d-flex m-auto"
          type="button"
          onClick={toggle}
        >
          {Close}
        </Button>
      </div>
    </CommonModal>
  );
};

export default CancelLessonModal;
