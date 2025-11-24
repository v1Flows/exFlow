import React from "react";

import { setupApi } from "./api";

/**
 * Component to automatically redirect to setup if not configured
 * NOTE: Setup routing is now primarily handled by middleware.
 * This component is kept minimal to avoid client-side setup checks.
 */
export function SetupGuard({ children }: { children: React.ReactNode }) {
  // Simply render children - middleware handles setup page routing
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
