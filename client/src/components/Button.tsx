import React from "react";

interface Props {
  children: string;
  onClick: () => void;
  color?: "primary" | "secondary" | "danger" | "success";
  disabled?: boolean;
}

const Button = ({
  children,
  onClick,
  color = "primary",
  disabled = false,
}: Props) => {
  return (
    <button
      disabled={disabled}
      className={"btn btn-" + color}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
