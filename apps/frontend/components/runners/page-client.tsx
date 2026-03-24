"use client";

import { Divider } from "@heroui/react";

import RunnersList from "@/components/runners/list";
import RunnersHeading from "@/components/runners/heading";
import ErrorCard from "@/components/error/ErrorCard";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import { useRunners, useProjects, useUserDetails } from "@/lib/swr/hooks/flows";

export default function RunnersPageClient() {
  const {
    runners,
    isLoading: runnersLoading,
    isError: runnersError,
  } = useRunners();
  const {
    projects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Check if any essential data is still loading or missing
  const isLoading =
    runnersLoading ||
    projectsLoading ||
    userLoading ||
    !runners ||
    !projects ||
    !user;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError = runnersError || projectsError || userError;

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
      <RunnersHeading />
      <Divider className="mt-4 mb-4" />
      <RunnersList
        globalView
        projects={projects}
        runners={runners}
        user={user}
      />
    </main>
  );
}
