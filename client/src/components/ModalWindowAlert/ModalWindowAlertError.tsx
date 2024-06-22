import React from "react";
import { Modal } from "react-bootstrap";
import ModalWindowAlert from "./ModalWindowAlert";

// Принимаемые параметры
interface IProps {
    show?: boolean;
    onHide: () => void;
    message?: string;
}

const ModalWindowAlertError = ({show = false, onHide, message = "Сообщение"}: IProps) => {
    return (
      <ModalWindowAlert show={show} onHide={onHide} headerColor="red" headerMeassage="Произошла ошибка">
        <p>{message}</p>
        <hr/>
        <p>
            Приносим свои извинения!<br/>
            Попробуйте перезагрузить сайт.<br/>
            Если ошибка повторится, просьба написать в <a href="support">поддержку</a>.
        </p>
      </ModalWindowAlert>
    )
}

// При перерендеринге страницы проверяет, изменилось ли какое-либо из полей компонента
// Если нет, то перерендеринг компонента не происходит
export default React.memo(ModalWindowAlertError);