import {
  addToast,
  Button,
  Card,
  CardBody,
  NumberInput,
  Select,
  SelectItem,
  Spacer,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@iconify/react";

import UpdateFlow from "@/lib/fetch/flow/PUT/UpdateFlow";
import ErrorCard from "@/components/error/ErrorCard";

export default function FlowSettings({
  flow,
  user,
  canEdit,
}: {
  flow: any;
  user: any;
  canEdit: boolean;
}) {
  const router = useRouter();

  const [execParallel, setExecParallel] = useState(flow.exec_parallel);
  const [failurePipelineID, setFailurePipelineID] = useState(
    flow.failure_pipeline_id,
  );
  const [scheduleEveryValue, setScheduleEveryValue] = useState(
    flow.schedule_every_value,
  );
  const [scheduleEveryUnit, setScheduleEveryUnit] = useState(
    flow.schedule_every_unit,
  );

  const [error, setError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateFlow() {
    const response = (await UpdateFlow(
      flow.id,
      flow.name,
      flow.description,
      flow.project_id,
      flow.folder_id,
      flow.runner_id,
      execParallel,
      failurePipelineID,
      scheduleEveryValue,
      scheduleEveryUnit,
    )) as any;

    if (!response) {
      setError(true);
      setErrorMessage("An error occurred while updating the flow");

      return;
    }

    if (response.success) {
      router.refresh();
      addToast({
        title: "Flow",
        description: "Flow updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorMessage(response.message);
      addToast({
        title: "Flow",
        description: "Failed to update flow",
        color: "danger",
        variant: "flat",
      });
    }
  }

  return (
    <>
      {error && <ErrorCard error={error} message={errorMessage} />}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardBody>
            <p className="text-lg font-bold mb-2">Actions</p>
            <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-4">
              <Card>
                <CardBody className="bg-content2">
                  <div className="mb-2">
                    <p className="text-md font-bold">Execution Strategy</p>
                    <p className="text-sm text-default-500">
                      Switch between parallel and sequential execution of
                      actions
                    </p>
                  </div>
                  <Select
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    placeholder="Select the execution strategy"
                    selectedKeys={[execParallel ? "parallel" : "sequential"]}
                    variant="bordered"
                    onSelectionChange={(e) => {
                      if (e.currentKey === "parallel") {
                        setExecParallel(true);
                      } else {
                        setExecParallel(false);
                      }
                    }}
                  >
                    <SelectItem key="sequential">Sequential</SelectItem>
                    <SelectItem key="parallel">Parallel</SelectItem>
                  </Select>
                </CardBody>
              </Card>

              <Card>
                <CardBody className="bg-content2">
                  <div className="mb-2">
                    <p className="text-md font-bold">Common Failure Pipeline</p>
                    <p className="text-sm text-default-500">
                      Execute an failure pipeline when actions during an
                      execution fail.
                      <span className="font-bold text-warning">
                        <br />
                        CAUTION! This will override the per action failure
                        pipeline
                      </span>
                    </p>
                  </div>
                  <Select
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    placeholder="Select an failure pipeline"
                    selectedKeys={[failurePipelineID]}
                    variant="bordered"
                    onSelectionChange={(e) => {
                      if (e.currentKey === "none") {
                        setFailurePipelineID("");
                      } else {
                        setFailurePipelineID(e.currentKey);
                      }
                    }}
                  >
                    <SelectItem key="none">None</SelectItem>
                    {flow.failure_pipelines.map((pipeline: any) => (
                      <SelectItem key={pipeline.id}>{pipeline.name}</SelectItem>
                    ))}
                  </Select>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody>
            <p className="text-lg font-bold mb-2">Executions</p>
            <div className="grid grid-cols-1 gap-4">
              <Card>
                <CardBody className="bg-content2">
                  <div className="grid lg:grid-cols-2 grid-cols-1 items-center justify-between gap-8">
                    <div>
                      <p className="text-md font-bold">Schedule Every</p>
                      <p className="text-sm text-default-500">
                        Schedule the flow to run every X minutes/hours/days.{" "}
                        <br />
                        The system will always schedule two executions at the
                        time. The second one will be scheduled base on the
                        scheduled time of the first one.
                        <br />
                        <span className="font-bold text-warning">
                          Enter 0 to disable the schedule.
                        </span>
                      </p>
                    </div>
                    <div className="flex flex-cols gap-2">
                      <NumberInput
                        defaultValue={scheduleEveryValue}
                        minValue={0}
                        placeholder="Enter a number"
                        variant="bordered"
                        onValueChange={setScheduleEveryValue}
                      />
                      <Select
                        label="Select an unit"
                        selectedKeys={[scheduleEveryUnit]}
                        variant="bordered"
                        onSelectionChange={(e) => {
                          setScheduleEveryUnit(e.currentKey);
                        }}
                      >
                        <SelectItem key="minutes">Minutes</SelectItem>
                        <SelectItem key="hours">Hours</SelectItem>
                        <SelectItem key="days">Days</SelectItem>
                        <SelectItem key="weeks">Weeks</SelectItem>
                      </Select>
                    </div>
                  </div>
                </CardBody>
              </Card>
            </div>
          </CardBody>
        </Card>
      </div>
      <Spacer y={4} />
      <Button
        fullWidth
        color="primary"
        isDisabled={(!canEdit || flow.disabled) && user.role !== "admin"}
        startContent={<Icon icon="hugeicons:floppy-disk" width={20} />}
        onPress={updateFlow}
      >
        Save
      </Button>
    </>
  );
}
