"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Divider,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Snippet,
  Switch,
  useDisclosure,
} from "@heroui/react";
import { LibraryIcon } from "lucide-react";
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
  // instructions modal
  const { isOpen: isOpenInstructions, onOpenChange: onOpenChangeInstructions } =
    useDisclosure();

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
      onOpenChangeInstructions();
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
                      variant="bordered"
                      onValueChange={setName}
                    />
                    <Input
                      isRequired
                      label="Description"
                      type="description"
                      value={description}
                      variant="bordered"
                      onValueChange={setDescription}
                    />
                    <Select
                      isRequired
                      label="Project"
                      placeholder="Select the project to assign the flow to"
                      selectedKeys={[projectId]}
                      variant="bordered"
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
                      variant="bordered"
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
                        variant="bordered"
                        onSelectionChange={handleSelectRunner}
                      >
                        {runners
                          .filter(
                            (runner: any) => runner.exflow_runner === false,
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
                <Button variant="ghost" onPress={cancel}>
                  Cancel
                </Button>
                {currentStep > 0 ? (
                  <Button
                    color="default"
                    variant="flat"
                    onPress={() => {
                      setCurrentStep(currentStep - 1);
                      setDisableNext(false);
                    }}
                  >
                    Back
                  </Button>
                ) : (
                  <Button isDisabled color="default" variant="flat">
                    Back
                  </Button>
                )}
                {currentStep + 1 === steps.length ? (
                  <Button
                    color="primary"
                    isLoading={isLoading}
                    onPress={createFlow}
                  >
                    Create Flow
                  </Button>
                ) : (
                  <Button
                    color="primary"
                    isDisabled={disableNext}
                    isLoading={isLoading}
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

      {/* Instructions Modal */}

      <Modal
        backdrop="blur"
        isOpen={isOpenInstructions}
        placement="center"
        onOpenChange={onOpenChangeInstructions}
      >
        <ModalContent className="w-full">
          {(onInstructionsClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1 text-success">
                Flow created successfully
              </ModalHeader>
              <ModalBody>
                <p>
                  Your new flow has been created successfully and is ready to be
                  used. You only have to use the Flow-ID and the API-URL which
                  can be found below.
                </p>
                <p>
                  If you need help with that please click on the documentation
                  link below.
                </p>
                <Divider />
                <div>
                  <p className="text-sm font-bold text-default-400">
                    Alert URL
                  </p>
                  <Snippet hideSymbol className="w-full">
                    {`${process.env.NEXT_PUBLIC_API_URL}/payloads`}
                  </Snippet>
                </div>
                <div>
                  <p className="text-sm font-bold text-default-400">Method</p>
                  <Snippet hideSymbol className="w-full">
                    POST
                  </Snippet>
                </div>
                <p className="text-sm font-bold text-default-400">
                  The Flow-ID can be found on the Flows page
                </p>
              </ModalBody>
              <ModalFooter>
                <Button
                  color="default"
                  variant="bordered"
                  onPress={onInstructionsClose}
                >
                  <LibraryIcon />
                  Show Documentation
                </Button>
                <Button
                  color="primary"
                  variant="solid"
                  onPress={onInstructionsClose}
                >
                  <Icon icon="hugeicons:checkmark-badge-01" />
                  Understood
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
