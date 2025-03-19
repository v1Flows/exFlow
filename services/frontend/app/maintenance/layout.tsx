import React from "react";

export default function DashboardHomeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <main className="container mx-auto max-w-7xl grow px-6 pt-2">
        {children}
      </main>
    </>
  );
}
