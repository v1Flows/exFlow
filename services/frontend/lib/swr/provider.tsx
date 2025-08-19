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
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        refreshInterval: 10000, // Refresh every 10 seconds
        errorRetryCount: 3,
        errorRetryInterval: 5000,
        dedupingInterval: 2000,
        onError: (_error, _key) => {
          // Handle SWR errors silently in production
          // You could send to an error reporting service here
        },
      }}
    >
      {children}
    </SWRConfig>
  );
}
