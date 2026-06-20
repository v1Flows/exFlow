"use client";
import { Icon } from "@iconify/react";
import { Button, Card, Chip, Tooltip } from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { motion } from "framer-motion";
import {
  executionStatusColor,
  executionStatusIcon,
  executionStatusName,
} from "@/lib/functions/executionStyles";
function getDuration(execution: any) {
  if (
    !execution.finished_at ||
    execution.finished_at === "0001-01-01T00:00:00Z"
  ) {
    if (execution.status === "running") {
      return "Running...";
    }
    return "N/A";
  }
  const start = new Date(execution.executed_at).getTime();
  const end = new Date(execution.finished_at).getTime();
  const ms = end - start;
  const sec = Math.floor(ms / 1000);
  if (sec < 60) return `${sec}s`;
  const min = Math.floor(sec / 60);
  if (min < 60) return `${min}m ${sec % 60}s`;
  const hr = Math.floor(min / 60);
  return `${hr}h ${min % 60}m`;
}
export default function ExecutionsTimeline({
  executions,
  runners,
  displayToFlow,
  flows,
}: any) {
  const router = useRouter();
  // Group executions by date
  const groupedExecutions = React.useMemo(() => {
    const groups: Record<string, any[]> = {};
    executions.forEach((execution: any) => {
      const date = new Date(execution.created_at).toLocaleDateString(
        undefined,
        {
          weekday: "long",
          year: "numeric",
          month: "long",
          day: "numeric",
        },
      );
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(execution);
    });
    return groups;
  }, [executions]);
  const sortedDates = Object.keys(groupedExecutions).sort(
    (a, b) => new Date(a).getTime() - new Date(b).getTime(),
  );
  return (
    <div className="flex flex-col gap-8 p-4">
      {sortedDates.map((date) => (
        <div key={date} className="relative">
          {/* Date Header */}
          <div className="sticky top-0 z-20 mb-6 flex items-center gap-4 py-2">
            <Chip variant="soft">
              <Chip.Label>{date}</Chip.Label>
            </Chip>
            <div className="h-px flex-1 bg-gradient-to-r from-default-200/50 to-transparent" />
          </div>

          <div className="relative flex flex-col gap-6 pl-4 sm:pl-8">
            {/* Vertical Line */}
            <div className="absolute bottom-0 left-[19px] top-0 w-px bg-default/50 sm:left-[35px]" />

            {groupedExecutions[date].map((execution: any) => {
              const statusColor = executionStatusColor(execution);
              const runner = runners.find(
                (r: any) => r.id === execution.runner_id,
              );
              const flow = flows?.find((f: any) => f.id === execution.flow_id);
              return (
                <motion.div
                  key={execution.id}
                  animate={{ opacity: 1, x: 0 }}
                  className="relative z-10"
                  initial={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  {/* Timeline Dot */}
                  <div className="absolute left-[-17px] top-6 flex size-10 items-center justify-center rounded-full border-4 border-background bg-surface sm:left-[-17px]">
                    <div
                      className={`flex size-full items-center justify-center rounded-full bg-${statusColor}/20 text-${statusColor}`}
                    >
                      <Icon icon={executionStatusIcon(execution)} width={16} />
                    </div>
                  </div>

                  <Button
                    className="h-auto w-full justify-start p-0 text-left"
                    variant="tertiary"
                    onPress={() =>
                      router.push(
                        `/flows/${execution.flow_id}/execution/${execution.id}`,
                      )
                    }
                  >
                    <Card className="ml-12 w-[calc(100%-3rem)] border border-white/10 bg-surface/40 backdrop-blur-md transition-all hover:scale-[1.01] hover:bg-surface/60">
                      <Card.Content className="p-4">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                          {/* Left: Info */}
                          <div className="flex min-w-0 flex-1 flex-col gap-2">
                            <div className="flex items-center gap-3">
                              <span className="text-lg font-bold">
                                {displayToFlow && flow
                                  ? flow.name
                                  : "Execution"}
                              </span>
                              <Chip
                                className="h-6 border border-white/10"
                                color={statusColor as any}
                                size="sm"
                                variant="soft"
                              >
                                <Chip.Label>
                                  {executionStatusName(execution)}
                                </Chip.Label>
                              </Chip>
                              <span className="font-mono text-xs text-muted">
                                #{execution.id}
                              </span>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted">
                              <div className="flex items-center gap-1.5">
                                <Icon icon="hugeicons:clock-01" width={16} />
                                <span>
                                  {new Date(
                                    execution.executed_at,
                                  ).toLocaleTimeString()}
                                </span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Icon icon="hugeicons:timer-02" width={16} />
                                <span>{getDuration(execution)}</span>
                              </div>
                              {runner && (
                                <div className="flex items-center gap-1.5">
                                  <Icon icon="hugeicons:cpu" width={16} />
                                  <span>{runner.name}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Right: Steps Preview (Mini Timeline) */}
                          {execution.steps && execution.steps.length > 0 && (
                            <div className="flex items-center gap-1 overflow-hidden sm:max-w-[200px] md:max-w-[300px]">
                              {execution.steps
                                .slice(0, 8)
                                .map((step: any, _i: number) => (
                                  <Tooltip key={step.id}>
                                    <Tooltip.Trigger>
                                      <div
                                        className={`h-1.5 w-full min-w-[12px] rounded-full bg-${executionStatusColor(step)} ${step.status === "running" || step.status === "paused" || step.status === "interactionWaiting" || step.status === "scheduled" ? "animate-pulse" : ""}`}
                                      />
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>{`${step.label || step.action.name}: ${step.status}`}</Tooltip.Content>
                                  </Tooltip>
                                ))}
                              {execution.steps.length > 8 && (
                                <span className="text-xs text-muted">
                                  +{execution.steps.length - 8}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Action Button */}
                          <div className="hidden sm:block">
                            <Button
                              variant="ghost"
                              onPress={() =>
                                router.push(
                                  `/flows/${execution.flow_id}/execution/${execution.id}`,
                                )
                              }
                              className="aspect-square p-0"
                            >
                              <Icon
                                icon="hugeicons:arrow-right-01"
                                width={20}
                              />
                            </Button>
                          </div>
                        </div>
                      </Card.Content>
                    </Card>
                  </Button>
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
