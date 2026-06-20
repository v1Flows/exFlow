"use client";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { type ReactNode } from "react";
type CopySnippetProps = {
  children: ReactNode;
  className?: string;
  codeClassName?: string;
  copyable?: boolean;
  showPrompt?: boolean;
  value?: string;
};
export function CopySnippet({
  children,
  className,
  codeClassName,
  copyable = true,
  showPrompt = true,
  value,
}: CopySnippetProps) {
  const copyValue = value ?? (typeof children === "string" ? children : "");
  return (
    <div
      className={`flex min-w-0 items-center gap-2 rounded-md bg-surface-secondary px-3 py-2 font-mono text-sm ${className ?? ""}`}
    >
      {showPrompt && <span aria-hidden>$</span>}
      <pre className={`min-w-0 flex-1 overflow-x-auto ${codeClassName ?? ""}`}>
        {children}
      </pre>
      {copyable && (
        <Tooltip>
          <Tooltip.Trigger>
            <Button
              aria-label="Copy to clipboard"
              className="aspect-square p-0"
              variant="ghost"
              onPress={() => navigator.clipboard.writeText(copyValue)}
            >
              <Icon icon="hugeicons:copy-02" width={16} />
            </Button>
          </Tooltip.Trigger>
          <Tooltip.Content>Copy</Tooltip.Content>
        </Tooltip>
      )}
    </div>
  );
}
