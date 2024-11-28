import React from "react";
import { Modal, ModalHeader, ModalBody } from "reactstrap";

const SyllabusItemsModal = ({ isOpen, toggle, syllabusName, items }: any) => {
  return (
    <Modal isOpen={isOpen} toggle={toggle}>
      <ModalHeader toggle={toggle}>{syllabusName}</ModalHeader>
      <ModalBody className="notification">
        <ul>
          {items.map((item: any) => (
            <li className="d-flex ">
              <div className="activity-dot-primary"></div>
              <div className="w-100 ms-3">
                <p className="d-flex justify-content-between mb-2">
                  <span className="date-content light-background">
                    {item.item_name}
                  </span>
                </p>
              </div>
            </li>
          ))}
        </ul>
      </ModalBody>
    </Modal>
  );
};

export default SyllabusItemsModal;
