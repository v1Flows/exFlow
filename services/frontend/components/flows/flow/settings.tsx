import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Divider,
  Input,
  NumberInput,
  Select,
  SelectItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
} from "@heroui/react";
import { useState } from "react";
import { Icon } from "@iconify/react";
import { motion } from "framer-motion";

import UpdateFlow from "@/lib/fetch/flow/PUT/UpdateFlow";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

export default function FlowSettings({
  flow,
  user,
  canEdit,
}: {
  flow: any;
  user: any;
  canEdit: boolean;
}) {
  const { refreshFlowData } = useRefreshCache();

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
  const [flowPatterns, setFlowPatterns] = useState(flow.patterns);
  const [alwaysCleanupWorkspace, setAlwaysCleanupWorkspace] = useState(
    flow.always_cleanup_workspace,
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
      groupAlerts,
      groupAlertsIdentifier,
      alertThreshold,
      flowPatterns,
      alwaysCleanupWorkspace,
    )) as any;

    if (!response) {
      setError(true);
      setErrorMessage("An error occurred while updating the flow");

      return;
    }

    if (response.success) {
      refreshFlowData(flow.id);
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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1 },
  };

  return (
    <motion.div
      animate="visible"
      className="space-y-6"
      initial="hidden"
      variants={containerVariants}
    >
      {error && <ErrorCard error={error} message={errorMessage} />}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Execution Control */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
            <CardHeader className="flex gap-3 pb-0">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Icon icon="hugeicons:settings-01" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold">Execution Control</p>
                <p className="text-small text-default-500">
                  Manage how your flow executes actions.
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Execution Strategy</p>
                <Select
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  placeholder="Select strategy"
                  selectedKeys={[execParallel ? "parallel" : "sequential"]}
                  startContent={
                    <Icon
                      className="text-default-400"
                      icon={
                        execParallel
                          ? "hugeicons:arrow-shrink-02"
                          : "hugeicons:arrow-right-01"
                      }
                    />
                  }
                  variant="bordered"
                  onSelectionChange={(e) => {
                    setExecParallel(e.currentKey === "parallel");
                  }}
                >
                  <SelectItem key="sequential">Sequential</SelectItem>
                  <SelectItem key="parallel">Parallel</SelectItem>
                </Select>
                <p className="text-tiny text-default-400 mt-1">
                  Choose between parallel or sequential execution of actions.
                </p>
              </div>

              <Divider />

              <div>
                <p className="text-sm font-medium mb-2">
                  Common Failure Pipeline
                </p>
                <Select
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  placeholder="Select pipeline"
                  selectedKeys={[failurePipelineID]}
                  startContent={
                    <Icon
                      className="text-default-400"
                      icon="hugeicons:alert-02"
                    />
                  }
                  variant="bordered"
                  onSelectionChange={(e) => {
                    setFailurePipelineID(
                      e.currentKey === "none" ? "" : (e.currentKey as string),
                    );
                  }}
                >
                  <SelectItem key="none">None</SelectItem>
                  {flow.failure_pipelines.map((pipeline: any) => (
                    <SelectItem key={pipeline.id}>{pipeline.name}</SelectItem>
                  ))}
                </Select>
                <p className="text-tiny text-default-400 mt-1">
                  Overrides per-action failure pipelines.
                </p>
              </div>

              <Divider />

              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold mb-1">
                    Always Cleanup Workspace
                  </p>
                  <p className="text-tiny text-default-500">
                    If enabled, the workspace will be cleaned up after each
                    execution, regardless of success or failure.
                  </p>
                </div>
                <Switch
                  className="mt-4"
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  isSelected={alwaysCleanupWorkspace}
                  onValueChange={setAlwaysCleanupWorkspace}
                />
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Scheduling */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
            <CardHeader className="flex gap-3 pb-0">
              <div className="p-2 rounded-lg bg-secondary/10 text-secondary">
                <Icon icon="hugeicons:time-schedule" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold">Scheduling</p>
                <p className="text-small text-default-500">
                  Automate your flow execution.
                </p>
              </div>
            </CardHeader>
            <CardBody className="gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Schedule Interval</p>
                <div className="flex gap-2">
                  <NumberInput
                    defaultValue={scheduleEveryValue}
                    endContent={
                      <Select
                        className="max-w-[150px]"
                        isDisabled={
                          (!canEdit || flow.disabled) && user.role !== "admin"
                        }
                        placeholder="Select an schedule"
                        selectedKeys={[scheduleEveryUnit]}
                        variant="underlined"
                        onSelectionChange={(e) => {
                          setScheduleEveryUnit(e.currentKey as string);
                        }}
                      >
                        <SelectItem key="minutes">Minutes</SelectItem>
                        <SelectItem key="hours">Hours</SelectItem>
                        <SelectItem key="days">Days</SelectItem>
                        <SelectItem key="weeks">Weeks</SelectItem>
                      </Select>
                    }
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    minValue={0}
                    placeholder="Value"
                    variant="bordered"
                    onValueChange={setScheduleEveryValue}
                  />
                </div>
                <p className="text-tiny text-default-400 mt-2">
                  Set to 0 to disable automatic scheduling.
                </p>
              </div>
            </CardBody>
          </Card>
        </motion.div>

        {/* Alert Settings (Conditional) */}
        {flow.type === "alert" && (
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
              <CardHeader className="flex gap-3 pb-0">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <Icon icon="hugeicons:notification-01" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">Alert Configuration</p>
                  <p className="text-small text-default-500">
                    Configure how alerts are grouped and triggered.
                  </p>
                </div>
              </CardHeader>
              <CardBody className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col justify-between p-4 rounded-xl bg-content2/50 border border-default-100">
                  <div>
                    <p className="text-sm font-bold mb-1">Group Alerts</p>
                    <p className="text-tiny text-default-500">
                      Group incoming alerts by identifier.
                    </p>
                  </div>
                  <Switch
                    className="mt-4"
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    isSelected={groupAlerts}
                    onValueChange={setGroupAlerts}
                  />
                </div>

                <div className="p-4 rounded-xl bg-content2/50 border border-default-100">
                  <p className="text-sm font-bold mb-2">Group Identifier</p>
                  <Input
                    defaultValue={groupAlertsIdentifier}
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    placeholder="e.g. commonLabels.alertname"
                    startContent={
                      <Icon
                        className="text-default-400"
                        icon="hugeicons:tag-01"
                      />
                    }
                    variant="bordered"
                    onValueChange={setGroupAlertsIdentifier}
                  />
                </div>

                <div className="p-4 rounded-xl bg-content2/50 border border-default-100">
                  <p className="text-sm font-bold mb-2">
                    Reoccurrence Threshold
                  </p>
                  <NumberInput
                    defaultValue={alertThreshold}
                    endContent={
                      <span className="text-default-400 text-small">min</span>
                    }
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    minValue={0}
                    placeholder="0"
                    variant="bordered"
                    onValueChange={setAlertThreshold}
                  />
                </div>
              </CardBody>
            </Card>
          </motion.div>
        )}

        {/* Patterns (Conditional) */}
        {flow.type === "alert" && (
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-content1/60 backdrop-blur-md border border-default-100 shadow-sm">
              <CardHeader className="flex justify-between items-center pb-0">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <Icon icon="hugeicons:filter-horizontal" width={24} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-md font-bold">Pattern Matching</p>
                    <p className="text-small text-default-500">
                      Trigger executions based on payload patterns.
                    </p>
                  </div>
                </div>
                <Button
                  color="primary"
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  size="sm"
                  startContent={<Icon icon="hugeicons:plus-sign" width={16} />}
                  variant="flat"
                  onPress={() => {
                    setFlowPatterns([
                      ...flowPatterns,
                      { key: "", type: "equals", value: "" },
                    ]);
                  }}
                >
                  Add Pattern
                </Button>
              </CardHeader>
              <CardBody>
                <Table
                  removeWrapper
                  aria-label="Match Action Patterns"
                  className="w-full"
                >
                  <TableHeader>
                    <TableColumn>KEY</TableColumn>
                    <TableColumn>TYPE</TableColumn>
                    <TableColumn>VALUE</TableColumn>
                    <TableColumn align="end">ACTIONS</TableColumn>
                  </TableHeader>
                  <TableBody emptyContent="No patterns defined.">
                    {flowPatterns.map((pattern: any, index: number) => (
                      <TableRow key={index}>
                        <TableCell>
                          <Input
                            placeholder="Key"
                            size="sm"
                            value={pattern.key}
                            variant="bordered"
                            onChange={(e) => {
                              const newPatterns = [...flowPatterns];

                              newPatterns[index].key = e.target.value;
                              setFlowPatterns(newPatterns);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <Select
                            placeholder="Type"
                            selectedKeys={[pattern.type]}
                            size="sm"
                            variant="bordered"
                            onSelectionChange={(e) => {
                              const newPatterns = [...flowPatterns];

                              newPatterns[index].type = e.currentKey;
                              setFlowPatterns(newPatterns);
                            }}
                          >
                            <SelectItem key="equals">Equals</SelectItem>
                            <SelectItem key="not_equals">Not Equals</SelectItem>
                            <SelectItem key="contains">Contains</SelectItem>
                            <SelectItem key="not_contains">
                              Not Contains
                            </SelectItem>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <Input
                            placeholder="Value"
                            size="sm"
                            value={pattern.value}
                            variant="bordered"
                            onChange={(e) => {
                              const newPatterns = [...flowPatterns];

                              newPatterns[index].value = e.target.value;
                              setFlowPatterns(newPatterns);
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-end">
                            <Button
                              isIconOnly
                              color="danger"
                              isDisabled={
                                (!canEdit || flow.disabled) &&
                                user.role !== "admin"
                              }
                              size="sm"
                              variant="light"
                              onPress={() => {
                                const newPatterns = [...flowPatterns];

                                newPatterns.splice(index, 1);
                                setFlowPatterns(newPatterns);
                              }}
                            >
                              <Icon icon="hugeicons:delete-02" width={18} />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardBody>
            </Card>
          </motion.div>
        )}
      </div>

      <motion.div className="flex justify-end" variants={itemVariants}>
        <Button
          className="font-medium"
          color="primary"
          isDisabled={(!canEdit || flow.disabled) && user.role !== "admin"}
          size="md"
          startContent={<Icon icon="hugeicons:floppy-disk" width={20} />}
          onPress={updateFlow}
        >
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  );
}
