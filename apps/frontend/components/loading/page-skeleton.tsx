import { Card, CardBody, Skeleton, Spacer } from "@heroui/react";

export function PageSkeleton() {
  return (
    <main>
      {/* Heading skeleton */}
      <div className="flex items-center justify-between">
        <div>
          <Skeleton className="w-48 rounded-lg">
            <div className="h-8 w-48 rounded-lg bg-default-200" />
          </Skeleton>
          <Spacer y={2} />
          <Skeleton className="w-32 rounded-lg">
            <div className="h-5 w-32 rounded-lg bg-default-300" />
          </Skeleton>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-24 rounded-lg">
            <div className="h-10 w-24 rounded-lg bg-default-200" />
          </Skeleton>
          <Skeleton className="w-24 rounded-lg">
            <div className="h-10 w-24 rounded-lg bg-default-200" />
          </Skeleton>
        </div>
      </div>

      <Spacer y={4} />

      {/* Divider skeleton */}
      <Skeleton className="w-full rounded-lg">
        <div className="h-px w-full rounded-lg bg-default-200" />
      </Skeleton>

      <Spacer y={4} />

      {/* Content skeleton */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Card key={i}>
            <CardBody className="p-4">
              <Skeleton className="w-full rounded-lg">
                <div className="h-6 w-full rounded-lg bg-default-300" />
              </Skeleton>
              <Spacer y={2} />
              <Skeleton className="w-3/4 rounded-lg">
                <div className="h-4 w-3/4 rounded-lg bg-default-200" />
              </Skeleton>
              <Spacer y={1} />
              <Skeleton className="w-1/2 rounded-lg">
                <div className="h-4 w-1/2 rounded-lg bg-default-200" />
              </Skeleton>
            </CardBody>
          </Card>
        ))}
      </div>
    </main>
  );
}
