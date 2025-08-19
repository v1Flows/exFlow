"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ReactNode, useState } from "react";

interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
  variant?:
    | "solid"
    | "bordered"
    | "light"
    | "flat"
    | "faded"
    | "shadow"
    | "ghost";
  color?:
    | "default"
    | "primary"
    | "secondary"
    | "success"
    | "warning"
    | "danger";
  size?: "sm" | "md" | "lg";
  isIconOnly?: boolean;
  children?: ReactNode;
}

export default function RefreshButton({
  onRefresh,
  isLoading: externalLoading,
  variant = "flat",
  color = "default",
  size = "md",
  isIconOnly = false,
  children,
}: RefreshButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false);

  const isLoading = externalLoading || internalLoading;

  const handleRefresh = async () => {
    if (isLoading) return;

    setInternalLoading(true);
    try {
      await onRefresh();
    } finally {
      setInternalLoading(false);
    }
  };

  return (
    <Button
      color={color}
      isIconOnly={isIconOnly}
      isLoading={isLoading}
      size={size}
      startContent={
        !isLoading && !isIconOnly ? (
          <Icon icon="hugeicons:refresh" width={size === "sm" ? 16 : 20} />
        ) : undefined
      }
      variant={variant}
      onPress={handleRefresh}
    >
      {isIconOnly
        ? !isLoading && (
            <Icon icon="hugeicons:refresh" width={size === "sm" ? 16 : 20} />
          )
        : children || "Refresh"}
    </Button>
  );
}
