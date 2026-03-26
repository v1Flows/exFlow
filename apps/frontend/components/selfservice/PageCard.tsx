"use client";

import { Card, CardBody, CardFooter, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";

import { SelfServicePage } from "@/types";

interface PageCardProps {
  page: SelfServicePage;
}

export default function PageCard({ page }: PageCardProps) {
  const router = useRouter();

  return (
    <Card
      isPressable
      className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm hover:shadow-md transition-shadow"
      onPress={() => router.push(`/services/${page.slug}`)}
    >
      <CardBody className="gap-3 pb-2">
        <div className="flex items-center gap-3">
          <div
            className="p-3 rounded-xl"
            style={{ backgroundColor: `${page.color}20`, color: page.color }}
          >
            <Icon icon={page.icon || "hugeicons:layout-01"} width={28} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-semibold truncate">{page.name}</p>
            {page.description && (
              <p className="text-sm text-default-400 truncate">
                {page.description}
              </p>
            )}
          </div>
        </div>
      </CardBody>
      <CardFooter className="pt-0 gap-2 flex-wrap">
        <Chip size="sm" variant="flat">
          {page.page_flows?.length ?? 0} workflow
          {(page.page_flows?.length ?? 0) !== 1 ? "s" : ""}
        </Chip>
        {!page.enabled && (
          <Chip color="warning" size="sm" variant="flat">
            Disabled
          </Chip>
        )}
      </CardFooter>
    </Card>
  );
}
