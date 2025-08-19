"use client";

import ErrorCard from "@/components/error/ErrorCard";
import { UserProfile } from "@/components/user/profile";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import { usePageSettings, useUserDetails } from "@/lib/swr/hooks/flows";

interface ProfilePageClientProps {
  session?: string;
}

export default function ProfilePageClient({ session }: ProfilePageClientProps) {
  const {
    settings,
    isLoading: settingsLoading,
    isError: settingsError,
  } = usePageSettings();
  const { user, isLoading: userLoading, isError: userError } = useUserDetails();

  // Check if any essential data is still loading or missing
  const isLoading = settingsLoading || userLoading || !settings || !user;

  // Show loading state if essential data is still loading
  if (isLoading) {
    return <PageSkeleton />;
  }

  // Show error state
  const hasError = settingsError || userError;

  if (hasError) {
    return (
      <ErrorCard
        error="Failed to load page data"
        message="One or more required data sources failed to load."
      />
    );
  }

  return <UserProfile session={session} settings={settings} user={user} />;
}
