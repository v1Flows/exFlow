import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  today,
  getLocalTimeZone,
  parseAbsoluteToLocal,
} from "@internationalized/date";
import {
  addToast,
  Button,
  Calendar,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Spacer,
  TimeInput,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React from "react";
import { Icon } from "@iconify/react";

import ErrorCard from "@/components/error/ErrorCard";
import APIScheduleExecution from "@/lib/fetch/executions/schedule";

export default function ScheduleExecutionModal({
  disclosure,
  flow,
}: {
  disclosure: UseDisclosureReturn;
  flow: any;
}) {
  const router = useRouter();

  const { isOpen, onOpenChange } = disclosure;

  let [value, setValue] = React.useState(
    parseAbsoluteToLocal(new Date().toISOString()),
  );

  const [isScheduleLoading, setIsScheduleLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");

  async function scheduleExecution() {
    setIsScheduleLoading(true);
    const res = (await APIScheduleExecution(
      flow.id,
      value.toAbsoluteString(),
    )) as any;

    if (!res) {
      setError(true);
      setErrorText("Failed to schedule execution");
      setErrorMessage("Failed to schedule execution");
      setIsScheduleLoading(false);

      return;
    }

    if (res.success) {
      onOpenChange();
      setError(false);
      setErrorText("");
      setErrorMessage("");
      addToast({
        title: "Execution",
        description: "Execution scheduled successfully",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setIsScheduleLoading(false);
      addToast({
        title: "Execution",
        description: "Failed to schedule execution",
        color: "danger",
        variant: "flat",
      });
    }

    setIsScheduleLoading(false);
  }

  return (
    <main>
      <Modal
        backdrop="blur"
        isOpen={isOpen}
        placement="center"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Schedule Execution</p>
                  <p className="text-sm text-default-500">
                    Schedule an execution for the flow
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <div className="flex flex-col gap-2">
                  <p className="font-bold">Select an date</p>
                  <Calendar
                    aria-label="Date (Min Date Value)"
                    color="secondary"
                    minValue={today(getLocalTimeZone())}
                    value={value}
                    onChange={setValue}
                  />
                  <Spacer y={1} />
                  <p className="font-bold">Select an time</p>
                  <TimeInput
                    granularity="minute"
                    hourCycle={24}
                    value={value}
                    onChange={setValue}
                  />
                </div>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={onClose}
                >
                  Cancel
                </Button>
                <Button
                  color="secondary"
                  isLoading={isScheduleLoading}
                  variant="solid"
                  onPress={scheduleExecution}
                >
                  <Icon icon="hugeicons:time-schedule" width={18} />
                  Schedule
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </main>
  );
}
