"use client";

import ErrorCard from "@/components/error/ErrorCard";
import Project from "@/components/projects/project";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import {
  useFlows,
  usePageSettings,
  useProject,
  useProjectRunners,
  useProjectApiKeys,
  useProjectAuditLogs,
  useUserDetails,
} from "@/lib/swr/hooks/flows";

interface ProjectPageClientProps {
  projectId: string;
}

export default function ProjectPageClient({
  projectId,
}: ProjectPageClientProps) {
  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePageSettings();
  const {
    project,
    isLoading: projectLoading,
    isError: projectError,
  } = useProject(projectId);
  const {
    runners,
    isLoading: runnersLoading,
    isError: runnersError,
  } = useProjectRunners(projectId);
  const {
    tokens,
    isLoading: tokensLoading,
    isError: tokensError,
  } = useProjectApiKeys(projectId);
  const {
    audit,
    isLoading: auditLoading,
    isError: auditError,
  } = useProjectAuditLogs(projectId);
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();
  const { flows, isLoading: flowsLoading, isError: flowsError } = useFlows();

  // Check if any essential data is still loading or missing
  const isLoading =
    settingsLoading ||
    projectLoading ||
    runnersLoading ||
    tokensLoading ||
    auditLoading ||
    userLoading ||
    flowsLoading ||
    !settings ||
    !project ||
    !runners ||
    !tokens ||
    !audit ||
    !user ||
    !flows;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError =
    settingsError ||
    projectError ||
    runnersError ||
    tokensError ||
    auditError ||
    userError ||
    flowsError;

  if (hasError) {
    return (
      <ErrorCard
        error="Failed to load project data"
        message="One or more required data sources failed to load."
      />
    );
  }

  return (
    <Project
      audit={audit}
      flows={flows}
      project={project}
      runners={runners}
      settings={settings}
      tokens={tokens}
      user={user}
    />
  );
}
