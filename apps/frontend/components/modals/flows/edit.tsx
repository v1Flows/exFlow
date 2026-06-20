"use client";
import {
  Button,
  Card,
  Chip,
  Description,
  FieldError,
  Input,
  InputGroup,
  Label,
  ListBox,
  Modal,
  Select,
  Switch,
  TextField,
  toast,
  type UseOverlayStateReturn,
} from "@heroui/react";
import React, { useEffect, useMemo } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";
import GetProjectRunners from "@/lib/fetch/project/runners";
import UpdateFlow from "@/lib/fetch/flow/PUT/UpdateFlow";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
export default function EditFlowModal({
  targetFlow,
  projects,
  disclosure,
  folders,
}: {
  targetFlow: any;
  projects: any;
  folders: any;
  disclosure: UseOverlayStateReturn;
}) {
  const { refreshFlowData } = useRefreshCache();
  // create modal
  const { isOpen, setOpen: onOpenChange, close: onClose } = disclosure;
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [projectId, setProjectId] = React.useState("");
  const [folderId, setFolderId] = React.useState("");
  const [runnerId, setRunnerId] = React.useState("");
  const [runnerLimit, setRunnerLimit] = React.useState(false);
  // loading
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(false);
  const [errorText, setErrorText] = React.useState("");
  const [errorMessage, setErrorMessage] = React.useState("");
  // runner select list
  const [runners, setRunners] = React.useState([]);
  const folderSelected = async (e: any) => {
    if (e === "none") {
      setFolderId("");
    } else {
      setFolderId(e);
    }
  };
  useEffect(() => {
    if (targetFlow === undefined) return;
    getCurrentProjectRunners();
    setName(targetFlow.name);
    setDescription(targetFlow.description);
    setProjectId(targetFlow.project_id);
    setRunnerId(targetFlow.runner_id);
    setFolderId(targetFlow.folder_id);
    setRunnerLimit(targetFlow.runner_id !== "any");
  }, [disclosure.isOpen, targetFlow]);
  async function getCurrentProjectRunners() {
    if (!targetFlow?.project_id) return;
    const runners = await GetProjectRunners(targetFlow.project_id);
    setRunners(runners.success ? runners.data.runners : []);
  }
  const projectSelected = async (e: any) => {
    setProjectId(e);
    setRunnerId("");
    if (e) {
      const runners = await GetProjectRunners(e);
      setRunners(runners.success ? runners.data.runners : []);
    } else {
      setRunners([]);
    }
  };
  const handleSelectRunner = (e: any) => {
    setRunnerId(e);
  };
  async function editFlow() {
    setIsLoading(true);
    const response = (await UpdateFlow(
      targetFlow.id,
      name,
      description,
      projectId,
      folderId,
      runnerLimit ? runnerId : "any",
      targetFlow.exec_parallel,
      targetFlow.failure_pipeline_id,
      targetFlow.schedule_every_value,
      targetFlow.schedule_every_unit,
      targetFlow.patterns,
      targetFlow.group_alerts,
      targetFlow.group_alerts_identifier,
      targetFlow.alert_threshold,
      targetFlow.alwaysCleanupWorkspace,
    )) as any;
    if (!response) {
      setError(true);
      setErrorText("Failed to update flow");
      setErrorMessage("An error occurred while updating the flow");
      setIsLoading(false);
      return;
    }
    if (response.success) {
      refreshFlowData(targetFlow.id); // Refresh SWR cache with specific flow ID
      onOpenChange(false);
      setIsLoading(false);
      toast.success("Flow", { description: "Flow updated successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
      toast.danger("Flow", { description: "Failed to update flow" });
    }
  }
  const selectedProject = useMemo(() => {
    return projects.find((p: any) => p.id === projectId);
  }, [projectId, projects]);
  const projectColor = selectedProject?.color || "#000000";
  return (
    <Modal>
      <Modal.Backdrop
        variant="blur"
        isOpen={isOpen}
        onOpenChange={onOpenChange}
      >
        <Modal.Container placement="center" size="lg">
          <Modal.Dialog>
            {({ close: onClose }) => (
              <>
                <Modal.Header className="flex flex-col gap-1">
                  <Modal.Heading>
                    <h2 className="text-xl font-bold">Edit Flow</h2>
                    <p className="text-sm text-muted font-normal">
                      Update flow details and settings.
                    </p>
                  </Modal.Heading>
                </Modal.Header>
                <Modal.Body className="p-0">
                  <div className="flex flex-col md:flex-row h-[500px]">
                    {/* Left Side: Form */}
                    <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-default">
                      <div className="flex flex-col gap-6">
                        {error && (
                          <ErrorCard error={errorText} message={errorMessage} />
                        )}

                        <div className="flex flex-col gap-4">
                          <TextField isRequired value={name} onChange={setName}>
                            <Label>{"Name"}</Label>
                            <InputGroup>
                              <Input placeholder="Enter the flow name" />
                            </InputGroup>
                          </TextField>
                          <TextField
                            value={description}
                            onChange={setDescription}
                          >
                            <Label>{"Description"}</Label>
                            <InputGroup>
                              <Input placeholder="Enter the flow description" />
                            </InputGroup>
                          </TextField>
                        </div>

                        <div className="flex flex-col gap-4">
                          <Select
                            isRequired
                            placeholder="Select a project"
                            selectedKey={projectId ? projectId : null}
                            onSelectionChange={projectSelected}
                          >
                            <Label>{"Project"}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                {projects.map((project: any) => (
                                  <ListBox.Item
                                    key={project.id}
                                    id={project.id}
                                    textValue=" "
                                  >
                                    {project.name}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>

                          <Select
                            placeholder="Select a folder"
                            selectedKey={folderId ? folderId : null}
                            onSelectionChange={folderSelected}
                          >
                            <Label>{"Folder"}</Label>
                            <Select.Trigger>
                              <Select.Value />
                              <Select.Indicator />
                            </Select.Trigger>
                            <Select.Popover>
                              <ListBox>
                                <ListBox.Item
                                  key="none"
                                  id="none"
                                  textValue="None"
                                >
                                  None
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                                {folders.map((folder: any) => (
                                  <ListBox.Item key={folder.id} id={folder.id}>
                                    {folder.name}
                                    <ListBox.ItemIndicator />
                                  </ListBox.Item>
                                ))}
                              </ListBox>
                            </Select.Popover>
                          </Select>
                        </div>

                        <div className="flex flex-col gap-3 p-4 rounded-md bg-surface-secondary/50 border border-default">
                          <div className="flex items-center justify-between">
                            <div className="flex flex-col gap-1">
                              <span className="text-sm font-medium">
                                Limit Runner
                              </span>
                              <span className="text-xs text-muted">
                                Restrict execution to a specific runner
                              </span>
                            </div>
                            <Switch
                              isSelected={runnerLimit}
                              onChange={setRunnerLimit}
                            >
                              <Switch.Control>
                                <Switch.Thumb />
                              </Switch.Control>
                            </Switch>
                          </div>

                          <AnimatePresence>
                            {runnerLimit && (
                              <motion.div
                                animate={{ height: "auto", opacity: 1 }}
                                className="overflow-hidden"
                                exit={{ height: 0, opacity: 0 }}
                                initial={{ height: 0, opacity: 0 }}
                              >
                                <Select
                                  isDisabled={!projectId}
                                  placeholder="Choose a runner"
                                  selectedKey={runnerId ? runnerId : null}
                                  onSelectionChange={handleSelectRunner}
                                >
                                  <Label>{"Select Runner"}</Label>
                                  <Select.Trigger>
                                    <Select.Value />
                                    <Select.Indicator />
                                  </Select.Trigger>
                                  <Select.Popover>
                                    <ListBox>
                                      {runners
                                        .filter(
                                          (runner: any) =>
                                            runner.shared_runner === false,
                                        )
                                        .map((runner: any) => (
                                          <ListBox.Item
                                            key={runner.id}
                                            id={runner.id}
                                            textValue=" "
                                          >
                                            {runner.name}
                                            <ListBox.ItemIndicator />
                                          </ListBox.Item>
                                        ))}
                                    </ListBox>
                                  </Select.Popover>
                                </Select>
                                {!projectId && (
                                  <p className="text-xs text-warning mt-1">
                                    Please select a project first
                                  </p>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      </div>
                    </div>

                    {/* Right Side: Preview */}
                    <div className="w-full md:w-1/2 bg-surface-secondary/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                      <div className="absolute top-4 right-4">
                        <Chip color="accent">
                          {<Icon className="ml-1" icon="hugeicons:eye" />}
                          <Chip.Label>Live Preview</Chip.Label>
                        </Chip>
                      </div>

                      <div className="w-full max-w-sm">
                        <Card className="w-full bg-surface/60 backdrop-blur-md shadow-sm border border-default">
                          <Card.Content className="p-5">
                            <div className="flex flex-col h-full justify-between gap-4">
                              <div className="flex items-start justify-between gap-4">
                                <div
                                  className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform"
                                  style={{
                                    background: `linear-gradient(135deg, ${projectColor}20 0%, ${projectColor}40 100%)`,
                                    color: projectColor,
                                    border: `1px solid ${projectColor}40`,
                                  }}
                                >
                                  <Icon
                                    className="text-2xl"
                                    icon={
                                      targetFlow?.type === "alert"
                                        ? "hugeicons:alert-02"
                                        : "hugeicons:workflow-square-01"
                                    }
                                  />
                                </div>
                                <div className="flex items-center gap-1 opacity-50">
                                  <Button
                                    isDisabled
                                    variant="ghost"
                                    className="aspect-square p-0"
                                  >
                                    <Icon icon="hugeicons:play" width={20} />
                                  </Button>
                                  <Button
                                    isDisabled
                                    variant="ghost"
                                    className="aspect-square p-0"
                                  >
                                    <Icon
                                      className="text-lg"
                                      icon="hugeicons:more-vertical-circle-01"
                                      width={20}
                                    />
                                  </Button>
                                </div>
                              </div>

                              <div>
                                <h3 className="font-bold text-lg text-foreground mb-1">
                                  {name || "Flow Name"}
                                </h3>
                                <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                                  {description ||
                                    "Flow description will appear here..."}
                                </p>
                              </div>

                              <div className="pt-4 border-t border-default flex items-center justify-between">
                                <div className="flex gap-2">
                                  <Chip
                                    className="border-none pl-0"
                                    color={
                                      targetFlow?.disabled
                                        ? "danger"
                                        : "success"
                                    }
                                    variant="soft"
                                  >
                                    <Chip.Label>
                                      {targetFlow?.disabled
                                        ? "Disabled"
                                        : "Active"}
                                    </Chip.Label>
                                  </Chip>
                                </div>
                                <div className="text-xs text-muted font-medium">
                                  {selectedProject?.name || "Project Name"}
                                </div>
                              </div>
                            </div>
                          </Card.Content>
                        </Card>
                      </div>
                      <p className="text-muted text-sm mt-8 text-center max-w-xs">
                        This is how your flow will appear in the dashboard
                      </p>
                    </div>
                  </div>
                </Modal.Body>
                <Modal.Footer className="pr-6">
                  <Button variant="ghost" onPress={onClose}>
                    {<Icon icon="hugeicons:cancel-01" />}
                    Cancel
                  </Button>
                  <Button
                    isDisabled={!name || !projectId}
                    isPending={isLoading}
                    onPress={editFlow}
                  >
                    {<Icon icon="hugeicons:floppy-disk" />}
                    Save Changes
                  </Button>
                </Modal.Footer>
              </>
            )}
          </Modal.Dialog>
        </Modal.Container>
      </Modal.Backdrop>
    </Modal>
  );
}
