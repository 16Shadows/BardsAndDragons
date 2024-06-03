import { PropsWithChildren } from "react";

interface Props {
  onClick?: () => void;
  color: "primary" | "secondary" | "danger" | "success";
  outline?: boolean;
  style?: {};
  disabled?: boolean;
}
const Button = (props: PropsWithChildren<Props>) => {
  return (
    <button
      disabled={props.disabled ?? false}
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
