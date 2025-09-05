import {
  addToast,
  Button,
  Card,
  CardBody,
  Code,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Spacer,
  Switch,
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
  const [groupAlerts, setGroupAlerts] = useState(flow.group_alerts);
  const [groupAlertsIdentifier, setGroupAlertsIdentifier] = useState(
    flow.group_alerts_identifier,
  );
  const [alertThreshold, setAlertThreshold] = useState(flow.alert_threshold);

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
      groupAlerts,
      groupAlertsIdentifier,
      alertThreshold,
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
                      isDisabled={
                        (!canEdit || flow.disabled) && user.role !== "admin"
                      }
                      minValue={0}
                      placeholder="Enter a number"
                      variant="bordered"
                      onValueChange={setScheduleEveryValue}
                    />
                    <Select
                      isDisabled={
                        (!canEdit || flow.disabled) && user.role !== "admin"
                      }
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
          </CardBody>
        </Card>

        {flow.type === "alert" && (
          <Card className="col-span-2">
            <CardBody>
              <p className="text-lg font-bold mb-2">Alerting</p>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <Card>
                  <CardBody className="bg-content2">
                    <div className="flex flex-cols items-center justify-between gap-8">
                      <div>
                        <p className="text-md font-bold">Group Alerts</p>
                        <p className="text-sm text-default-500">
                          Group Alerts by an identifier. This will set the
                          parentID of the alert to the first alert of the group.
                          The identifier can be set by another setting
                        </p>
                      </div>
                      <div className="flex justify-end">
                        <Switch
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          isSelected={groupAlerts}
                          onValueChange={setGroupAlerts}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="bg-content2">
                    <div className="flex flex-cols items-center justify-between gap-8">
                      <div>
                        <p className="text-md font-bold">Group Identifier</p>
                        <p className="text-sm text-default-500">
                          Enter a unique identifier for the group of alerts. To
                          access payload data use{" "}
                          <Code color="primary" radius="sm" size="sm">
                            payload.
                          </Code>{" "}
                          as prefix
                        </p>
                      </div>
                      <Input
                        className="min-w-[300px]"
                        defaultValue={groupAlertsIdentifier}
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        placeholder="payload.commonLabels.alertname"
                        variant="bordered"
                        onValueChange={setGroupAlertsIdentifier}
                      />
                    </div>
                  </CardBody>
                </Card>

                <Card>
                  <CardBody className="bg-content2">
                    <div className="flex flex-cols items-center justify-between gap-8">
                      <div>
                        <p className="text-md font-bold">Threshold</p>
                        <p className="text-sm text-default-500">
                          If an alert is resolved and reoccurs after which
                          threshold should a new execution be accepted?
                        </p>
                      </div>
                      <div className="flex flex-cols gap-2">
                        <NumberInput
                          className="min-w-[200px]"
                          defaultValue={alertThreshold}
                          endContent={
                            <p className="text-sm text-default-500">minutes</p>
                          }
                          isDisabled={
                            (!canEdit || flow.disabled) && user.role !== "admin"
                          }
                          minValue={0}
                          placeholder="Enter a number"
                          variant="bordered"
                          onValueChange={setAlertThreshold}
                        />
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </div>
            </CardBody>
          </Card>
        )}
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
