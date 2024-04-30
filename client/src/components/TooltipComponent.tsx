import React from "react";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";

interface TooltipProps {
  message: string;
}
const TooltipComponent = (props: TooltipProps) => {
  const message = props.message;
  return (
    <OverlayTrigger
      delay={{ hide: 450, show: 300 }}
      overlay={(props) => <Tooltip {...props}>{message}</Tooltip>}
      placement="top"
    >
      <label>&nbsp;(?)</label>
    </OverlayTrigger>
  );
};

export default TooltipComponent;

// Пример использования:
// <TooltipComponent message="Место для текста"></TooltipComponent>
