"use client";

import { Divider } from "@heroui/react";

import ErrorCard from "@/components/error/ErrorCard";
import { ProjectsList } from "@/components/projects/list";
import ProjectsHeading from "@/components/projects/heading";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import {
  useProjects,
  usePageSettings,
  useUserDetails,
} from "@/lib/swr/hooks/flows";

export default function ProjectsPageClient() {
  const {
    projects,
    pendingProjects,
    isLoading: projectsLoading,
    isError: projectsError,
  } = useProjects();
  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePageSettings();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Check if any essential data is still loading or missing
  const isLoading =
    projectsLoading ||
    settingsLoading ||
    userLoading ||
    !projects ||
    !settings ||
    !user;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError = projectsError || settingsError || userError;

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
      <ProjectsHeading settings={settings} user={user} />
      <Divider className="mt-4 mb-4" />
      <ProjectsList
        pending_projects={pendingProjects || []}
        projects={projects}
        settings={settings}
        user={user}
      />
    </main>
  );
}
