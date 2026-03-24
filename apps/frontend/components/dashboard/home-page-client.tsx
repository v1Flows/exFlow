"use client";

import ErrorCard from "@/components/error/ErrorCard";
import DashboardHome from "@/components/dashboard/home";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import {
  useFlows,
  useRunners,
  useUserDetails,
  useUserStats,
  useExecutionsWithAttention,
} from "@/lib/swr/hooks/flows";

export default function DashboardHomePageClient() {
  const {
    stats,
    isLoading: statsLoading,
    isError: statsError,
  } = useUserStats();
  const { flows, isLoading: flowsLoading, isError: flowsError } = useFlows();
  const {
    runners,
    isLoading: runnersLoading,
    isError: runnersError,
  } = useRunners();
  const {
    executionsWithAttention,
    isLoading: executionsLoading,
    isError: executionsError,
  } = useExecutionsWithAttention();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Check if any essential data is still loading or missing
  const isLoading =
    statsLoading ||
    flowsLoading ||
    runnersLoading ||
    executionsLoading ||
    userLoading ||
    !stats ||
    !flows ||
    !runners ||
    !executionsWithAttention ||
    !user;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError =
    statsError || flowsError || runnersError || executionsError || userError;

  if (hasError) {
    return (
      <ErrorCard
        error="Failed to load dashboard data"
        message="One or more required data sources failed to load."
      />
    );
  }

  return (
    <DashboardHome
      executionsWithAttention={executionsWithAttention}
      flows={flows}
      runners={runners}
      stats={stats}
      user={user}
    />
  );
}
