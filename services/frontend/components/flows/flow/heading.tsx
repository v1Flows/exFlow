"use client";

import { addToast, Button } from "@heroui/react";
import { Icon } from "@iconify/react";

import APIStartExecution from "@/lib/fetch/executions/start";
import Reloader from "@/components/reloader/Reloader";

export default function FlowHeading({ flow }: { flow: any }) {
  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{flow.name}</p>
          <p className="text-sm text-default-500">{flow.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Reloader />

          <Button
            color="primary"
            startContent={<Icon icon="solar:play-linear" width={16} />}
            variant="solid"
            onPress={() => {
              APIStartExecution(flow.id)
                .then(() => {
                  addToast({
                    title: "Execution Started",
                    color: "success",
                  });
                })
                .catch((err) => {
                  addToast({
                    title: "Execution start failed",
                    description: err.message,
                    color: "danger",
                  });
                });
            }}
          >
            Execute
          </Button>
        </div>
      </div>
    </main>
  );
}
