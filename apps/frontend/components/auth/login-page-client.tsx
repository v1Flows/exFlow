"use client";

import LoginPageComponent from "@/components/auth/loginPage";
import { PageSkeleton } from "@/components/loading/page-skeleton";
import { usePageSettings } from "@/lib/swr/hooks/flows";

export default function LoginPageClient() {
  const { settings, isLoading, isError } = usePageSettings();

  if (isLoading) {
    return <PageSkeleton />;
  }

  if (isError || !settings) {
    // For login page, we can fall back to some default settings or show a basic login form
    return <LoginPageComponent settings={{}} />;
  }

  return <LoginPageComponent settings={settings} />;
}
