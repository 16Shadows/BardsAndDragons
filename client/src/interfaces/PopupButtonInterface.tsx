import React from "react";
import { IntegerType } from "typeorm";

interface PopupButton {
  text: string;
  action: () => {};
  variant: "primary" | "secondary" | "danger" | "success";
}

export default PopupButton;