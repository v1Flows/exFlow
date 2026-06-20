"use client";
import {
  Button,
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
import React, { useEffect, useState } from "react";
import { Icon } from "@iconify/react";
import GetProjectRunners from "@/lib/fetch/project/runners";
import ErrorCard from "@/components/error/ErrorCard";
import CopyFlow from "@/lib/fetch/flow/POST/CopyFlow";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";
import RowSteps from "../../steps/row-steps";
export default function CopyFlowModal({
  flow,
  folders,
  projects,
  disclosure,
}: {
  flow: any;
  folders: any;
  projects: any;
  disclosure: UseOverlayStateReturn;
}) {
  const { refreshFlowData, refreshFolders, refreshProjects } =
    useRefreshCache();
  // create modal
  const { isOpen, setOpen: onOpenChange } = disclosure;
  // stepper
  const [steps] = useState([
    {
      title: "Details",
    },
    {
      title: "Runner",
    },
  ]);
  const [disableNext, setDisableNext] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [folderId, setFolderId] = useState("");
  const [projectId, setProjectId] = useState("");
  const [runnerId, setRunnerId] = useState("");
  const [runnerLimit, setRunnerLimit] = useState(false);
  // loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // runner select list
  const [runners, setRunners] = useState([]);
  useEffect(() => {
    if (flow) {
      setName(flow.name);
      setDescription(flow.description);
      setProjectId(flow.project_id);
      setFolderId(flow.folder_id);
      setRunnerId(flow.runner_id);
      setRunnerLimit(flow.runner_id !== "any");
    }
  }, [disclosure.isOpen]);
  const projectSelected = async (e: any) => {
    setProjectId(e);
    setRunnerId("");
    const runners = await GetProjectRunners(e);
    setRunners(runners.success ? runners.data.runners : []);
  };
  const folderSelected = async (e: any) => {
    setFolderId(e);
  };
  const handleSelectRunner = (e: any) => {
    setRunnerId(e);
  };
  async function copyFlow() {
    setIsLoading(true);
    const response = (await CopyFlow(
      name,
      description,
      folderId,
      projectId,
      runnerLimit ? runnerId : "any",
      flow.actions,
      flow.failure_pipelines,
      flow.failure_pipeline_id,
      flow.exec_parallel,
    )) as any;
    if (!response) {
      setError(true);
      setErrorText("Failed to copy flow");
      setErrorMessage("Failed to copy flow");
      setIsLoading(false);
      return;
    }
    if (response.success) {
      refreshFlowData(); // Refresh SWR cache instead of router
      refreshProjects(); // Refresh SWR cache instead of router
      refreshFolders();
      onOpenChange(false);
      setName("");
      setDescription("");
      setFolderId("");
      setProjectId("");
      setRunnerId("");
      setRunnerLimit(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setCurrentStep(0);
      setDisableNext(false);
      toast.success("Flow", { description: "Flow copied successfully" });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      toast.danger("Flow", { description: "Failed to copy flow" });
    }
    setIsLoading(false);
  }
  function cancel() {
    setName("");
    setDescription("");
    setFolderId("");
    setProjectId("");
    setRunnerId("");
    setRunnerLimit(false);
    setIsLoading(false);
    onOpenChange(false);
  }
  return (
    <>
      <Modal>
        <Modal.Backdrop isOpen={isOpen} onOpenChange={onOpenChange}>
          <Modal.Container placement="center" size="lg">
            <Modal.Dialog className="w-full">
              {() => (
                <>
                  <Modal.Header className="flex flex-col items-start">
                    <Modal.Heading>
                      <div className="flex flex-col">
                        <p className="text-lg font-bold">Copy existing Flow</p>
                        <p className="text-sm text-muted">
                          Copy an existing flow to a new one.
                        </p>
                      </div>
                    </Modal.Heading>
                  </Modal.Header>
                  <Modal.Body>
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}
                    <div className="flex items-center justify-center">
                      <RowSteps
                        currentStep={currentStep}
                        defaultStep={0}
                        steps={steps}
                        onStepChange={setCurrentStep}
                      />
                    </div>
                    {currentStep === 0 && (
                      <div className="flex flex-col gap-4">
                        <TextField isRequired value={name} onChange={setName}>
                          <Label>{"Name"}</Label>
                          <InputGroup>
                            <Input type="name" />
                          </InputGroup>
                        </TextField>
                        <TextField
                          isRequired
                          value={description}
                          onChange={setDescription}
                        >
                          <Label>{"Description"}</Label>
                          <InputGroup>
                            <Input type="description" />
                          </InputGroup>
                        </TextField>
                        <Select
                          isRequired
                          placeholder="Select the project to assign the flow to"
                          selectedKey={projectId}
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
                                <ListBox.Item key={project.id} id={project.id}>
                                  {project.name}
                                  <ListBox.ItemIndicator />
                                </ListBox.Item>
                              ))}
                            </ListBox>
                          </Select.Popover>
                        </Select>
                        <Select
                          placeholder="Select the folder to assign the flow to"
                          selectedKey={folderId}
                          onSelectionChange={folderSelected}
                        >
                          <Label>{"Folder"}</Label>
                          <Select.Trigger>
                            <Select.Value />
                            <Select.Indicator />
                          </Select.Trigger>
                          <Select.Popover>
                            <ListBox>
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
                    )}
                    {currentStep === 1 && (
                      <>
                        <div className="flex flex-cols items-center justify-between border-2 border-default p-3 rounded-lg">
                          <div>
                            <p className="font-bold">Limit Runner</p>
                            <p className="text-sm text-muted">
                              You can specify a specific runner which should
                              take care of executing your flow.
                            </p>
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
                        {runnerLimit && (
                          <Select
                            selectedKey={runnerId}
                            onSelectionChange={handleSelectRunner}
                          >
                            <Label>{"Runner"}</Label>
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
                        )}
                      </>
                    )}
                  </Modal.Body>
                  <Modal.Footer>
                    <Button variant="ghost" onPress={cancel}>
                      {<Icon icon="hugeicons:cancel-01" width={18} />}
                      Cancel
                    </Button>
                    {currentStep > 0 ? (
                      <Button
                        onPress={() => {
                          setCurrentStep(currentStep - 1);
                          setDisableNext(false);
                        }}
                      >
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    ) : (
                      <Button isDisabled>
                        {<Icon icon="hugeicons:backward-02" width={18} />}
                        Back
                      </Button>
                    )}
                    {currentStep + 1 === steps.length ? (
                      <Button
                        isPending={isLoading}
                        onPress={copyFlow}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:copy-02" width={18} />}
                        Copy Flow
                      </Button>
                    ) : (
                      <Button
                        isDisabled={disableNext}
                        isPending={isLoading}
                        onPress={() => setCurrentStep(currentStep + 1)}
                        variant="primary"
                      >
                        {<Icon icon="hugeicons:forward-02" width={18} />}
                        Next Step
                      </Button>
                    )}
                  </Modal.Footer>
                </>
              )}
            </Modal.Dialog>
          </Modal.Container>
        </Modal.Backdrop>
      </Modal>
    </>
  );
}
