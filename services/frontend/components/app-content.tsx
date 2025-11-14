"use client";

import { ReactNode } from "react";

import { SetupGuard } from "@/lib/setup";

interface AppContentProps {
  children: ReactNode;
}

export function AppContent({ children }: AppContentProps) {
  return <SetupGuard>{children}</SetupGuard>;
}
