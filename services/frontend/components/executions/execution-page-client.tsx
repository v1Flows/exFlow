"use client";

import { useState, useEffect } from "react";

import { Execution } from "@/components/executions/execution/execution";
import ErrorCard from "@/components/error/ErrorCard";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import {
  useFlow,
  useExecution,
  usePageSettings,
  useProjectRunners,
  useUserDetails,
} from "@/lib/swr/hooks/flows";

interface ExecutionPageClientProps {
  flowId: string;
  executionId: string;
}

export default function ExecutionPageClient({
  flowId,
  executionId,
}: ExecutionPageClientProps) {
  const [isRunning, setIsRunning] = useState(false);

  const { flow, isLoading: flowLoading, isError: flowError } = useFlow(flowId);
  const {
    execution,
    isLoading: executionLoading,
    isError: executionError,
  } = useExecution(executionId, isRunning);

  useEffect(() => {
    if (execution) {
      const running =
        execution.status === "running" ||
        execution.status === "pending" ||
        execution.status === "paused" ||
        execution.status === "scheduled" ||
        execution.status === "interactionWaiting";
      setIsRunning(running);
    }
  }, [execution]);

  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePageSettings();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Only fetch project runners if we have the flow
  const projectId = (flow as any)?.project_id;
  const {
    runners,
    isLoading: runnersLoading,
    isError: runnersError,
  } = useProjectRunners(projectId || "");

  // Check if any essential data is still loading or missing
  const isLoading =
    flowLoading ||
    executionLoading ||
    settingsLoading ||
    userLoading ||
    !flow ||
    !execution ||
    !settings ||
    !user;

  // Show loading state if essential data is still loading
  if (isLoading || (projectId && runnersLoading)) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError =
    flowError ||
    executionError ||
    settingsError ||
    userError ||
    (projectId && runnersError);

  if (hasError) {
    return (
      <ErrorCard
        error="Failed to load execution data"
        message="One or more required data sources failed to load."
      />
    );
  }

  return (
    <Execution
      execution={execution}
      flow={flow}
      runners={runners || []}
      settings={settings}
      userDetails={user}
    />
  );
}
