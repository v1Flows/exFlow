"use client";

import { useMemo, useState } from "react";
import { Icon } from "@iconify/react";
import { Button, Chip, Input } from "@heroui/react";

interface PluginSidebarProps {
  runners: any[];
  isOpen: boolean;
  onToggle: () => void;
}

export default function PluginSidebar({ runners, isOpen, onToggle }: PluginSidebarProps) {
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
        selectedCategory === "Uncategorized" ? !a.category : a.category === selectedCategory,
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
      className="flex flex-col border-r border-default-100 bg-content1 transition-all duration-200 overflow-hidden shrink-0"
      style={{ width: isOpen ? 240 : 0 }}
    >
      {isOpen && (
        <>
          {/* Header */}
          <div className="flex items-center justify-between px-3 py-2 border-b border-default-100">
            <p className="text-xs font-semibold text-default-600 uppercase tracking-wide">Actions</p>
            <Button isIconOnly size="sm" variant="light" onPress={onToggle}>
              <Icon icon="hugeicons:sidebar-left" width={16} />
            </Button>
          </div>

          {/* Search */}
          <div className="px-2 py-2">
            <Input
              classNames={{ inputWrapper: "h-8 min-h-0" }}
              placeholder="Search actions..."
              size="sm"
              startContent={<Icon icon="hugeicons:search-01" width={14} />}
              value={search}
              onValueChange={setSearch}
            />
          </div>

          {/* Category chips */}
          <div className="flex flex-wrap gap-1 px-2 pb-2">
            {categories.map((cat) => (
              <Chip
                key={cat}
                className="cursor-pointer"
                color={selectedCategory === cat ? "primary" : "default"}
                size="sm"
                variant={selectedCategory === cat ? "solid" : "flat"}
                onClick={() => setSelectedCategory(cat)}
              >
                {cat}
              </Chip>
            ))}
          </div>

          {/* Action list */}
          <div className="flex-1 overflow-y-auto px-2 pb-2 flex flex-col gap-1.5">
            {actions.length === 0 && (
              <p className="text-xs text-default-400 text-center mt-4">No runners connected</p>
            )}
            {actions.length > 0 && filtered.length === 0 && (
              <p className="text-xs text-default-400 text-center mt-4">No actions match</p>
            )}
            {filtered.map((action) => (
              <div
                key={`${action.plugin}-${action.version}`}
                className="flex items-center gap-2 p-2 rounded-lg border border-default-100 bg-content2 cursor-grab hover:border-primary/40 hover:bg-content3 transition-colors select-none active:cursor-grabbing"
                draggable
                onDragStart={(e) => handleDragStart(e, action)}
              >
                <div className="flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
                  <Icon icon={action.icon || "hugeicons:plug-02"} width={18} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-semibold truncate text-foreground">{action.name}</p>
                  <p className="text-[10px] text-default-400 truncate">{action.description}</p>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
