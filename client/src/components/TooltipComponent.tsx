import { PropsWithChildren } from "react";
import OverlayTrigger from "react-bootstrap/esm/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";

interface TooltipProps {
  mainText: React.ReactNode;
  delayHide: number;
  delayShow: number;
  placement: "auto" | "top" | "bottom" | "right" | "left";
}
const TooltipComponent = (props: PropsWithChildren<TooltipProps>) => {
  return (
    <OverlayTrigger
      delay={{ hide: props.delayHide, show: props.delayShow }}
      overlay={<Tooltip>{props.children}</Tooltip>}
      placement={props.placement}
    >
      <label>{props.mainText}</label>
    </OverlayTrigger>
  );
};

export default TooltipComponent;
