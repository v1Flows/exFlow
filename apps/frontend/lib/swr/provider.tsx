"use client";

import { SWRConfig } from "swr";
import { ReactNode } from "react";

interface SWRProviderProps {
  children: ReactNode;
}

export default function SWRProvider({ children }: SWRProviderProps) {
  return (
    <SWRConfig
      value={{
        // Conservative defaults to avoid aggressive background network activity
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
        refreshInterval: 0, // No automatic polling by default
        refreshWhenHidden: false,
        refreshWhenOffline: false,
        errorRetryCount: 1,
        errorRetryInterval: 2000,
        dedupingInterval: 5000,
        focusThrottleInterval: 5000,
        shouldRetryOnError: false,
        onError: (err, key) => {
          // Basic error logging; adapt to your telemetry if needed
          // Keep minimal to avoid noisy logs for expected client errors
          // eslint-disable-next-line no-console
          console.error("SWR error", { key, err });
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
