"use client";
import React, { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import {
  Button,
  Chip,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
interface PluginSidebarProps {
  runners: any[];
  isOpen: boolean;
  onToggle: () => void;
}
export default function PluginSidebar({
  runners,
  isOpen,
  onToggle,
}: PluginSidebarProps) {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  // Deduplicate actions across all runners (same logic as addFlow.tsx — no online-status filter)
  const actions = useMemo(() => {
    const seen = new Set<string>();
    const result: any[] = [];
    for (const runner of runners ?? []) {
      for (const action of runner.actions ?? []) {
        if (!action.version) continue;
        const key = `${action.plugin}-${action.version}`;
        if (!seen.has(key)) {
          seen.add(key);
          result.push(action);
        }
      }
    }
    return result;
  }, [runners]);
  const categories = useMemo(() => {
    const cats = new Set<string>();
    for (const a of actions) {
      if (a.category) cats.add(a.category);
    }
    return ["All", ...Array.from(cats).sort()];
  }, [actions]);
  const filtered = useMemo(() => {
    let list = actions;
    if (selectedCategory !== "All") {
      list = list.filter((a) =>
        selectedCategory === "Uncategorized"
          ? !a.category
          : a.category === selectedCategory,
      );
    }
    if (search) {
      list = list.filter((a) =>
        a.name?.toLowerCase().includes(search.toLowerCase()),
      );
    }
    return list;
  }, [actions, selectedCategory, search]);
  const handleDragStart = (e: React.DragEvent, action: any) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(action));
    e.dataTransfer.effectAllowed = "copy";
  };
  return (
    <div
      className="flex flex-col border-r border-default bg-surface transition-all duration-200 overflow-hidden shrink-0"
      style={{ width: isOpen ? 240 : 0 }}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-default">
            <p className="text-xs font-semibold text-muted uppercase tracking-wide">
              Actions
            </p>
            <Button
              size="sm"
              variant="ghost"
              onPress={onToggle}
              className="aspect-square p-0"
            >
              <Icon icon="hugeicons:sidebar-left" width={16} />
            </Button>
          </div>

          {/* Search */}
          <div className="px-2 py-2">
            <TextField value={search} onChange={setSearch}>
              <InputGroup>
                <InputGroup.Prefix>
                  {<Icon icon="hugeicons:search-01" width={14} />}
                </InputGroup.Prefix>
                <Input placeholder="Search actions..." />
              </InputGroup>
            </TextField>
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1 px-2 pb-2">
            {categories.map((cat) => (
              <Chip
                key={cat}
                className="cursor-pointer"
                color={selectedCategory === cat ? "accent" : "default"}
                size="sm"
                variant={selectedCategory === cat ? "primary" : "soft"}
                onClick={() => setSelectedCategory(cat)}
              >
                <Chip.Label>{cat}</Chip.Label>
              </Chip>
            ))}
          </div>

          {/* Action list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1.5">
            {actions.length === 0 && (
              <p className="text-xs text-muted text-center mt-4">
                No runners connected
              </p>
            )}
            {actions.length > 0 && filtered.length === 0 && (
              <p className="text-xs text-muted text-center mt-4">
                No actions match
              </p>
            )}
            {filtered.map((action) => (
              <div
                key={`${action.plugin}-${action.version}`}
                className="flex items-center gap-2 p-2 rounded-lg border border-default bg-surface-secondary cursor-grab hover:border-accent/40 hover:bg-surface-tertiary transition-colors select-none active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleDragStart(e, action)}
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-accent/10 text-accent shrink-0">
                  <Icon icon={action.icon || "hugeicons:plug-02"} width={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-foreground">
                    {action.name}
                  </p>
                  <p className="text-[10px] text-muted truncate">
                    {action.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
