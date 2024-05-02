import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import { IntegerType } from "typeorm";
import PopupButton from "../interfaces/PopupButtonInterface";

function Popup(props: {
  show: boolean;
  onHide: any;
  disabled: boolean;
  buttons: PopupButton[];
  title: string;
  message: string;
  popupButtonText: string;
  popupButtonVariant: "primary" | "secondary" | "danger" | "success";
}) {
  const buttons = props.buttons;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button variant={props.popupButtonVariant} onClick={handleShow}>
        {props.popupButtonText}
      </Button>

      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.message}</Modal.Body>
        <Modal.Footer>
          <>
            {buttons.map((button, index) => {
              return (
                <>
                  <Button
                    variant={button.variant}
                    onClick={() => {
                      handleClose();
                      button.action();
                    }}
                  >
                    {button.text}
                  </Button>
                </>
              );
            })}
          </>

          {/* <Button variant="secondary" onClick={handleClose}>
            Close
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Save Changes
          </Button> */}
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Popup;
