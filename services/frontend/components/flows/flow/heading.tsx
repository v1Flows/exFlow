"use client";

import { Button } from "@heroui/react";
import { Icon } from "@iconify/react";

export default function FlowHeading({ flow }: { flow: any }) {
  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{flow.name}</p>
          <p className="text-sm text-default-500">{flow.description}</p>
        </div>
        <Button
          color="primary"
          startContent={<Icon icon="solar:play-linear" width={16} />}
          variant="solid"
        >
          Execute
        </Button>
      </div>
    </main>
  );
}
