"use client";

import { Icon } from "@iconify/react";
import { Button, Chip } from "@heroui/react";
import { Handle, Position, type NodeProps } from "@xyflow/react";

export type ActionNodeData = {
  action: any;
  onOpen: (action: any) => void;
  onEdit: (action: any) => void;
  onCopy: (action: any) => void;
  onDelete: (action: any) => void;
};

export default function ActionNode({ data, selected }: NodeProps) {
  const { action, onOpen, onEdit, onCopy, onDelete } = data as ActionNodeData;

  return (
    <div
      className={`
        group relative rounded-xl shadow-sm transition-all min-w-[260px] max-w-[320px]
        border backdrop-blur-md
        bg-content1/80
        ${selected
          ? "border-primary shadow-md shadow-primary/20"
          : "border-default-100 hover:border-default-300 hover:shadow-md"
        }
        ${!action.active ? "opacity-50" : ""}
      `}
    >
      {/* Incoming connection handle */}
      <Handle
        className="!w-3 !h-3 !border-2 !border-content1 !bg-primary"
        position={Position.Top}
        type="target"
      />

      {/* Hover action buttons — top-right overlay */}
      <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity z-10">
        <Button
          isIconOnly
          className="min-w-0 w-6 h-6"
          size="sm"
          variant="flat"
          onPress={(e) => { onCopy(action); }}
        >
          <Icon icon="hugeicons:copy-01" width={13} />
        </Button>
        <Button
          isIconOnly
          className="min-w-0 w-6 h-6"
          size="sm"
          variant="flat"
          onPress={() => onEdit(action)}
        >
          <Icon icon="hugeicons:pencil-edit-01" width={13} />
        </Button>
        <Button
          isIconOnly
          className="min-w-0 w-6 h-6 text-danger"
          color="danger"
          size="sm"
          variant="light"
          onPress={() => onDelete(action)}
        >
          <Icon icon="hugeicons:delete-02" width={13} />
        </Button>
      </div>

      {/* Body — clickable area opens details */}
      <div
        className="flex items-center gap-3 px-4 pt-3 pb-2 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={() => onOpen(action)}
        onKeyDown={(e) => e.key === "Enter" && onOpen(action)}
      >
        <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon icon={action.icon} width={22} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold truncate text-foreground">
            {action.custom_name || action.name}
          </p>
          <p className="text-xs text-default-500 truncate">
            {action.custom_description || action.description}
          </p>
        </div>
        <Chip
          className="shrink-0 border-none"
          color={action.active ? "success" : "default"}
          size="sm"
          variant="dot"
        />
      </div>

      {/* Footer */}
      <div className="flex items-center gap-2 px-4 pb-6 border-t border-default-100/50 pt-2 mt-1 flex-wrap">
        <Chip size="sm" variant="flat">
          v{action.version}
        </Chip>
        {action.update_available && (
          <Chip color="primary" size="sm" variant="solid">
            Upgrade
          </Chip>
        )}
      </div>

      {/* Success output handle — bottom-left */}
      <span
        className="absolute bottom-1 text-[10px] font-medium text-success pointer-events-none"
        style={{ left: "calc(30% - 16px)" }}
      >
        success
      </span>
      <Handle
        className="!w-3 !h-3 !border-2 !border-content1 !bg-success"
        id="success"
        position={Position.Bottom}
        style={{ left: "30%" }}
        type="source"
      />

      {/* Fail output handle — bottom-right */}
      <span
        className="absolute bottom-1 text-[10px] font-medium text-danger pointer-events-none"
        style={{ left: "calc(70% - 8px)" }}
      >
        fail
      </span>
      <Handle
        className="!w-3 !h-3 !border-2 !border-content1 !bg-danger"
        id="fail"
        position={Position.Bottom}
        style={{ left: "70%" }}
        type="source"
      />
    </div>
  );
}
