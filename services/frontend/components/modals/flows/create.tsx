"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Icon } from "@iconify/react";

import GetProjectRunners from "@/lib/fetch/project/runners";
import CreateFlow from "@/lib/fetch/flow/POST/CreateFlow";
import ErrorCard from "@/components/error/ErrorCard";

import RowSteps from "../../steps/row-steps";

export default function CreateFlowModal({
  folders,
  projects,
  disclosure,
}: {
  folders: any;
  projects: any;
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();

  // create modal
  const { isOpen, onOpenChange } = disclosure;

  // stepper
  const [steps] = useState([
    {
      title: "Details",
    },
    {
      title: "Runner",
    },
    {
      title: "Encryption",
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
  const [encryptExecutions, setEncryptExecutions] = useState(true);
  const [encryptActionParameters, setEncryptActionParameters] = useState(true);

  // loading
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(false);
  const [errorText, setErrorText] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  // runner select list
  const [runners, setRunners] = useState([]);

  const projectSelected = async (e: any) => {
    setProjectId(e.currentKey);
    setRunnerId("");
    const runners = await GetProjectRunners(e.currentKey);

    setRunners(runners.success ? runners.data.runners : []);
  };

  const folderSelected = async (e: any) => {
    setFolderId(e.currentKey);
  };

  const handleSelectRunner = (e: any) => {
    setRunnerId(e.currentKey);
  };

  async function createFlow() {
    setIsLoading(true);

    const response = (await CreateFlow(
      name,
      description,
      folderId,
      projectId,
      runnerLimit ? runnerId : "any",
      encryptExecutions,
      encryptActionParameters,
    )) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to create flow");
      setErrorMessage("Failed to create flow");
      setIsLoading(false);

      return;
    }

    if (response.success) {
      router.refresh();
      onOpenChange();
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
      addToast({
        title: "Flow",
        description: "Flow created successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      addToast({
        title: "Flow",
        description: "Failed to create flow",
        color: "danger",
        variant: "flat",
      });
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
    onOpenChange();
  }

  return (
    <>
      <Modal
        isOpen={isOpen}
        placement="center"
        size="3xl"
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {() => (
            <>
              <ModalHeader className="flex flex-col items-start">
                <div className="flex flex-col">
                  <p className="text-lg font-bold">Create new Flow</p>
                  <p className="text-sm text-default-500">
                    Flows are the entrypoint for incoming alerts. You define
                    actions and can view ongoing and completed executions.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
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
                    <Input
                      isRequired
                      label="Name"
                      type="name"
                      value={name}
                      variant="flat"
                      onValueChange={setName}
                    />
                    <Input
                      label="Description"
                      type="description"
                      value={description}
                      variant="flat"
                      onValueChange={setDescription}
                    />
                    <Select
                      isRequired
                      label="Project"
                      placeholder="Select the project to assign the flow to"
                      selectedKeys={[projectId]}
                      variant="flat"
                      onSelectionChange={projectSelected}
                    >
                      {projects.map((project: any) => (
                        <SelectItem key={project.id}>{project.name}</SelectItem>
                      ))}
                    </Select>
                    <Select
                      label="Folder"
                      placeholder="Select the folder to assign the flow to"
                      selectedKeys={[folderId]}
                      variant="flat"
                      onSelectionChange={folderSelected}
                    >
                      {folders.map((folder: any) => (
                        <SelectItem key={folder.id}>{folder.name}</SelectItem>
                      ))}
                    </Select>
                  </div>
                )}
                {currentStep === 1 && (
                  <>
                    <div className="flex flex-cols items-center justify-between border-2 border-default-200 p-3 rounded-lg">
                      <div>
                        <p className="font-bold">Limit Runner</p>
                        <p className="text-sm text-default-500">
                          You can specify a specific runner which should take
                          care of executing your flow.
                        </p>
                      </div>
                      <Switch
                        isSelected={runnerLimit}
                        onValueChange={setRunnerLimit}
                      />
                    </div>
                    {runnerLimit && (
                      <Select
                        label="Runner"
                        selectedKeys={[runnerId]}
                        variant="flat"
                        onSelectionChange={handleSelectRunner}
                      >
                        {runners
                          .filter(
                            (runner: any) => runner.shared_runner === false,
                          )
                          .map((runner: any) => (
                            <SelectItem key={runner.id}>
                              {runner.name}
                            </SelectItem>
                          ))}
                      </Select>
                    )}
                  </>
                )}
                {currentStep === 2 && (
                  <>
                    <div className="flex flex-cols items-center justify-between border-2 border-default-200 p-3 rounded-lg">
                      <div>
                        <p className="font-bold">Executions</p>
                        <p className="text-sm text-default-500">
                          All execution action messages will be stored encrypted
                          on the db
                        </p>
                      </div>
                      <Switch
                        isSelected={encryptExecutions}
                        onValueChange={setEncryptExecutions}
                      />
                    </div>
                    <div className="flex flex-cols items-center justify-between border-2 border-default-200 p-3 rounded-lg">
                      <div>
                        <p className="font-bold">Action Params</p>
                        <p className="text-sm text-default-500">
                          All action parameters will be stored encrypted on the
                          db
                        </p>
                      </div>
                      <Switch
                        isSelected={encryptActionParameters}
                        onValueChange={setEncryptActionParameters}
                      />
                    </div>
                  </>
                )}
              </ModalBody>
              <ModalFooter>
                <Button
                  startContent={<Icon icon="hugeicons:cancel-01" width={18} />}
                  variant="ghost"
                  onPress={cancel}
                >
                  Cancel
                </Button>
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                      setDisableNext(false);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button
                    isDisabled
                    color="default"
                    startContent={
                      <Icon icon="hugeicons:backward-02" width={18} />
                    }
                    variant="flat"
                  >
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps.length ? (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:plus-sign" width={18} />
                    }
                    onPress={createFlow}
                  >
                    Create Flow
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={disableNext}
                    isLoading={isLoading}
                    startContent={
                      <Icon icon="hugeicons:forward-02" width={18} />
                    }
                    onPress={() => setCurrentStep(currentStep + 1)}
                  >
                    Next Step
                  </Button>
                )}
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
