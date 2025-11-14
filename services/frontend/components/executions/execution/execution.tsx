"use client";

import { Icon } from "@iconify/react";
import { addToast, Button, ButtonGroup, Divider, Spacer } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";

import { useExecutionSteps } from "@/lib/swr/hooks/flows";
import APICancelExecution from "@/lib/fetch/executions/cancel";
import { useExecutionStepStyleStore } from "@/lib/functions/userExecutionStepStyle";
import RefreshButton from "@/components/ui/refresh-button";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

import AdminExecutionActions from "./adminExecutionActions";
import ExecutionDetails from "./details";
import { ExecutionStepsTable } from "./executionStepsTable";
import { ExecutionStepsAccordion } from "./executionStepsAccordion";

export function Execution({ flow, execution, runners, userDetails }: any) {
  const router = useRouter();

  const { displayStyle, setDisplayStyle } = useExecutionStepStyleStore();

  // Check if execution is running to enable auto-refresh
  const isRunning =
    execution.status === "running" ||
    execution.status === "pending" ||
    execution.status === "paused" ||
    execution.status === "scheduled" ||
    execution.status === "interactionWaiting";

  // Use SWR for auto-refreshing execution steps data
  const { steps, isError } = useExecutionSteps(execution.id, isRunning);
  const { refreshExecution, refreshExecutionSteps } = useRefreshCache();
  const [executionLoading, setExecutionLoading] = useState(false);

  // Handle SWR errors
  React.useEffect(() => {
    if (isError) {
      addToast({
        title: "Error fetching execution steps",
        description: "Failed to load execution steps. Please try refreshing.",
        color: "danger",
        variant: "flat",
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
    <>
      <div className="flex flex-wrap items-center justify-between">
        <Button variant="flat" onPress={() => router.back()}>
          <Icon icon="hugeicons:link-backward" width={20} />
          Back
        </Button>
        <div className="flex flex-wrap mt-2 items-center gap-4 lg:mt-0 lg:justify-end">
          {(execution.status === "running" ||
            execution.status === "paused" ||
            execution.status === "pending" ||
            execution.status === "scheduled" ||
            execution.status === "interactionWaiting") && (
            <Button
              color="danger"
              startContent={<Icon icon="hugeicons:cancel-01" width={20} />}
              variant="shadow"
              onPress={() => {
                APICancelExecution(execution.id)
                  .then(() => {
                    addToast({
                      title: "Request to cancel execution sent",
                      color: "success",
                    });
                  })
                  .catch((err) => {
                    addToast({
                      title: "Execution cancel failed",
                      description: err.message,
                      color: "danger",
                    });
                  });
              }}
            >
              Cancel Execution
            </Button>
          )}

          {userDetails.role === "admin" && (
            <AdminExecutionActions execution={execution} />
          )}

          <ButtonGroup radius="sm" size="md">
            <Button
              isIconOnly
              startContent={
                <Icon icon="hugeicons:right-to-left-list-triangle" width={18} />
              }
              variant={displayStyle === "accordion" ? "solid" : "flat"}
              onPress={() => {
                setDisplayStyle("accordion");
              }}
            />
            <Button
              isIconOnly
              startContent={
                <Icon icon="hugeicons:layout-table-01" width={18} />
              }
              variant={displayStyle === "table" ? "solid" : "flat"}
              onPress={() => {
                setDisplayStyle("table");
              }}
            />
          </ButtonGroup>

          {(execution.status === "running" ||
            execution.status === "pending" ||
            execution.status === "paused" ||
            execution.status === "scheduled" ||
            execution.status === "interactionWaiting") && (
            <div className="flex items-center gap-2">
              <Divider className="h-10 mr-1 ml-1" orientation="vertical" />
              {isRunning && (
                <div className="flex items-center gap-1 text-sm text-success">
                  <Icon icon="hugeicons:refresh" width={16} />
                  Auto-refresh 2s
                </div>
              )}
              <RefreshButton
                isIconOnly
                isLoading={executionLoading}
                onRefresh={handleRefresh}
              />
            </div>
          )}
        </div>
      </div>
      <Divider className="my-4" />
      <ExecutionDetails execution={execution} runners={runners} steps={steps} />
      <Spacer y={4} />

      {displayStyle === "table" && (
        <ExecutionStepsTable
          execution={execution}
          flow={flow}
          runners={runners}
          steps={steps}
          userDetails={userDetails}
        />
      )}

      {displayStyle === "accordion" && (
        <ExecutionStepsAccordion
          execution={execution}
          flow={flow}
          runners={runners}
          steps={steps}
          userDetails={userDetails}
        />
      )}
    </>
  );
}
