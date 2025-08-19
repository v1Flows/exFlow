import useSWR from "swr";

import { GetFlow } from "@/lib/fetch/flow/flow";
import { GetFlowExecutions } from "@/lib/fetch/flow/executions";
import GetFlows from "@/lib/fetch/flow/all";
import GetProjects from "@/lib/fetch/project/all";
import GetUserDetails from "@/lib/fetch/user/getDetails";
import GetFolders from "@/lib/fetch/folder/all";
import PageGetSettings from "@/lib/fetch/page/settings";
import GetProjectRunners from "@/lib/fetch/project/runners";
import GetProject from "@/lib/fetch/project/data";
import GetRunners from "@/lib/fetch/runner/get";
import GetRunningExecutions from "@/lib/fetch/executions/running";
import GetUserStats from "@/lib/fetch/user/stats";
import GetExecutionsWithAttention from "@/lib/fetch/executions/attention";
import GetProjectAuditLogs from "@/lib/fetch/project/audit";
import GetProjectApiKeys from "@/lib/fetch/project/tokens";
import GetExecution from "@/lib/fetch/executions/execution";
import GetExecutions from "@/lib/fetch/executions/all";
import GetExecutionSteps from "@/lib/fetch/executions/steps";

// Hook for fetching a single flow
export function useFlow(flowId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    flowId ? `flow-${flowId}` : null,
    () => GetFlow(flowId),
  );

  return {
    flow: data?.success ? data.data.flow : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching flow executions
export function useFlowExecutions(flowId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    flowId ? `flow-executions-${flowId}` : null,
    () => GetFlowExecutions(flowId, 50, 0),
  );

  return {
    executions: data?.success ? data.data.executions : [],
    total: data?.success ? data.data.total : 0,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching paginated flow executions with filters
export function useFlowExecutionsPaginated(
  flowId: string,
  limit: number = 10,
  offset: number = 0,
  status: string | null = null,
) {
  const { data, error, mutate, isLoading } = useSWR(
    flowId
      ? `flow-executions-paginated-${flowId}-${limit}-${offset}-${status || "all"}`
      : null,
    () => GetFlowExecutions(flowId, limit, offset, status),
  );

  return {
    executions: data?.success ? data.data.executions : [],
    total: data?.success ? data.data.total : 0,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching all executions with pagination and filters
export function useExecutions(
  limit: number = 10,
  offset: number = 0,
  status: string | null = null,
) {
  const { data, error, mutate, isLoading } = useSWR(
    limit > 0 ? `executions-${limit}-${offset}-${status || "all"}` : null,
    () => GetExecutions(limit, offset, status),
  );

  return {
    executions: data?.success ? data.data.executions : [],
    total: data?.success ? data.data.total : 0,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching all flows
export function useFlows() {
  const { data, error, mutate, isLoading } = useSWR("flows", () => GetFlows());

  return {
    flows: data?.success ? data.data.flows : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching all projects
export function useProjects() {
  const { data, error, mutate, isLoading } = useSWR("projects", () =>
    GetProjects(),
  );

  return {
    projects: data?.success ? data.data.projects : [],
    pendingProjects: data?.success ? data.data.pending_projects : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching user details
export function useUserDetails() {
  const { data, error, mutate, isLoading } = useSWR("user-details", () =>
    GetUserDetails(),
  );

  return {
    user: data?.success ? data.data.user : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching folders
export function useFolders() {
  const { data, error, mutate, isLoading } = useSWR("folders", () =>
    GetFolders(),
  );

  return {
    folders: data?.success ? data.data.folders : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching page settings
export function usePageSettings() {
  const { data, error, mutate, isLoading } = useSWR("page-settings", () =>
    PageGetSettings(),
  );

  return {
    settings: data?.success ? data.data.settings : {},
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching project runners
export function useProjectRunners(projectId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    projectId ? `project-runners-${projectId}` : null,
    () => GetProjectRunners(projectId),
  );

  return {
    runners: data?.success ? data.data.runners : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching a single project
export function useProject(projectId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    projectId ? `project-${projectId}` : null,
    () => GetProject(projectId),
  );

  return {
    project: data?.success ? data.data.project : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching all runners
export function useRunners() {
  const { data, error, mutate, isLoading } = useSWR("runners", () =>
    GetRunners(),
  );

  return {
    runners: data?.success ? data.data.runners : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching running executions
export function useRunningExecutions() {
  const { data, error, mutate, isLoading } = useSWR("running-executions", () =>
    GetRunningExecutions(),
  );

  return {
    runningExecutions: data?.success ? data.data : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching user stats
export function useUserStats() {
  const { data, error, mutate, isLoading } = useSWR("user-stats", () =>
    GetUserStats(),
  );

  return {
    stats: data?.success ? data.data.stats : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching executions with attention
export function useExecutionsWithAttention() {
  const { data, error, mutate, isLoading } = useSWR(
    "executions-with-attention",
    () => GetExecutionsWithAttention(),
  );

  return {
    executionsWithAttention: data?.success ? data.data.executions : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching project audit logs
export function useProjectAuditLogs(projectId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    projectId ? `project-audit-${projectId}` : null,
    () => GetProjectAuditLogs(projectId),
  );

  return {
    audit: data?.success ? data.data.audit : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching project API keys
export function useProjectApiKeys(projectId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    projectId ? `project-tokens-${projectId}` : null,
    () => GetProjectApiKeys(projectId),
  );

  return {
    tokens: data?.success ? data.data.tokens : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching a single execution
export function useExecution(executionId: string) {
  const { data, error, mutate, isLoading } = useSWR(
    executionId ? `execution-${executionId}` : null,
    () => GetExecution(executionId),
  );

  return {
    execution: data?.success ? data.data.execution : null,
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}

// Hook for fetching execution steps with auto-refresh for running executions
export function useExecutionSteps(
  executionId: string,
  isRunning: boolean = false,
) {
  const { data, error, mutate, isLoading } = useSWR(
    executionId ? `execution-steps-${executionId}` : null,
    () => GetExecutionSteps(executionId),
    {
      refreshInterval: isRunning ? 2000 : 0, // Refresh every 2 seconds if running
      refreshWhenHidden: false,
      refreshWhenOffline: false,
    },
  );

  return {
    steps: data?.success ? data.data.steps : [],
    isLoading,
    isError: error || (data && !data.success),
    refresh: mutate,
  };
}
