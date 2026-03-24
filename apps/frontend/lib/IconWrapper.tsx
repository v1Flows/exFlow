import { cn } from "@heroui/react";
import React from "react";

export const IconWrapper = ({ children, className }: any) => (
  <div
    className={cn(
      className,
      "flex items-center rounded-small justify-center w-7 h-7",
    )}
  >
    {children}
  </div>
);
