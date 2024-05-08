import React from "react";

interface Props {
  children: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "danger" | "success";
  style?: {};
}

const Button = ({ children, onClick, color = "primary", style={} }: Props) => {
  return (
    <button className={"btn btn-" + color} onClick={onClick} style={style}>
      {children}
    </button>
  );
};

export default Button;
