import React, { useState } from "react";
import Button from "./Button";
import Modal from "react-bootstrap/Modal";

export interface PopupButton {
  text: string;
  action: () => {};
  variant: "primary" | "secondary" | "danger" | "success";
  outline?: boolean;
}

function Popup(props: {
  show: boolean;
  onHide?: any;
  buttons: PopupButton[];
  title: string;
  message: React.ReactNode;
  popupButtonText?: string;
  popupButtonVariant?: "primary" | "secondary" | "danger" | "success";
}) {
  const buttons = props.buttons;
  const [show, setShow] = useState(props.show);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        color={props.popupButtonVariant ? props.popupButtonVariant : "primary"}
        onClick={handleShow}
        children={props.popupButtonText ?? props.popupButtonText}
      />

      <Modal
        show={show}
        onHide={() => {
          handleClose();
          props.onHide();
        }}
      >
        <Modal.Header closeButton>
          <Modal.Title>{props.title}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{props.message}</Modal.Body>
        <Modal.Footer>
          <>
            {buttons.map((button) => {
              return (
                <>
                  <Button
                    color={button.variant}
                    onClick={() => {
                      handleClose();
                      button.action();
                    }}
                    children={button.text}
                    outline={button.outline}
                  ></Button>
                </>
              );
            })}
          </>
        </Modal.Footer>
      </Modal>
    </>
  );
}

export default Popup;
