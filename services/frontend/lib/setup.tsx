import React, { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";

import { setupApi } from "./api";

interface UseSetupCheckOptions {
  redirectToSetup?: boolean;
  skipCheck?: boolean;
}

interface SetupStatus {
  is_setup: boolean;
  backend_config_exists: boolean;
  frontend_env_exists: boolean;
}

/**
 * Hook to check if the system is set up and optionally redirect to setup page
 */
export function useSetupCheck(options: UseSetupCheckOptions = {}) {
  const [isSetup, setIsSetup] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");
  const router = useRouter();
  const pathname = usePathname();

  const { redirectToSetup = false, skipCheck = false } = options;

  useEffect(() => {
    if (skipCheck) {
      setIsLoading(false);

      return;
    }

    checkSetupStatus();
  }, [skipCheck]);

  const checkSetupStatus = async () => {
    try {
      setIsLoading(true);
      setError("");

      const status: SetupStatus = await setupApi.checkStatus();

      setIsSetup(status.is_setup);

      // Redirect to setup if not configured, redirectToSetup is enabled, and we're not already on setup page
      if (!status.is_setup && redirectToSetup && pathname !== "/setup") {
        router.push("/setup");
      }
    } catch (err: any) {
      setError(err.message || "Failed to check setup status");
      setIsSetup(false);
      
      // If we can't reach the backend, redirectToSetup is enabled, and we're not on setup page, go to setup
      if (redirectToSetup && pathname !== "/setup") {
        router.push("/setup");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const forceRecheck = () => {
    checkSetupStatus();
  };

  return {
    isSetup,
    isLoading,
    error,
    forceRecheck,
  };
}

/**
 * Component to automatically redirect to setup if not configured
 */
export function SetupGuard({ children }: { children: React.ReactNode }) {
  const { isSetup, isLoading } = useSetupCheck({ redirectToSetup: true });
  const pathname = usePathname();

  // Show loading while checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-gray-600">Checking system setup...</p>
        </div>
      </div>
    );
  }

  // If not set up but we're on the setup page, show the children (setup page content)
  if (!isSetup && pathname === "/setup") {
    return <>{children}</>;
  }

  // If not set up and not on setup page, show redirect message
  // (the redirect itself is handled by the hook)
  if (!isSetup) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">Redirecting to setup...</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}

/**
 * Simple function to check setup status without hooks (for use in middleware, etc.)
 */
export async function checkSetupStatus(): Promise<{
  isSetup: boolean;
  error?: string;
}> {
  try {
    const status = await setupApi.checkStatus();

    return { isSetup: status.is_setup };
  } catch (error: any) {
    return { isSetup: false, error: error.message };
  }
}
