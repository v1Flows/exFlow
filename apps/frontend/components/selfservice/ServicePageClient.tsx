"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Skeleton,
  Spinner,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";

import InputForm from "@/components/selfservice/InputForm";
import ExecutionViewer from "@/components/selfservice/ExecutionViewer";
import ExecuteSelfServiceFlow from "@/lib/fetch/selfservice/POST/execute";
import DeleteSelfServicePage from "@/lib/fetch/selfservice/DELETE/delete";
import { useSelfServicePage } from "@/lib/swr/hooks/selfservice";
import { useUserDetails, useFlowExecutionsPaginated } from "@/lib/swr/hooks/flows";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import {
  executionStatusColor,
  executionStatusName,
} from "@/lib/functions/executionStyles";
import { InputValues, PageFlow } from "@/types";

function PreviousRuns({
  flowId,
  visibility,
}: {
  flowId: string;
  visibility: "simplified" | "detailed" | "full";
}) {
  const { executions, isLoading } = useFlowExecutionsPaginated(flowId, 10, 0);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="space-y-1.5">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="h-10 rounded-lg bg-default-100/50 animate-pulse" />
        ))}
      </div>
    );
  }

  if (!executions || executions.length === 0) {
    return (
      <p className="text-tiny text-default-400 py-2">
        No previous runs yet.
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {executions.map((ex: any) => {
        const color = executionStatusColor(ex) as any;
        const label = executionStatusName(ex);
        const isExpanded = expandedId === ex.id;
        const started = ex.executed_at && ex.executed_at !== "0001-01-01T00:00:00Z"
          ? new Date(ex.executed_at)
          : new Date(ex.created_at);
        const diff = Date.now() - started.getTime();
        const mins = Math.floor(diff / 60000);
        const timeAgo =
          mins < 1 ? "just now" :
          mins < 60 ? `${mins}m ago` :
          Math.floor(mins / 60) < 24 ? `${Math.floor(mins / 60)}h ago` :
          `${Math.floor(mins / 1440)}d ago`;

        return (
          <div key={ex.id}>
            <button
              className="w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-lg hover:bg-default-100/60 transition-colors text-left"
              onClick={() => setExpandedId(isExpanded ? null : ex.id)}
            >
              <div className="flex items-center gap-2">
                <Chip color={color} size="sm" variant="flat">
                  {label}
                </Chip>
                <span className="text-xs text-default-400">{timeAgo}</span>
              </div>
              <Icon
                className="text-default-400 shrink-0"
                icon={isExpanded ? "hugeicons:arrow-up-01" : "hugeicons:arrow-down-01"}
                width={14}
              />
            </button>
            {isExpanded && (
              <div className="px-3 pb-3">
                <ExecutionViewer
                  executionId={ex.id}
                  visibility={visibility}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface ServicePageClientProps {
  slug: string;
}

export default function ServicePageClient({ slug }: ServicePageClientProps) {
  const router = useRouter();
  const { page, isLoading, isError } = useSelfServicePage(slug);
  const { user } = useUserDetails();
  const { refreshSelfServicePages } = useRefreshCache();

  const [activeFlowId, setActiveFlowId] = useState<string | null>(null);
  const [executionIds, setExecutionIds] = useState<Record<string, string>>({});
  const [executingFlowId, setExecutingFlowId] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  const canManage =
    user?.role === "admin" || user?.role === "editor";

  async function handleExecute(flowId: string, inputs: InputValues) {
    setExecutingFlowId(flowId);
    const res = await ExecuteSelfServiceFlow(slug, flowId, inputs);

    setExecutingFlowId(null);

    if (res.success) {
      setExecutionIds((prev) => ({ ...prev, [flowId]: res.data.execution_id }));
      addToast({
        title: "Workflow started",
        description: "Your request is being processed.",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Error",
        description: ("message" in res ? res.message : ""),
        color: "danger",
        variant: "flat",
      });
    }
  }

  async function handleDelete() {
    if (!page) return;
    setDeleting(true);
    const res = await DeleteSelfServicePage(page.id);

    setDeleting(false);

    if (res.success) {
      refreshSelfServicePages();
      router.push("/services");
    } else {
      addToast({
        title: "Error",
        description: ("message" in res ? res.message : ""),
        color: "danger",
        variant: "flat",
      });
    }
  }

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        <Skeleton className="h-12 w-64 rounded-xl" />
        <Skeleton className="h-48 rounded-xl" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="p-4 flex flex-col items-center justify-center py-24 text-default-400">
        <Icon icon="hugeicons:cancel-circle" width={56} />
        <p className="mt-4 text-lg font-medium">Page not found</p>
        <Button className="mt-4" variant="flat" onPress={() => router.push("/services")}>
          Back to Services
        </Button>
      </div>
    );
  }

  const sortedFlows = [...(page.page_flows ?? [])].sort(
    (a, b) => a.order - b.order,
  );

  return (
    <div className="p-4 space-y-6 max-w-3xl mx-auto">
      {/* Header */}
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        className="flex items-start justify-between gap-4"
        initial={{ opacity: 0, y: -8 }}
      >
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl shrink-0"
            style={{ backgroundColor: `${page.color}20`, color: page.color }}
          >
            <Icon icon={page.icon || "hugeicons:layout-01"} width={32} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{page.name}</h1>
            {page.description && (
              <p className="text-default-400 text-sm mt-0.5">
                {page.description}
              </p>
            )}
          </div>
        </div>
        {canManage && (
          <div className="flex gap-2 shrink-0">
            <Button
              isIconOnly
              size="sm"
              variant="flat"
              onPress={() => router.push(`/services/${slug}/edit`)}
            >
              <Icon icon="hugeicons:pencil-edit-02" width={16} />
            </Button>
            <Button
              color="danger"
              isIconOnly
              isLoading={deleting}
              size="sm"
              variant="flat"
              onPress={handleDelete}
            >
              {!deleting && <Icon icon="hugeicons:delete-02" width={16} />}
            </Button>
          </div>
        )}
      </motion.div>

      {!page.enabled && (
        <Chip color="warning" variant="flat">
          This service page is currently disabled.
        </Chip>
      )}

      {/* Workflow cards */}
      {sortedFlows.map((pf: PageFlow) => {
        const label = pf.custom_label || pf.flow_name || pf.flow_id;
        const desc = pf.custom_description || pf.flow_description;
        const execId = executionIds[pf.flow_id];
        const isRunning = executingFlowId === pf.flow_id;
        const isExpanded = activeFlowId === pf.flow_id;

        return (
          <motion.div
            key={pf.flow_id}
            animate={{ opacity: 1, y: 0 }}
            initial={{ opacity: 0, y: 12 }}
          >
            <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
              <CardHeader
                className="flex items-center justify-between cursor-pointer"
                onClick={() =>
                  setActiveFlowId(isExpanded ? null : pf.flow_id)
                }
              >
                <div className="flex items-center gap-2">
                  <Icon
                    className="text-primary"
                    icon="hugeicons:structure-04"
                    width={20}
                  />
                  <span className="font-semibold">{label}</span>
                  {isRunning && <Spinner size="sm" />}
                </div>
                <Icon
                  icon={
                    isExpanded
                      ? "hugeicons:arrow-up-01"
                      : "hugeicons:arrow-down-01"
                  }
                  width={18}
                />
              </CardHeader>

              {isExpanded && (
                <>
                  <Divider />
                  <CardBody className="gap-4">
                    {desc && (
                      <p className="text-sm text-default-400">{desc}</p>
                    )}
                    <InputForm
                      isLoading={isRunning}
                      pageFlow={pf}
                      onSubmit={(inputs) =>
                        handleExecute(pf.flow_id, inputs)
                      }
                    />
                    {execId && (
                      <div className="mt-2">
                        <Divider className="mb-3" />
                        <p className="text-sm font-medium mb-2">
                          Execution Status
                        </p>
                        <ExecutionViewer
                          executionId={execId}
                          visibility={pf.execution_visibility}
                        />
                      </div>
                    )}

                    <div className="mt-2">
                      <Divider className="mb-3" />
                      <p className="text-sm font-medium mb-2">Previous Runs</p>
                      <PreviousRuns
                        flowId={pf.flow_id}
                        visibility={pf.execution_visibility}
                      />
                    </div>
                  </CardBody>
                </>
              )}
            </Card>
          </motion.div>
        );
      })}

      {sortedFlows.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 text-default-400">
          <Icon icon="hugeicons:structure-04" width={48} />
          <p className="mt-3 text-sm">
            No workflows configured for this page.
          </p>
        </div>
      )}
    </div>
  );
}
