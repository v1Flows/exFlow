import {
  Button,
  Card,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  NumberField,
  Select,
  Separator,
  Switch,
  Table,
  TextField,
  toast,
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
      toast.success("Flow", { description: "Flow updated successfully" });
    } else {
      setError(true);
      setErrorMessage(response.message + ". " + response.error);
      toast.danger("Flow", { description: "Failed to update flow" });
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
          <Card className="h-full bg-surface/60 backdrop-blur-md border border-default shadow-sm">
            <Card.Header className="flex gap-3 pb-0">
              <div className="p-2 rounded-lg bg-accent/10 text-accent">
                <Icon icon="hugeicons:settings-01" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold">Execution Control</p>
                <p className="text-sm text-muted">
                  Manage how your flow executes actions.
                </p>
              </div>
            </Card.Header>
            <Card.Content className="gap-6">
              <div>
                <p className="text-sm font-medium mb-2">Execution Strategy</p>
                <Select
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  placeholder="Select strategy"
                  selectedKey={execParallel ? "parallel" : "sequential"}
                  onSelectionChange={(e) => {
                    setExecParallel(e === "parallel");
                  }}
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item
                        key="sequential"
                        id="sequential"
                        textValue="Sequential"
                      >
                        Sequential
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      <ListBox.Item
                        key="parallel"
                        id="parallel"
                        textValue="Parallel"
                      >
                        Parallel
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                    </ListBox>
                  </Select.Popover>
                </Select>
                <p className="text-xs text-muted mt-1">
                  Choose between parallel or sequential execution of actions.
                </p>
              </div>

              <Separator />

              <div>
                <p className="text-sm font-medium mb-2">
                  Common Failure Pipeline
                </p>
                <Select
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  placeholder="Select pipeline"
                  selectedKey={failurePipelineID}
                  onSelectionChange={(e) => {
                    setFailurePipelineID(e === "none" ? "" : (e as string));
                  }}
                >
                  <Select.Trigger>
                    <Select.Value />
                    <Select.Indicator />
                  </Select.Trigger>
                  <Select.Popover>
                    <ListBox>
                      <ListBox.Item key="none" id="none" textValue="None">
                        None
                        <ListBox.ItemIndicator />
                      </ListBox.Item>
                      {flow.failure_pipelines.map((pipeline: any) => (
                        <ListBox.Item key={pipeline.id} id={pipeline.id}>
                          {pipeline.name}
                          <ListBox.ItemIndicator />
                        </ListBox.Item>
                      ))}
                    </ListBox>
                  </Select.Popover>
                </Select>
                <p className="text-xs text-muted mt-1">
                  Overrides per-action failure pipelines.
                </p>
              </div>

              <Separator />

              <div className="flex flex-col justify-between">
                <div>
                  <p className="text-sm font-bold mb-1">
                    Always Cleanup Workspace
                  </p>
                  <p className="text-xs text-muted">
                    If enabled, the workspace will be cleaned up after each
                    execution, regardless of success or failure.
                  </p>
                </div>
                <Switch
                  className={"mt-4"}
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  isSelected={alwaysCleanupWorkspace}
                  onChange={setAlwaysCleanupWorkspace}
                >
                  <Switch.Control>
                    <Switch.Thumb />
                  </Switch.Control>
                </Switch>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Scheduling */}
        <motion.div variants={itemVariants}>
          <Card className="h-full bg-surface/60 backdrop-blur-md border border-default shadow-sm">
            <Card.Header className="flex gap-3 pb-0">
              <div className="p-2 rounded-lg bg-default/10 text-default-foreground">
                <Icon icon="hugeicons:time-schedule" width={24} />
              </div>
              <div className="flex flex-col">
                <p className="text-md font-bold">Scheduling</p>
                <p className="text-sm text-muted">
                  Automate your flow execution.
                </p>
              </div>
            </Card.Header>
            <Card.Content className="gap-4">
              <div>
                <p className="text-sm font-medium mb-2">Schedule Interval</p>
                <div className="flex gap-2">
                  <NumberField
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    defaultValue={scheduleEveryValue}
                    onChange={setScheduleEveryValue}
                    minValue={0}
                  >
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                </div>
                <p className="text-xs text-muted mt-2">
                  Set to 0 to disable automatic scheduling.
                </p>
              </div>
            </Card.Content>
          </Card>
        </motion.div>

        {/* Alert Settings (Conditional) */}
        {flow.type === "alert" && (
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
              <Card.Header className="flex gap-3 pb-0">
                <div className="p-2 rounded-lg bg-warning/10 text-warning">
                  <Icon icon="hugeicons:notification-01" width={24} />
                </div>
                <div className="flex flex-col">
                  <p className="text-md font-bold">Alert Configuration</p>
                  <p className="text-sm text-muted">
                    Configure how alerts are grouped and triggered.
                  </p>
                </div>
              </Card.Header>
              <Card.Content className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex flex-col justify-between p-4 rounded-xl bg-surface-secondary/50 border border-default">
                  <div>
                    <p className="text-sm font-bold mb-1">Group Alerts</p>
                    <p className="text-xs text-muted">
                      Group incoming alerts by identifier.
                    </p>
                  </div>
                  <Switch
                    className={"mt-4"}
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    isSelected={groupAlerts}
                    onChange={setGroupAlerts}
                  >
                    <Switch.Control>
                      <Switch.Thumb />
                    </Switch.Control>
                  </Switch>
                </div>

                <div className="p-4 rounded-xl bg-surface-secondary/50 border border-default">
                  <p className="text-sm font-bold mb-2">Group Identifier</p>
                  <TextField
                    defaultValue={groupAlertsIdentifier}
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    onChange={setGroupAlertsIdentifier}
                  >
                    <InputGroup>
                      <InputGroup.Prefix>
                        {
                          <Icon
                            className="text-muted"
                            icon="hugeicons:tag-01"
                          />
                        }
                      </InputGroup.Prefix>
                      <Input placeholder="e.g. commonLabels.alertname" />
                    </InputGroup>
                  </TextField>
                </div>

                <div className="p-4 rounded-xl bg-surface-secondary/50 border border-default">
                  <p className="text-sm font-bold mb-2">
                    Reoccurrence Threshold
                  </p>
                  <NumberField
                    isDisabled={
                      (!canEdit || flow.disabled) && user.role !== "admin"
                    }
                    defaultValue={alertThreshold}
                    onChange={setAlertThreshold}
                    minValue={0}
                  >
                    <NumberField.Group>
                      <NumberField.DecrementButton />
                      <NumberField.Input />
                      <NumberField.IncrementButton />
                    </NumberField.Group>
                  </NumberField>
                </div>
              </Card.Content>
            </Card>
          </motion.div>
        )}

        {/* Patterns (Conditional) */}
        {flow.type === "alert" && (
          <motion.div className="lg:col-span-2" variants={itemVariants}>
            <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
              <Card.Header className="flex justify-between items-center pb-0">
                <div className="flex gap-3">
                  <div className="p-2 rounded-lg bg-success/10 text-success">
                    <Icon icon="hugeicons:filter-horizontal" width={24} />
                  </div>
                  <div className="flex flex-col">
                    <p className="text-md font-bold">Pattern Matching</p>
                    <p className="text-sm text-muted">
                      Trigger executions based on payload patterns.
                    </p>
                  </div>
                </div>
                <Button
                  isDisabled={
                    (!canEdit || flow.disabled) && user.role !== "admin"
                  }
                  size="sm"
                  variant="secondary"
                  onPress={() => {
                    setFlowPatterns([
                      ...flowPatterns,
                      { key: "", type: "equals", value: "" },
                    ]);
                  }}
                >
                  {<Icon icon="hugeicons:plus-sign" width={16} />}
                  Add Pattern
                </Button>
              </Card.Header>
              <Card.Content>
                <Table className="w-full">
                  <Table.ScrollContainer>
                    <Table.Content aria-label="Match Action Patterns">
                      <Table.Header>
                        <Table.Column>KEY</Table.Column>
                        <Table.Column>TYPE</Table.Column>
                        <Table.Column>VALUE</Table.Column>
                        <Table.Column className="text-end">
                          ACTIONS
                        </Table.Column>
                      </Table.Header>
                      <Table.Body
                        renderEmptyState={() => "No patterns defined."}
                      >
                        {flowPatterns.map((pattern: any, index: number) => (
                          <Table.Row key={index} id={index}>
                            <Table.Cell>
                              <TextField value={pattern.key}>
                                <InputGroup>
                                  <Input
                                    placeholder="Key"
                                    onChange={(e) => {
                                      const newPatterns = [...flowPatterns];
                                      newPatterns[index].key = e.target.value;
                                      setFlowPatterns(newPatterns);
                                    }}
                                  />
                                </InputGroup>
                              </TextField>
                            </Table.Cell>
                            <Table.Cell>
                              <Select
                                placeholder="Type"
                                selectedKey={pattern.type}
                                onSelectionChange={(e) => {
                                  const newPatterns = [...flowPatterns];
                                  newPatterns[index].type = e;
                                  setFlowPatterns(newPatterns);
                                }}
                              >
                                <Select.Trigger>
                                  <Select.Value />
                                  <Select.Indicator />
                                </Select.Trigger>
                                <Select.Popover>
                                  <ListBox>
                                    <ListBox.Item
                                      key="equals"
                                      id="equals"
                                      textValue="Equals"
                                    >
                                      Equals
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    <ListBox.Item
                                      key="not_equals"
                                      id="not_equals"
                                      textValue="Not Equals"
                                    >
                                      Not Equals
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    <ListBox.Item
                                      key="contains"
                                      id="contains"
                                      textValue="Contains"
                                    >
                                      Contains
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                    <ListBox.Item
                                      key="not_contains"
                                      id="not_contains"
                                      textValue="Not Contains"
                                    >
                                      Not Contains
                                      <ListBox.ItemIndicator />
                                    </ListBox.Item>
                                  </ListBox>
                                </Select.Popover>
                              </Select>
                            </Table.Cell>
                            <Table.Cell>
                              <TextField value={pattern.value}>
                                <InputGroup>
                                  <Input
                                    placeholder="Value"
                                    onChange={(e) => {
                                      const newPatterns = [...flowPatterns];
                                      newPatterns[index].value = e.target.value;
                                      setFlowPatterns(newPatterns);
                                    }}
                                  />
                                </InputGroup>
                              </TextField>
                            </Table.Cell>
                            <Table.Cell>
                              <div className="flex justify-end">
                                <Button
                                  isDisabled={
                                    (!canEdit || flow.disabled) &&
                                    user.role !== "admin"
                                  }
                                  size="sm"
                                  variant="danger"
                                  onPress={() => {
                                    const newPatterns = [...flowPatterns];
                                    newPatterns.splice(index, 1);
                                    setFlowPatterns(newPatterns);
                                  }}
                                  className="aspect-square p-0"
                                >
                                  <Icon icon="hugeicons:delete-02" width={18} />
                                </Button>
                              </div>
                            </Table.Cell>
                          </Table.Row>
                        ))}
                      </Table.Body>
                    </Table.Content>
                  </Table.ScrollContainer>
                </Table>
              </Card.Content>
            </Card>
          </motion.div>
        )}
      </div>

      <motion.div className="flex justify-end" variants={itemVariants}>
        <Button
          className="font-medium"
          isDisabled={(!canEdit || flow.disabled) && user.role !== "admin"}
          size="md"
          onPress={updateFlow}
          variant="primary"
        >
          {<Icon icon="hugeicons:floppy-disk" width={20} />}
          Save Changes
        </Button>
      </motion.div>
    </motion.div>
  );
}
