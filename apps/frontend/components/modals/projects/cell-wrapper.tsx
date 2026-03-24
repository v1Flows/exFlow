import React from "react";

import { cn } from "./cn";

const CellWrapper = ({
  ref,
  children,
  className,
  ...props
  // eslint-disable-next-line no-undef
}: React.HTMLAttributes<HTMLDivElement> & {
  // eslint-disable-next-line no-undef
  ref: React.RefObject<HTMLDivElement>;
}) => (
  <div
    ref={ref}
    className={cn(
      "flex items-center justify-between gap-2 rounded-medium bg-content2 p-4",
      className,
    )}
    {...props}
  >
    {children}
  </div>
);

CellWrapper.displayName = "CellWrapper";

export default CellWrapper;
