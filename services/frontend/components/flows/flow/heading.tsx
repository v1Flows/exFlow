"use client";

import { addToast, Button, useDisclosure } from "@heroui/react";
import { Icon } from "@iconify/react";

import APIStartExecution from "@/lib/fetch/executions/start";
import Reloader from "@/components/reloader/Reloader";
import ScheduleExecutionModal from "@/components/modals/executions/schedule";

export default function FlowHeading({ flow }: { flow: any }) {
  const scheduleExecutionModal = useDisclosure();

  return (
    <main>
      <div className="flex flex-cols items-center justify-between gap-2">
        <div>
          <p className="text-2xl font-bold">{flow.name}</p>
          <p className="text-sm text-default-500">{flow.description}</p>
        </div>
        <div className="flex items-center gap-4">
          <Reloader />

          <div className="flex items-center gap-2">
            <Button
              color="warning"
              startContent={<Icon icon="hugeicons:calendar-02" width={16} />}
              variant="flat"
              onPress={() => {
                scheduleExecutionModal.onOpen();
              }}
            >
              Schedule
            </Button>
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
      </div>
      <ScheduleExecutionModal disclosure={scheduleExecutionModal} flow={flow} />
    </main>
  );
}
