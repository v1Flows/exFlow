"use client";
import {
  Button,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  TextField,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useSelfServicePages } from "@/lib/swr/hooks/selfservice";
import { useUserDetails } from "@/lib/swr/hooks/flows";
import { SelfServicePage } from "@/types";
function greeting(name?: string): string {
  const hour = new Date().getHours();
  const part =
    hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  return name ? `${part}, ${name}` : part;
}
interface PageResultProps {
  page: SelfServicePage;
  onSelect: (slug: string) => void;
}
function PageResult({ page, onSelect }: PageResultProps) {
  return (
    <motion.button
      animate={{ opacity: 1, y: 0 }}
      className="w-full text-left flex items-center gap-4 px-5 py-4 rounded-xl border border-default bg-surface/60 backdrop-blur hover:bg-surface/90 hover:border-default transition-all group"
      exit={{ opacity: 0, y: -4 }}
      initial={{ opacity: 0, y: 6 }}
      onClick={() => onSelect(page.slug)}
    >
      <div
        className="p-2.5 rounded-lg shrink-0"
        style={{ backgroundColor: `${page.color}20`, color: page.color }}
      >
        <Icon icon={page.icon || "hugeicons:layout-01"} width={22} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-semibold text-sm truncate group-hover:text-accent transition-colors">
          {page.name}
        </p>
        {page.description && (
          <p className="text-xs text-muted truncate mt-0.5">
            {page.description}
          </p>
        )}
      </div>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-muted">
          {page.page_flows?.length ?? 0} workflow
          {(page.page_flows?.length ?? 0) !== 1 ? "s" : ""}
        </span>
        {!page.enabled && (
          <span className="text-xs text-warning bg-warning/10 px-2 py-0.5 rounded-full">
            Disabled
          </span>
        )}
        <Icon
          className="text-muted group-hover:text-accent transition-colors"
          icon="hugeicons:arrow-right-01"
          width={16}
        />
      </div>
    </motion.button>
  );
}
export default function PortalClient() {
  const router = useRouter();
  const { pages, isLoading } = useSelfServicePages();
  const { user } = useUserDetails();
  const [query, setQuery] = useState("");
  const filtered = useMemo(() => {
    if (!query.trim()) return pages;
    const q = query.toLowerCase();
    return pages.filter(
      (p: SelfServicePage) =>
        p.name.toLowerCase().includes(q) ||
        p.description?.toLowerCase().includes(q),
    );
  }, [pages, query]);
  const recentPages = useMemo(
    () =>
      [...pages]
        .sort(
          (a: SelfServicePage, b: SelfServicePage) =>
            new Date(b.updated_at ?? b.created_at).getTime() -
            new Date(a.updated_at ?? a.created_at).getTime(),
        )
        .slice(0, 6),
    [pages],
  );
  const showResults = query.trim().length > 0;
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Top-right nav */}
      <div className="flex justify-end gap-2 p-4">
        <Button size="sm" variant="tertiary" onPress={() => router.push("/")}>
          {<Icon icon="hugeicons:dashboard-square-01" width={16} />}
          Dashboard
        </Button>
        <Button
          size="sm"
          variant="tertiary"
          onPress={() => router.push("/services")}
        >
          {<Icon icon="hugeicons:layout-01" width={16} />}
          All Services
        </Button>
      </div>

      {/* Hero area */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-24">
        <motion.div
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-2xl flex flex-col items-center gap-8"
          initial={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          {/* Greeting */}
          <div className="text-center space-y-1">
            <h1 className="text-3xl font-bold tracking-tight">
              {user ? greeting(user.first_name || user.username) : greeting()}
            </h1>
            <p className="text-muted">What would you like to run today?</p>
          </div>

          {/* Search bar */}
          <div className="w-full relative">
            <TextField value={query} onChange={setQuery}>
              <InputGroup>
                <InputGroup.Prefix>
                  {
                    <Icon
                      className="text-muted shrink-0"
                      icon="hugeicons:search-01"
                      width={22}
                    />
                  }
                </InputGroup.Prefix>
                <Input placeholder="Search service pages and workflows…" />
              </InputGroup>
            </TextField>
          </div>

          {/* Results */}
          <div className="w-full flex flex-col gap-2">
            <AnimatePresence mode="sync">
              {showResults ? (
                filtered.length > 0 ? (
                  filtered.map((page: SelfServicePage) => (
                    <PageResult
                      key={page.id}
                      page={page}
                      onSelect={(slug) => router.push(`/services/${slug}`)}
                    />
                  ))
                ) : (
                  <motion.div
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-muted"
                    exit={{ opacity: 0 }}
                    initial={{ opacity: 0 }}
                  >
                    <Icon
                      className="mx-auto mb-2"
                      icon="hugeicons:search-remove"
                      width={36}
                    />
                    <p className="text-sm">
                      No services match &ldquo;{query}&rdquo;
                    </p>
                  </motion.div>
                )
              ) : isLoading ? (
                <div className="flex flex-col gap-2">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div
                      key={i}
                      className="h-16 rounded-xl bg-surface/40 animate-pulse"
                    />
                  ))}
                </div>
              ) : recentPages.length > 0 ? (
                <>
                  <p className="text-xs font-medium text-muted uppercase tracking-wider px-1 mb-1">
                    Recent services
                  </p>
                  {recentPages.map((page: SelfServicePage, i: number) => (
                    <motion.div
                      key={page.id}
                      animate={{ opacity: 1, y: 0 }}
                      initial={{ opacity: 0, y: 8 }}
                      transition={{ delay: i * 0.05 }}
                    >
                      <PageResult
                        page={page}
                        onSelect={(slug) => router.push(`/services/${slug}`)}
                      />
                    </motion.div>
                  ))}
                </>
              ) : null}
            </AnimatePresence>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
