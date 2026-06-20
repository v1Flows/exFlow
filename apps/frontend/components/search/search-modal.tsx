"use client";
import { Kbd, Modal } from "@heroui/react";
import { Icon } from "@iconify/react";
import { Command } from "cmdk";
import { capitalize, isEmpty } from "lodash";
import { matchSorter } from "match-sorter";
import { useRouter } from "next/navigation";
import { useCallback, useMemo, useState } from "react";
import { tv } from "tailwind-variants";
import { CategoryEnum, type SearchResultItem } from "./data";
import { useSearch } from "./search-context";
import { flattenSearchData } from "./utils";
const cmdk = tv({
  slots: {
    base: "h-auto max-h-full bg-transparent",
    header: [
      "flex",
      "items-center",
      "w-full",
      "px-4",
      "border-b",
      "border-white/10",
    ],
    searchIcon: "text-lg text-muted [&>g]:stroke-[2px]",
    input: [
      "w-full",
      "px-2",
      "h-14",
      "font-sans",
      "text-lg",
      "outline-none",
      "bg-transparent",
      "text-foreground",
      "placeholder:text-muted",
      "dark:text-muted",
    ],
    list: ["max-h-[50vh]", "overflow-y-auto", "p-2"],
    itemWrapper: [
      "px-4",
      "mt-2",
      "group",
      "flex",
      "h-16",
      "justify-between",
      "items-center",
      "rounded-lg",
      "shadow-sm",
      "bg-surface-secondary/50",
      "active:opacity-70",
      "cursor-pointer",
      "transition-opacity",
      "data-[selected=true]:bg-accent",
      "data-[selected=true]:text-accent-foreground",
    ],
    leftWrapper: ["flex", "gap-3", "items-center", "w-full", "max-w-full"],
    leftIcon: [
      "text-muted",
      "group-data-[selected=true]:text-accent-foreground",
    ],
    itemContent: ["flex", "flex-col", "gap-0", "justify-center", "max-w-[80%]"],
    itemParentTitle: [
      "text-xs",
      "font-semibold",
      "text-muted",
      "group-data-[selected=true]:text-accent-foreground",
      "select-none",
    ],
    itemTitle: [
      "truncate",
      "text-muted",
      "group-data-[selected=true]:text-accent-foreground",
      "select-none",
    ],
    emptyWrapper: [
      "flex",
      "flex-col",
      "text-center",
      "items-center",
      "justify-center",
      "h-32",
    ],
  },
});
const MATCH_KEYS = ["content", "group", "category"] as const;
const MAX_RESULTS = 20;
const CATEGORY_ICON_MAP = {
  [CategoryEnum.COMMON]: "hugeicons:dashboard-square-02",
  [CategoryEnum.PROJECTS]: "hugeicons:ai-folder-01",
  [CategoryEnum.FLOWS]: "hugeicons:workflow-square-10",
  [CategoryEnum.FOLDERS]: "hugeicons:folder-01",
};
export default function SearchModal() {
  const router = useRouter();
  const { isOpen, onClose, projects, flows, folders } = useSearch();
  const [query, setQuery] = useState("");
  const slots = useMemo(() => cmdk(), []);
  const flattenedData = useMemo(
    () => flattenSearchData(projects, flows, folders),
    [projects, flows, folders],
  );
  const results = useMemo<SearchResultItem[]>(() => {
    if (query.length < 2) {
      return [];
    }
    const data = flattenedData as SearchResultItem[];
    return matchSorter(data, query, { keys: MATCH_KEYS }).slice(0, MAX_RESULTS);
  }, [query, flattenedData]);
  const onItemSelect = useCallback(
    (item: SearchResultItem) => {
      onClose();
      router.push(item.url);
    },
    [onClose, router],
  );
  return (
    <Modal>
      <Modal.Backdrop variant="blur" isOpen={isOpen}>
        <Modal.Container placement="top" scroll="inside" size="lg">
          <Modal.Dialog>
            <Command className={slots.base()} label="Quick search command">
              <div className={slots.header()}>
                <Icon
                  className={slots.searchIcon()}
                  icon="hugeicons:search-01"
                  width={20}
                />
                <Command.Input
                  // eslint-disable-next-line jsx-a11y/no-autofocus
                  autoFocus
                  className={slots.input()}
                  placeholder="Search for projects, flows, folders..."
                  value={query}
                  onValueChange={setQuery}
                />
                <Kbd className="hidden md:block">ESC</Kbd>
              </div>

              <div className="relative">
                <Command.List className={slots.list()}>
                  {query.length > 0 && isEmpty(results) && (
                    <Command.Empty>
                      <div className={slots.emptyWrapper()}>
                        <Icon
                          className="text-muted"
                          icon="hugeicons:search-02"
                          width={48}
                        />
                        <div className="flex flex-col gap-1">
                          <p className="text-muted">No results found</p>
                          <p className="text-xs text-muted">
                            Try searching for something else.
                          </p>
                        </div>
                      </div>
                    </Command.Empty>
                  )}

                  {results.map((item) => (
                    <Command.Item
                      key={item.slug + item.category}
                      className={slots.itemWrapper()}
                      value={item.content}
                      onSelect={() => onItemSelect(item)}
                    >
                      <div className={slots.leftWrapper()}>
                        {item.category && (
                          <Icon
                            className={slots.leftIcon()}
                            icon={
                              CATEGORY_ICON_MAP[item.category as CategoryEnum]
                            }
                            width={20}
                          />
                        )}
                        <div className={slots.itemContent()}>
                          <span className={slots.itemParentTitle()}>
                            {capitalize(item.category)}
                          </span>
                          <p className={slots.itemTitle()}>{item.content}</p>
                        </div>
                      </div>
                      <Icon
                        className="text-muted group-data-[selected=true]:text-accent-foreground"
                        icon="hugeicons:arrow-right-01"
                        width={16}
                      />
                    </Command.Item>
                  ))}
                </Command.List>
              </div>
            </Command>
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
