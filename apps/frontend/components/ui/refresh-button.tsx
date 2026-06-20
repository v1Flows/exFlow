"use client";
import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";
import { ReactNode, useState } from "react";
interface RefreshButtonProps {
  onRefresh: () => Promise<void> | void;
  isLoading?: boolean;
  variant?: "primary" | "secondary" | "tertiary" | "outline" | "ghost";
  size?: "sm" | "md" | "lg";
  isIconOnly?: boolean;
  children?: ReactNode;
}
export default function RefreshButton({
  onRefresh,
  isLoading: externalLoading,
  variant = "tertiary",
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
      isPending={isLoading}
      size={size}
      variant={variant}
      onPress={handleRefresh}
      className="aspect-square p-0"
    >
      {!isLoading && !isIconOnly ? (
        <Icon icon="hugeicons:refresh" width={size === "sm" ? 16 : 20} />
      ) : undefined}
      {isIconOnly
        ? !isLoading && (
            <Icon icon="hugeicons:refresh" width={size === "sm" ? 16 : 20} />
          )
        : children || "Refresh"}
    </Button>
  );
}
