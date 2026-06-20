"use client";
import { Skeleton } from "@heroui/react";

import PageBuilder from "@/components/selfservice/PageBuilder";
import { useSelfServicePage } from "@/lib/swr/hooks/selfservice";

interface EditServicePageClientProps {
  slug: string;
}

export default function EditServicePageClient({
  slug,
}: EditServicePageClientProps) {
  const { page, isLoading, isError } = useSelfServicePage(slug);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4 max-w-3xl mx-auto">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-64 rounded-xl" />
      </div>
    );
  }

  if (isError || !page) {
    return (
      <div className="p-4 text-muted text-center py-16">Page not found.</div>
    );
  }

  return <PageBuilder existing={page} />;
}
