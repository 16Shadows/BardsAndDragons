import React, { Key } from "react";
import { IntegerType } from "typeorm";

interface Props {
  children: string;
  onClick?: () => void;
  action?: () => {};
  color?: "primary" | "secondary" | "danger" | "success";
  outline?: boolean;
  style?: {};
}
const Button = (props: Props) => {
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
