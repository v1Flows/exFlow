"use client";
import { Icon } from "@iconify/react";
import { Button, Card, Separator, toast } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { useExecutionSteps } from "@/lib/swr/hooks/flows";
import APICancelExecution from "@/lib/fetch/executions/cancel";
import RefreshButton from "@/components/ui/refresh-button";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import AdminExecutionActions from "./adminExecutionActions";
import ExecutionDetails from "./details";
import ExecutionTimeline from "./timeline";
export function Execution({ flow, execution, runners, userDetails }: any) {
  const router = useRouter();
  // Check if execution is running to enable auto-refresh
  const isRunning =
    execution.status === "running" ||
    execution.status === "pending" ||
    execution.status === "paused" ||
    execution.status === "scheduled" ||
    execution.status === "interactionWaiting";
  // Use SWR for auto-refreshing execution steps data; pass status to stop polling on terminal states
  const { steps, isError } = useExecutionSteps(execution.id, execution.status);
  const { refreshExecution, refreshExecutionSteps } = useRefreshCache();
  const [executionLoading, setExecutionLoading] = useState(false);
  // Handle SWR errors
  React.useEffect(() => {
    if (isError) {
      toast.danger("Error fetching execution steps", {
        description: "Failed to load execution steps. Please try refreshing.",
      });
    }
  }, [isError]);
  const handleRefresh = async () => {
    setExecutionLoading(true);
    await refreshExecution(execution.id);
    await refreshExecutionSteps(execution.id);
    setExecutionLoading(false);
  };
  return (
    <div className="flex flex-col gap-6 h-[calc(100vh-100px)]">
      {/* Header Card */}
      <Card className="bg-surface/60 backdrop-blur-md border border-white/10 shrink-0">
        <Card.Content className="p-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Button variant="ghost" onPress={() => router.back()}>
                {<Icon icon="hugeicons:link-backward" width={20} />}
                Back
              </Button>
              <Separator className="h-6" orientation="vertical" />
              <div className="flex items-center gap-2">
                <span className="text-lg font-semibold">Execution Details</span>
                <span className="font-mono text-sm text-muted">
                  #{execution.id}
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {isRunning && (
                <Button
                  variant="danger-soft"
                  onPress={() => {
                    APICancelExecution(execution.id)
                      .then(() => {
                        toast.success("Request to cancel execution sent");
                      })
                      .catch((err) => {
                        toast.danger("Execution cancel failed", {
                          description: err.message,
                        });
                      });
                  }}
                >
                  {<Icon icon="hugeicons:cancel-01" width={20} />}
                  Cancel Execution
                </Button>
              )}

              {userDetails.role === "admin" && (
                <AdminExecutionActions execution={execution} />
              )}

              {isRunning && (
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-surface-secondary/50 border border-default/50">
                  <div className="flex items-center gap-1 text-sm text-success animate-pulse">
                    <Icon icon="hugeicons:refresh" width={16} />
                    <span className="font-medium">Live</span>
                  </div>
                  <Separator className="h-4" orientation="vertical" />
                  <RefreshButton
                    isIconOnly
                    isLoading={executionLoading}
                    size="sm"
                    variant="tertiary"
                    onRefresh={handleRefresh}
                  />
                </div>
              )}

              {!isRunning && (
                <RefreshButton
                  isIconOnly
                  isLoading={executionLoading}
                  onRefresh={handleRefresh}
                />
              )}
            </div>
          </div>

          <Separator className="my-4" />

          <ExecutionDetails
            execution={execution}
            runners={runners}
            steps={steps}
          />
        </Card.Content>
      </Card>

      {/* Main Timeline View */}
      <div className="flex-1 overflow-hidden">
        <ExecutionTimeline
          execution={execution}
          flow={flow}
          runners={runners}
          steps={steps}
          userDetails={userDetails}
        />
      </div>
    </div>
  );
}
