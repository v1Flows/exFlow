"use client";
import { Card, Skeleton } from "@heroui/react";

export default function FlowPageSkeleton() {
  return (
    <main>
      {/* Header skeleton */}
      <div className="flex flex-cols items-center justify-between gap-2 mb-4">
        <div>
          <Skeleton className="h-8 w-64 rounded-lg mb-2" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="flex items-center gap-4">
          <div className="hidden sm:flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-lg" />
            <Skeleton className="h-10 w-20 rounded-lg" />
            <Skeleton className="h-10 w-16 rounded-lg" />
            <Skeleton className="h-10 w-10 rounded-lg" />
          </div>
        </div>
      </div>

      {/* Divider */}
      <div className="h-px bg-divider my-4" />

      {/* Details cards skeleton */}
      <div className="grid grid-cols-2 items-stretch gap-4 lg:grid-cols-4 mb-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="w-full h-full">
            <Card.Content>
              <div className="flex items-center gap-2">
                <Skeleton className="size-10 rounded-sm" />
                <div>
                  <Skeleton className="h-6 w-16 rounded-lg mb-1" />
                  <Skeleton className="h-4 w-20 rounded-lg" />
                </div>
              </div>
            </Card.Content>
          </Card>
        ))}
      </div>

      {/* Tabs skeleton */}
      <div className="mt-8">
        <div className="flex gap-2 border-b border-separator mb-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-10 w-24 rounded-t-lg" />
          ))}
        </div>
        <Card>
          <Card.Content>
            <Skeleton className="h-96 w-full rounded-lg" />
          </Card.Content>
        </Card>
      </div>
    </main>
  );
}
