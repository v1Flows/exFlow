"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import * as React from "react";
import { ToastProvider } from "@heroui/react";

import SWRProvider from "@/lib/swr/provider";
import { SearchProvider } from "@/components/search/search-context";
import SearchModal from "@/components/search/search-modal";

type ThemeProviderProps = React.ComponentProps<typeof NextThemesProvider>;

export type ProvidersProps = {
  children: React.ReactNode;
  themeProps?: ThemeProviderProps;
};

export function Providers({ children, themeProps }: ProvidersProps) {
  return (
    <SWRProvider>
      <ToastProvider />
      <NextThemesProvider {...themeProps}>
        <SearchProvider>
          {children}
          <SearchModal />
        </SearchProvider>
      </NextThemesProvider>
    </SWRProvider>
  );
}
