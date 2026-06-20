"use client";
import { Button, Card, Chip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter } from "next/navigation";
import { SelfServicePage } from "@/types";
interface PageCardProps {
  page: SelfServicePage;
}
export default function PageCard({ page }: PageCardProps) {
  const router = useRouter();
  return (
    <Button
      className="h-auto w-full justify-start p-0 text-left"
      variant="tertiary"
      onPress={() => router.push(`/services/${page.slug}`)}
    >
      <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm hover:shadow-md transition-shadow">
        <Card.Content className="gap-3 pb-2">
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
                <p className="text-sm text-muted truncate">
                  {page.description}
                </p>
              )}
            </div>
          </div>
        </Card.Content>
        <Card.Footer className="pt-0 gap-2 flex-wrap">
          <Chip size="sm" variant="soft">
            <Chip.Label>
              {page.page_flows?.length ?? 0} workflow
              {(page.page_flows?.length ?? 0) !== 1 ? "s" : ""}
            </Chip.Label>
          </Chip>
          {!page.enabled && (
            <Chip color="warning" size="sm" variant="soft">
              <Chip.Label>Disabled</Chip.Label>
            </Chip>
          )}
        </Card.Footer>
      </Card>
    </Button>
  );
}
