"use client";

import type { UseDisclosureReturn } from "@heroui/use-disclosure";

import {
  addToast,
  Button,
  Card,
  CardBody,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Select,
  SelectItem,
  Switch,
  Chip,
} from "@heroui/react";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useMemo } from "react";
import { Icon } from "@iconify/react";
import { motion, AnimatePresence } from "framer-motion";

import GetProjectRunners from "@/lib/fetch/project/runners";
import CreateFlow from "@/lib/fetch/flow/POST/CreateFlow";
import ErrorCard from "@/components/error/ErrorCard";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

export default function CreateFlowModal({
  folders,
  projects,
  disclosure,
}: {
  folders: any;
  projects: any;
  disclosure: UseDisclosureReturn;
}) {
  const { refreshFlowData } = useRefreshCache();

  // create modal
  const { isOpen, onOpenChange } = disclosure;

  const [type, setType] = useState("default");
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

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  useEffect(() => {
    if (searchFolderID) {
      setFolderId(searchFolderID);
    } else {
      setFolderId("");
    }
  }, [searchFolderID]);

  // Reset state when modal opens/closes
  useEffect(() => {
    if (!isOpen) {
      setName("");
      setType("default");
      setDescription("");
      setFolderId("");
      setProjectId("");
      setRunnerId("");
      setRunnerLimit(false);
      setError(false);
      setErrorText("");
      setErrorMessage("");
      setIsLoading(false);
    }
  }, [isOpen]);

  const projectSelected = async (e: any) => {
    setProjectId(e.currentKey);
    setRunnerId("");
    if (e.currentKey) {
      const runners = await GetProjectRunners(e.currentKey);

      setRunners(runners.success ? runners.data.runners : []);
    } else {
      setRunners([]);
    }
  };

  const folderSelected = async (e: any) => {
    setFolderId(e.currentKey);
  };

  const handleSelectRunner = (e: any) => {
    setRunnerId(e.currentKey);
  };

  async function createFlow() {
    if (!name || !projectId || !type) return;

    setIsLoading(true);

    const response = (await CreateFlow(
      type,
      name,
      description,
      folderId,
      projectId,
      runnerLimit ? runnerId : "any",
    )) as any;

    if (!response) {
      setError(true);
      setErrorText("Failed to create flow");
      setErrorMessage("Failed to create flow");
      setIsLoading(false);

      return;
    }

    if (response.success) {
      refreshFlowData();
      onOpenChange();
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

  const selectedProject = useMemo(() => {
    return projects.find((p: any) => p.id === projectId);
  }, [projectId, projects]);

  const projectColor = selectedProject?.color || "#000000";

  return (
    <Modal
      backdrop="blur"
      classNames={{
        base: "bg-content1 border border-default-100",
        header: "border-b border-default-100",
        footer: "border-t border-default-100",
      }}
      isOpen={isOpen}
      placement="center"
      size="5xl"
      onOpenChange={onOpenChange}
    >
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1">
              <h2 className="text-xl font-bold">Create New Flow</h2>
              <p className="text-sm text-default-500 font-normal">
                Configure your new flow and preview how it will look.
              </p>
            </ModalHeader>
            <ModalBody className="p-0">
              <div className="flex flex-col md:flex-row h-[600px]">
                {/* Left Side: Form */}
                <div className="w-full md:w-1/2 p-6 overflow-y-auto border-r border-default-100">
                  <div className="flex flex-col gap-6">
                    {error && (
                      <ErrorCard error={errorText} message={errorMessage} />
                    )}

                    {/* Type Selection */}
                    <div className="flex flex-col gap-2">
                      <p className="text-sm font-medium text-default-700">
                        Flow Type
                      </p>
                      <div className="grid grid-cols-2 gap-3">
                        <Card
                          isPressable
                          className={`border-2 transition-all ${
                            type === "default"
                              ? "border-primary bg-primary/5"
                              : "border-transparent bg-content2 hover:bg-content3"
                          }`}
                          onPress={() => setType("default")}
                        >
                          <CardBody className="flex flex-col items-center justify-center gap-2 p-4">
                            <Icon
                              className={`text-2xl ${
                                type === "default"
                                  ? "text-primary"
                                  : "text-default-500"
                              }`}
                              icon="hugeicons:play"
                            />
                            <span
                              className={`font-semibold ${
                                type === "default"
                                  ? "text-primary"
                                  : "text-default-700"
                              }`}
                            >
                              Default
                            </span>
                          </CardBody>
                        </Card>
                        <Card
                          isPressable
                          className={`border-2 transition-all ${
                            type === "alert"
                              ? "border-primary bg-primary/5"
                              : "border-transparent bg-content2 hover:bg-content3"
                          }`}
                          onPress={() => setType("alert")}
                        >
                          <CardBody className="flex flex-col items-center justify-center gap-2 p-4">
                            <Icon
                              className={`text-2xl ${
                                type === "alert"
                                  ? "text-primary"
                                  : "text-default-500"
                              }`}
                              icon="hugeicons:alert-02"
                            />
                            <span
                              className={`font-semibold ${
                                type === "alert"
                                  ? "text-primary"
                                  : "text-default-700"
                              }`}
                            >
                              Alert Based
                            </span>
                          </CardBody>
                        </Card>
                      </div>
                    </div>

                    <div className="flex flex-col gap-4">
                      <Input
                        isRequired
                        classNames={{
                          inputWrapper: "bg-content2 hover:bg-content3",
                        }}
                        label="Name"
                        labelPlacement="outside"
                        placeholder="e.g. Daily Backup"
                        value={name}
                        variant="bordered"
                        onValueChange={setName}
                      />
                      <Input
                        classNames={{
                          inputWrapper: "bg-content2 hover:bg-content3",
                        }}
                        label="Description"
                        labelPlacement="outside"
                        placeholder="Describe what this flow does..."
                        value={description}
                        variant="bordered"
                        onValueChange={setDescription}
                      />
                    </div>

                    <div className="flex flex-col gap-4">
                      <Select
                        isRequired
                        classNames={{
                          trigger: "bg-content2 hover:bg-content3",
                        }}
                        label="Project"
                        labelPlacement="outside"
                        placeholder="Select a project"
                        selectedKeys={projectId ? [projectId] : []}
                        variant="bordered"
                        onSelectionChange={projectSelected}
                      >
                        {projects.map((project: any) => (
                          <SelectItem
                            key={project.id}
                            startContent={
                              <div
                                className="w-4 h-4 rounded-full"
                                style={{ backgroundColor: project.color }}
                              />
                            }
                          >
                            {project.name}
                          </SelectItem>
                        ))}
                      </Select>

                      <Select
                        classNames={{
                          trigger: "bg-content2 hover:bg-content3",
                        }}
                        label="Folder"
                        labelPlacement="outside"
                        placeholder="Select a folder (optional)"
                        selectedKeys={folderId ? [folderId] : []}
                        variant="bordered"
                        onSelectionChange={folderSelected}
                      >
                        {folders.map((folder: any) => (
                          <SelectItem key={folder.id}>{folder.name}</SelectItem>
                        ))}
                      </Select>
                    </div>

                    <div className="flex flex-col gap-3 p-4 rounded-medium bg-content2/50 border border-default-100">
                      <div className="flex items-center justify-between">
                        <div className="flex flex-col gap-1">
                          <span className="text-sm font-medium">
                            Limit Runner
                          </span>
                          <span className="text-tiny text-default-500">
                            Restrict execution to a specific runner
                          </span>
                        </div>
                        <Switch
                          isSelected={runnerLimit}
                          size="sm"
                          onValueChange={setRunnerLimit}
                        />
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
                              classNames={{
                                trigger: "bg-content1",
                              }}
                              isDisabled={!projectId}
                              label="Select Runner"
                              placeholder="Choose a runner"
                              selectedKeys={runnerId ? [runnerId] : []}
                              variant="bordered"
                              onSelectionChange={handleSelectRunner}
                            >
                              {runners
                                .filter(
                                  (runner: any) =>
                                    runner.shared_runner === false,
                                )
                                .map((runner: any) => (
                                  <SelectItem key={runner.id}>
                                    {runner.name}
                                  </SelectItem>
                                ))}
                            </Select>
                            {!projectId && (
                              <p className="text-tiny text-warning mt-1">
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
                <div className="w-full md:w-1/2 bg-content2/50 p-8 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute top-4 right-4">
                    <Chip
                      color="primary"
                      startContent={
                        <Icon className="ml-1" icon="hugeicons:eye" />
                      }
                      variant="flat"
                    >
                      Live Preview
                    </Chip>
                  </div>

                  <div className="w-full max-w-sm">
                    <Card className="w-full bg-content1/60 backdrop-blur-md shadow-sm border border-default-100">
                      <CardBody className="p-5">
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
                                  type === "alert"
                                    ? "hugeicons:alert-02"
                                    : "hugeicons:workflow-square-01"
                                }
                              />
                            </div>
                            <div className="flex items-center gap-1 opacity-50">
                              <Button
                                isDisabled
                                isIconOnly
                                color="success"
                                size="sm"
                                variant="light"
                              >
                                <Icon icon="hugeicons:play" width={20} />
                              </Button>
                              <Button
                                isDisabled
                                isIconOnly
                                size="sm"
                                variant="light"
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
                            <h3 className="font-bold text-lg text-default-900 mb-1">
                              {name || "Flow Name"}
                            </h3>
                            <p className="text-default-500 text-sm line-clamp-2 leading-relaxed">
                              {description ||
                                "Flow description will appear here..."}
                            </p>
                          </div>

                          <div className="pt-4 border-t border-default-100 flex items-center justify-between">
                            <div className="flex gap-2">
                              <Chip
                                className="border-none pl-0"
                                color="success"
                                size="sm"
                                variant="dot"
                              >
                                Active
                              </Chip>
                            </div>
                            <div className="text-tiny text-default-400 font-medium">
                              {selectedProject?.name || "Project Name"}
                            </div>
                          </div>
                        </div>
                      </CardBody>
                    </Card>
                  </div>
                  <p className="text-default-400 text-sm mt-8 text-center max-w-xs">
                    This is how your flow will appear in the dashboard
                  </p>
                </div>
              </div>
            </ModalBody>
            <ModalFooter className="pr-6">
              <Button
                startContent={<Icon icon="hugeicons:cancel-01" />}
                variant="light"
                onPress={onClose}
              >
                Cancel
              </Button>
              <Button
                color="primary"
                isDisabled={!name || !projectId}
                isLoading={isLoading}
                startContent={<Icon icon="hugeicons:plus-sign" />}
                onPress={createFlow}
              >
                Create Flow
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
