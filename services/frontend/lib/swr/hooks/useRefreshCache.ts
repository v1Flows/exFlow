import { mutate } from "swr";

/**
 * Custom hook that provides SWR cache refresh functions for different data types
 * Use this in modals instead of router.refresh() to update SWR cache after mutations
 *
 * This approach uses direct cache key mutations instead of importing all hooks
 * to avoid potential circular dependencies and bundle size issues.
 */
export function useRefreshCache() {
  return {
    // Direct cache key refreshes
    refreshFlows: () => mutate("flows"),
    refreshProjects: () => mutate("projects"),
    refreshFolders: () => mutate("folders"),
    refreshRunners: () => mutate("runners"),
    refreshUser: () => mutate("user-details"),
    refreshUserStats: () => mutate("user-stats"),
    refreshExecutionsWithAttention: () => mutate("executions-with-attention"),
    refreshRunningExecutions: () => mutate("running-executions"),
    refreshPageSettings: () => mutate("page-settings"),

    // Specific entity refreshes
    refreshFlow: (flowId: string) => mutate(`flow-${flowId}`),
    refreshFlowExecutions: (flowId: string) =>
      mutate(`flow-executions-${flowId}`),
    refreshProject: (projectId: string) => mutate(`project-${projectId}`),
    refreshProjectRunners: (projectId: string) =>
      mutate(`project-runners-${projectId}`),
    refreshProjectAudit: (projectId: string) =>
      mutate(`project-audit-${projectId}`),
    refreshProjectTokens: (projectId: string) =>
      mutate(`project-tokens-${projectId}`),
    refreshExecution: (executionId: string) =>
      mutate(`execution-${executionId}`),
    refreshFolder: (folderId: string) => mutate(`folder-${folderId}`),
    refreshFolderExecutions: (folderId: string) =>
      mutate(`folder-executions-${folderId}`),

    // Convenience methods for common combinations
    refreshAll: () => {
      mutate("flows");
      mutate("projects");
      mutate("folders");
      mutate("runners");
      mutate("user-details");
      mutate("user-stats");
      mutate("executions-with-attention");
      mutate("running-executions");
      mutate("page-settings");
    },

    refreshProjectData: () => {
      mutate("projects");
      mutate("flows");
      mutate("folders");
      mutate("runners");
    },

    refreshFlowData: (flowId?: string) => {
      mutate("flows");
      mutate("running-executions");
      mutate("executions-with-attention");
      if (flowId) {
        mutate(`flow-${flowId}`);
        mutate(`flow-executions-${flowId}`);
      }
    },

    refreshAllFlowData: (flowId?: string) => {
      mutate("flows");
      mutate("running-executions");
      mutate("executions-with-attention");
      if (flowId) {
        mutate(`flow-${flowId}`);
        mutate(`flow-executions-${flowId}`);
      }
    },
  };
}
