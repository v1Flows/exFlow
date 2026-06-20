"use client";
import { Avatar, cn } from "@heroui/react";
import React from "react";

import CellWrapper from "./cell-wrapper";

// eslint-disable-next-line no-undef
export type CellProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar: string;
  name: string;
  permission: string;
  color: string;
};

const Cell = ({
  ref,
  avatar,
  name,
  permission,
  color,
  className,
  ...props
  // eslint-disable-next-line no-undef
}: CellProps & { ref: React.RefObject<HTMLDivElement> }) => (
  <CellWrapper
    ref={ref}
    className={cn("bg-transparent px-3 py-1", className)}
    {...props}
  >
    <div className="flex items-center gap-2">
      <Avatar size={"sm"}>
        <Avatar.Fallback>
          {String("").slice(0, 2).toUpperCase()}
        </Avatar.Fallback>
      </Avatar>
      <p className="text-sm text-muted">{name}</p>
    </div>
    <p className="text-sm text-muted">{permission}</p>
  </CellWrapper>
);

Cell.displayName = "Cell";

export default Cell;
