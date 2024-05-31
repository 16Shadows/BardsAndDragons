import React, { useState } from "react";
import Button from "./Button";
import Modal from "react-bootstrap/Modal";
import { IntegerType } from "typeorm";
import PopupButton from "../interfaces/PopupButtonInterface";

function Popup(props: {
  show: boolean;
  onHide: any;
  disabled: boolean;
  buttons: PopupButton[];
  title: string;
  message: React.ReactNode;
  popupButtonText?: string;
  popupButtonVariant?: "primary" | "secondary" | "danger" | "success";
}) {
  const buttons = props.buttons;
  const [show, setShow] = useState(false);

  const handleClose = () => setShow(false);
  const handleShow = () => setShow(true);

  return (
    <>
      <Button
        color={props.popupButtonVariant}
        onClick={handleShow}
        children={props.popupButtonText ? props.popupButtonText : ""}
      />

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
