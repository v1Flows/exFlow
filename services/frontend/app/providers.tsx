"use client";

import { HeroUIProvider } from "@heroui/system";
import { ThemeProvider as NextThemesProvider } from "next-themes";
import { useRouter } from "next/navigation";
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
  const router = useRouter();

  return (
    <SWRProvider>
      <HeroUIProvider navigate={router.push}>
        <ToastProvider />
        <NextThemesProvider {...themeProps}>
          <SearchProvider>
            {children}
            <SearchModal />
          </SearchProvider>
        </NextThemesProvider>
      </HeroUIProvider>
    </SWRProvider>
  );
}
