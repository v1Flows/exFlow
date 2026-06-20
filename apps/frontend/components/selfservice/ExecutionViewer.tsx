"use client";
import { Button, Card, Chip, Separator, Spinner, toast } from "@heroui/react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";
import { useState } from "react";
import {
  executionStatusColor,
  executionStatusName,
} from "@/lib/functions/executionStyles";
import {
  useExecution,
  useExecutionSteps,
  useUserDetails,
} from "@/lib/swr/hooks/flows";
import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
interface ExecutionViewerProps {
  executionId: string;
  visibility?: "simplified" | "detailed" | "full";
}
const ACTIVE_STATUSES = new Set([
  "running",
  "pending",
  "paused",
  "interactionWaiting",
  "scheduled",
]);
function isActive(status: string) {
  return ACTIVE_STATUSES.has(status);
}
export default function ExecutionViewer({
  executionId,
  visibility = "simplified",
}: ExecutionViewerProps) {
  const { execution, isLoading } = useExecution(executionId);
  const { steps } = useExecutionSteps(executionId, execution?.status);
  const { user } = useUserDetails();
  const [interacting, setInteracting] = useState<string | null>(null);
  async function handleInteract(step: any, approved: boolean) {
    setInteracting(step.id);
    const updated = {
      ...step,
      interaction_approved: approved,
      interaction_rejected: !approved,
      interacted: true,
      interacted_by: user?.id ?? "",
      interacted_at: new Date().toISOString(),
      messages: [
        {
          Title: "Interaction",
          Lines: [
            {
              Content: `Step ${approved ? "approved" : "rejected"} by ${user?.username ?? "user"}`,
              Timestamp: new Date().toISOString(),
            },
          ],
        },
      ],
    };
    const res = await InteractExecutionStep(executionId, step.id, updated);
    setInteracting(null);
    if (res.success) {
      toast(approved ? "Approved" : "Rejected", {
        description: "Interaction recorded.",
      });
    } else {
      toast.danger("Error", {
        description: "message" in res ? res.message : "Failed",
      });
    }
  }
  if (isLoading || !execution) {
    return (
      <div className="flex items-center gap-2 py-4 text-muted">
        <Spinner size="sm" />
        <span className="text-sm">Loading execution…</span>
      </div>
    );
  }
  const statusColor = executionStatusColor(execution) as any;
  const statusName = executionStatusName(execution);
  const active = isActive(execution.status);
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
      initial={{ opacity: 0, y: 8 }}
    >
      {/* Status banner */}
      <Card className="bg-surface/60 backdrop-blur-md border border-default">
        <Card.Content className="flex flex-row items-center gap-3 py-3">
          {active ? (
            <Spinner color={statusColor} size="sm" />
          ) : (
            <Icon
              className={`text-${statusColor}`}
              icon={
                execution.status === "success"
                  ? "hugeicons:checkmark-circle-02"
                  : execution.status === "error"
                    ? "hugeicons:cancel-circle"
                    : "hugeicons:information-circle"
              }
              width={22}
            />
          )}
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <Chip color={statusColor} size="sm" variant="soft">
                <Chip.Label>{statusName}</Chip.Label>
              </Chip>
              {active && (
                <span className="text-xs text-muted animate-pulse">
                  In progress…
                </span>
              )}
            </div>
            {visibility !== "simplified" && (
              <p className="text-xs text-muted mt-0.5">ID: {execution.id}</p>
            )}
          </div>
        </Card.Content>
      </Card>

      {/* Interaction required — always visible regardless of visibility setting */}
      {steps
        .filter((s: any) => s.status === "interactionWaiting" && !s.interacted)
        .map((step: any, idx: number) => (
          <Card
            key={step.id ?? idx}
            className="border border-warning/30 bg-warning/10 backdrop-blur-md"
          >
            <Card.Content className="flex flex-col gap-3 py-4">
              <div className="flex items-center gap-2">
                <Icon
                  className="text-warning shrink-0"
                  icon="hugeicons:alert-02"
                  width={20}
                />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-warning">
                    User Interaction Required
                  </p>
                  <p className="text-xs text-warning/80">
                    {step.label || step.action?.name || `Step ${idx + 1}`} —
                    approve or reject to continue
                  </p>
                </div>
              </div>
              <div className="flex gap-2 justify-end">
                <Button
                  isPending={interacting === step.id}
                  size="sm"
                  variant="tertiary"
                  onPress={() => handleInteract(step, true)}
                >
                  {interacting !== step.id && <Icon icon="hugeicons:tick-02" />}
                  Approve
                </Button>
                <Button
                  isPending={interacting === step.id}
                  size="sm"
                  variant="danger-soft"
                  onPress={() => handleInteract(step, false)}
                >
                  {interacting !== step.id && (
                    <Icon icon="hugeicons:cancel-01" />
                  )}
                  Reject
                </Button>
              </div>
            </Card.Content>
          </Card>
        ))}

      {/* Steps (detailed + full) */}
      {(visibility === "detailed" || visibility === "full") &&
        steps.length > 0 && (
          <Card className="bg-surface/60 backdrop-blur-md border border-default">
            <Card.Content className="gap-2 py-3">
              <p className="text-sm font-medium mb-1">Steps</p>
              <Separator />
              <div className="space-y-2 mt-2">
                {steps.map((step: any, idx: number) => {
                  const sColor = executionStatusColor(step) as any;
                  const sName = executionStatusName(step);
                  return (
                    <div
                      key={step.id ?? idx}
                      className="flex items-start gap-2"
                    >
                      <Icon
                        className={`text-${sColor} mt-0.5 shrink-0`}
                        icon={
                          step.status === "running"
                            ? "hugeicons:loading-02"
                            : step.status === "success"
                              ? "hugeicons:checkmark-circle-02"
                              : step.status === "error"
                                ? "hugeicons:cancel-circle"
                                : "hugeicons:circle"
                        }
                        width={16}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          {step.action?.icon && (
                            <Icon
                              className={`text-${sColor} shrink-0`}
                              icon={step.action.icon}
                              width={14}
                            />
                          )}
                          <span className="text-sm font-medium">
                            {step.label ||
                              step.action?.name ||
                              `Step ${idx + 1}`}
                          </span>
                          <Chip color={sColor} size="sm" variant="soft">
                            <Chip.Label>{sName}</Chip.Label>
                          </Chip>
                        </div>
                        {/* Messages in "full" mode */}
                        {visibility === "full" &&
                          step.messages &&
                          step.messages.length > 0 && (
                            <div className="mt-2 rounded-md bg-[#1e1e1e]/60 p-2 max-h-48 overflow-auto font-mono text-xs space-y-0.5">
                              {step.messages
                                .flatMap((msg: any) => msg.lines ?? [])
                                .map((line: any, li: number) => {
                                  const color =
                                    !line.color || line.color === "default"
                                      ? "text-muted"
                                      : line.color === "info" ||
                                          line.color === "primary"
                                        ? "text-accent-400"
                                        : line.color === "success"
                                          ? "text-success"
                                          : line.color === "warning"
                                            ? "text-warning"
                                            : line.color === "danger" ||
                                                line.color === "error"
                                              ? "text-danger"
                                              : `text-${line.color}`;
                                  return (
                                    <div
                                      key={li}
                                      className={`flex gap-2 ${color}`}
                                    >
                                      {line.timestamp && (
                                        <span className="shrink-0 text-muted opacity-60">
                                          {new Date(
                                            line.timestamp,
                                          ).toLocaleTimeString()}
                                        </span>
                                      )}
                                      <span className="whitespace-pre-wrap break-all">
                                        {line.content}
                                      </span>
                                    </div>
                                  );
                                })}
                            </div>
                          )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </Card.Content>
          </Card>
        )}
    </motion.div>
  );
}
