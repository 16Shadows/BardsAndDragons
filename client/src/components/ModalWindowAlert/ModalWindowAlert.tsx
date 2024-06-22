import React from "react";
import { Modal } from "react-bootstrap";

// Принимаемые параметры
interface IProps {
    show?: boolean;
    onHide: () => void;
    children?: React.ReactNode;
    headerMeassage: string
    headerColor?: string
}

const ModalWindowAlert = ({show = false, onHide, children = "Сообщение", headerMeassage, headerColor="black"}: IProps) => {
    return (
        <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title style={{ color: headerColor }}>{headerMeassage}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontSize: "20px"}}>{children}</Modal.Body>
        </Modal>
    )
}

// При перерендеринге страницы проверяет, изменилось ли какое-либо из полей компонента
// Если нет, то перерендеринг компонента не происходит
export default React.memo(ModalWindowAlert);