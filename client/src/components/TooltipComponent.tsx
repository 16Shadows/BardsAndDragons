import { PropsWithChildren } from "react";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";

interface TooltipProps {
  mainText: string;
}
const TooltipComponent = (props: PropsWithChildren<TooltipProps>) => {
  return (
    <OverlayTrigger
      delay={{ hide: 450, show: 300 }}
      overlay={(props) => <Tooltip {...props}>{props.children}</Tooltip>}
      placement="top"
    >
      <label>{props.mainText}</label>
    </OverlayTrigger>
  );
};

export default TooltipComponent;
