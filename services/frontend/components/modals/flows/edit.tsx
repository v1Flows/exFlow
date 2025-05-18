"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  cn,
  Divider,
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
import React, { useEffect } from "react";

import GetProjectRunners from "@/lib/fetch/project/runners";
import UpdateFlow from "@/lib/fetch/flow/PUT/UpdateFlow";
import ErrorCard from "@/components/error/ErrorCard";

export default function EditFlowModal({
  targetFlow,
  projects,
  disclosure,
  folders,
}: {
  targetFlow: any;
  projects: any;
  folders: any;
  disclosure: UseDisclosureReturn;
}) {
  const router = useRouter();

  // create modal
  const { isOpen, onOpenChange, onClose } = disclosure;

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
    if (e.currentKey === "none") {
      setFolderId("");
    } else {
      setFolderId(e.currentKey);
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
  }, [disclosure.isOpen]);

  async function getCurrentProjectRunners() {
    const runners = await GetProjectRunners(targetFlow.project_id);

    setRunners(runners.success ? runners.data.runners : []);
  }

  const projectSelected = async (e: any) => {
    setProjectId(e.currentKey);
    setRunnerId("");
    const runners = await GetProjectRunners(e.currentKey);

    setRunners(runners.success ? runners.data.runners : []);
  };

  const handleSelectRunner = (e: any) => {
    setRunnerId(e.currentKey);
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
      targetFlow.encrypt_executions,
      targetFlow.encrypt_action_params,
      targetFlow.exec_parallel,
      targetFlow.failure_pipeline_id,
    )) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to update flow");
      setErrorMessage("An error occurred while updating the flow");
      setIsLoading(false);

      return;
    }

    if (response.success) {
      router.refresh();
      onOpenChange();
      setIsLoading(false);
      addToast({
        title: "Flow",
        description: "Flow updated successfully",
        color: "success",
        variant: "flat",
      });
    } else {
      setError(true);
      setErrorText(response.error);
      setErrorMessage(response.message);
      setIsLoading(false);
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
      <Modal
        isOpen={isOpen}
        placement="center"
        onClose={onClose}
        onOpenChange={onOpenChange}
      >
        <ModalContent className="w-full">
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-wrap items-center">
                <div className="flex flex-col gap-2">
                  <p className="text-lg font-bold">Edit Flow</p>
                  <p className="text-sm text-default-500">
                    Edit the flow details below and click apply changes to save.
                  </p>
                </div>
              </ModalHeader>
              <ModalBody>
                {error && (
                  <ErrorCard error={errorText} message={errorMessage} />
                )}
                <Input
                  isRequired
                  label="Name"
                  placeholder="Enter the flow name"
                  type="name"
                  value={name}
                  variant="bordered"
                  onValueChange={setName}
                />
                <Input
                  isRequired
                  label="Description"
                  placeholder="Enter the flow description"
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
                  <SelectItem key="none">None</SelectItem>
                  {folders.map((folder: any) => (
                    <SelectItem key={folder.id}>{folder.name}</SelectItem>
                  ))}
                </Select>
                <Divider />
                <Switch
                  classNames={{
                    base: cn(
                      "inline-flex flex-row-reverse w-full max-w-md bg-content1 hover:bg-content2 items-center",
                      "justify-between cursor-pointer rounded-lg gap-2 p-3 border-2 border-content3",
                      "data-[selected=true]:border-primary",
                    ),
                    wrapper: "p-0 h-4 overflow-visible",
                    thumb: cn(
                      "w-6 h-6 border-2 shadow-lg",
                      "group-data-[hover=true]:border-primary",
                      // selected
                      "group-data-[selected=true]:ml-6",
                      // pressed
                      "group-data-[pressed=true]:w-7",
                      "group-data-[selected]:group-data-[pressed]:ml-4",
                    ),
                  }}
                  isSelected={runnerLimit}
                  onValueChange={setRunnerLimit}
                >
                  <div className="flex flex-col gap-1">
                    <p className="text-medium">Limit Runner</p>
                    <p className="text-tiny text-default-400">
                      Do you want to use a certain runner to run your
                      executions?
                    </p>
                  </div>
                </Switch>
                {runnerLimit && (
                  <Select
                    label="Runner"
                    placeholder="All Actions will be executed on this runner"
                    selectedKeys={[runnerId]}
                    variant="bordered"
                    onSelectionChange={handleSelectRunner}
                  >
                    {runners
                      .filter((runner: any) => runner.shared_runner === false)
                      .map((runner: any) => (
                        <SelectItem key={runner.id}>{runner.name}</SelectItem>
                      ))}
                  </Select>
                )}
              </ModalBody>
              <ModalFooter>
                <Button variant="ghost" onPress={onClose}>
                  Cancel
                </Button>
                <Button
                  color="warning"
                  isLoading={isLoading}
                  variant="flat"
                  onPress={editFlow}
                >
                  Save Changes
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>
    </>
  );
}
