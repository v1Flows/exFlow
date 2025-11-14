"use client";

import { Divider } from "@heroui/react";

import ErrorCard from "@/components/error/ErrorCard";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import { useUserDetails, useRunners, useFlows } from "@/lib/swr/hooks/flows";

import Alerts from "./alerts";
import AlertsHeading from "./heading";

export default function AlertsPageClient() {
  const {
    runners,
    isLoading: runnersLoading,
    isError: runnersError,
  } = useRunners();
  const { flows, isLoading: flowsLoading, isError: flowsError } = useFlows();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Check if any essential data is still loading or missing
  const isLoading =
    runnersLoading || flowsLoading || userLoading || !runners || !user;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError = runnersError || flowsError || userError;

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
      <AlertsHeading />
      <Divider className="mt-4 mb-4" />
      <Alerts showFlow flows={flows} runners={runners} />
    </main>
  );
}
