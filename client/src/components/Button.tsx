import { PropsWithChildren } from "react";

interface Props {
  onClick?: () => void;
  action?: () => {};
  color: "primary" | "secondary" | "danger" | "success";
  outline?: boolean;
  style?: {};
}
const Button = (props: PropsWithChildren<Props>) => {
  return (
    <button
      className={
        props.outline
          ? "btn btn-outline-" + props.color
          : "btn btn-" + props.color
      }
      onClick={props.onClick}
      style={props.style}
    >
      {props.children}
    </button>
  );
};

export default Button;
