import {
  Button,
  Modal,
  TimeField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import { Time } from "@internationalized/date";
import React from "react";
import type { ComponentProps } from "react";
import { Icon } from "@iconify/react";
import ErrorCard from "@/components/error/ErrorCard";
import APIScheduleExecution from "@/lib/fetch/executions/schedule";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function ScheduleExecutionModal({
  disclosure,
  flow,
}: {
  disclosure: UseOverlayStateReturn;
  flow: any;
}) {
  const { refreshAllExecutionCaches } = useRefreshCache();
  const { isOpen, setOpen: onOpenChange } = disclosure;
  const now = React.useMemo(() => new Date(), []);
  const [dateValue, setDateValue] = React.useState(
    now.toISOString().slice(0, 10),
  );
  type TimeFieldValue = NonNullable<ComponentProps<typeof TimeField>["value"]>;
  const [timeValue, setTimeValue] = React.useState<TimeFieldValue>(
    new Time(now.getHours(), now.getMinutes()) as unknown as TimeFieldValue,
  );
  const [isScheduleLoading, setIsScheduleLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  async function scheduleExecution() {
    setIsScheduleLoading(true);
    const scheduledAt = new Date(`${dateValue}T00:00:00`);
    scheduledAt.setHours(timeValue.hour, timeValue.minute, timeValue.second);
    const res = (await APIScheduleExecution(
      flow.id,
      scheduledAt.toISOString(),
    )) as any;
    if (!res) {
      setError(true);
      setErrorText("Failed to schedule execution");
      setErrorMessage("Failed to schedule execution");
      setIsScheduleLoading(false);
      return;
    }
    if (res.success) {
      onOpenChange(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      toast.success("Execution", {
        description: "Execution scheduled successfully",
      });
      refreshAllExecutionCaches(flow.id);
    } else {
      setError(true);
      setErrorText(res.error);
      setErrorMessage(res.message);
      setIsScheduleLoading(false);
      toast.danger("Execution", {
        description: "Failed to schedule execution",
      });
    }
    setIsScheduleLoading(false);
  }
  return (
    <main>
      <Modal>
        <Modal.Backdrop
          variant="blur"
          isOpen={isOpen}
          onOpenChange={onOpenChange}
        >
          <Modal.Container placement="center">
            <Modal.Dialog className="w-full">
              {({ close: onClose }) => (
                <>
                  <Modal.Header className="flex flex-wrap items-center">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Schedule Execution</p>
                        <p className="text-sm text-muted">
                          Schedule an execution for the flow
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex flex-col gap-2">
                      <p className="font-bold">Select an date</p>
                      <input
                        aria-label="Execution date"
                        className="rounded-medium border border-default bg-surface px-3 py-2"
                        min={now.toISOString().slice(0, 10)}
                        type="date"
                        value={dateValue}
                        onChange={(event) => setDateValue(event.target.value)}
                      />
                      <div aria-hidden className="h-1" />
                      <p className="font-bold">Select an time</p>
                      <TimeField
                        aria-label="Execution time"
                        granularity="minute"
                        hourCycle={24}
                        value={timeValue}
                        onChange={setTimeValue}
                      >
                        <TimeField.Group>
                          <TimeField.Input>
                            {(segment) => (
                              <TimeField.Segment segment={segment} />
                            )}
                          </TimeField.Input>
                        </TimeField.Group>
                      </TimeField>
                    </div>
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={onClose}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    <Button
                      isPending={isScheduleLoading}
                      variant="primary"
                      onPress={scheduleExecution}
                    >
                      <Icon icon="hugeicons:time-schedule" width={18} />
                      Schedule
                    </Button>
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </main>
  );
}
