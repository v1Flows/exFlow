"use client";

import { Avatar, cn } from "@heroui/react";
import React from "react";

import CellWrapper from "./cell-wrapper";

// eslint-disable-next-line no-undef
export type UserCellProps = React.HTMLAttributes<HTMLDivElement> & {
  avatar: string;
  name: string;
  permission: string;
  color: string;
};

const UserCell = ({
  ref,
  avatar,
  name,
  permission,
  color,
  className,
  ...props
  // eslint-disable-next-line no-undef
}: UserCellProps & { ref: React.RefObject<HTMLDivElement> }) => (
  <CellWrapper
    ref={ref}
    className={cn("bg-transparent px-3 py-1", className)}
    {...props}
  >
    <div className="flex items-center gap-2">
      <Avatar
        showFallback
        color={
          color as
            | "default"
            | "primary"
            | "secondary"
            | "success"
            | "warning"
            | "danger"
            | undefined
        }
        name={avatar}
        size="sm"
        src={avatar}
      />
      <p className="text-small text-default-500">{name}</p>
    </div>
    <p className="text-small text-default-400">{permission}</p>
  </CellWrapper>
);

UserCell.displayName = "UserCell";

export default UserCell;
