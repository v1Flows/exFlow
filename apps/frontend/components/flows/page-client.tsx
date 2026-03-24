"use client";

import { Divider } from "@heroui/react";

import FlowList from "@/components/flows/list";
import FlowsHeading from "@/components/flows/heading";
import ErrorCard from "@/components/error/ErrorCard";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import {
  useFlows,
  useFolders,
  useProjects,
  useRunningExecutions,
  useUserDetails,
  usePageSettings,
} from "@/lib/swr/hooks/flows";

export default function FlowsPageClient() {
  const { flows, isLoading: flowsLoading, isError: flowsError } = useFlows();
  const {
    folders,
    isLoading: foldersLoading,
    isError: foldersError,
  } = useFolders();
  const {
    projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();
  const { runningExecutions, isLoading: runningExecutionsLoading } =
    useRunningExecutions();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();
  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePageSettings();

  // Check if any essential data is still loading or missing
  const isLoading =
    flowsLoading ||
    foldersLoading ||
    projectsLoading ||
    userLoading ||
    settingsLoading ||
    !flows ||
    !folders ||
    !projects ||
    !user ||
    !settings;

  // Show loading state if essential data is still loading
  if (isLoading || runningExecutionsLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError =
    flowsError || foldersError || projectsError || userError || settingsError;

  if (hasError) {
    return (
      <main>
        <ErrorCard
          error="Failed to load page data"
          message="One or more required data sources failed to load."
        />
      </main>
    );
  }

  return (
    <main>
      <FlowsHeading
        folders={folders}
        projects={projects}
        settings={settings}
        user={user}
      />
      <Divider className="mt-4 mb-4" />
      <FlowList
        flows={flows}
        folders={folders}
        projects={projects}
        runningExecutions={runningExecutions || []}
        user={user}
      />
    </main>
  );
}
