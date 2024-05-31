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
const Button = ({ children, onClick, color = "primary", style={} }: Props) => {
  return (
    <button className={outline ? "btn btn-outline-" + color : "btn btn-" + color} onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export default Button;
