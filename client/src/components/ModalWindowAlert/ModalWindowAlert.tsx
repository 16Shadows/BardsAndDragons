import React from "react";
import { Modal } from "react-bootstrap";

// Принимаемые параметры
interface IProps {
    show?: boolean;
    onHide: () => void;
    message?: string;
}

const ModalWindowAlert = ({show = false, onHide, message = "Сообщение"}: IProps) => {
    return (
        <Modal show={show} onHide={onHide}>
        <Modal.Header closeButton>
            <Modal.Title style={{ color: "red" }}>{"Произошла ошибка"}</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{fontSize: "20px"}}>
            <p>{message}</p>
            <hr/>
            <p>
                Приносим свои извинения!<br/>
                Попробуйте перезагрузить сайт.<br/>
                Если ошибка повторится, просьба написать в <a href="support">поддержку</a>.
            </p>
        </Modal.Body>
        </Modal>
    )
}

// При перерендеринге страницы проверяет, изменилось ли какое-либо из полей компонента
// Если нет, то перерендеринг компонента не происходит
export default React.memo(ModalWindowAlert);