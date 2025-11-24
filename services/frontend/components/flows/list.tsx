"use client";

import {
  addToast,
  Button,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  useDisclosure,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";

import canEditProject from "@/lib/functions/canEditProject";
import APIStartExecution from "@/lib/fetch/executions/start";

import DeleteFolderModal from "../modals/folders/delete";
import UpdateFolderModal from "../modals/folders/update";
import ScheduleExecutionModal from "../modals/executions/schedule";
import EditFlowModal from "../modals/flows/edit";
import DeleteFlowModal from "../modals/flows/delete";
import CopyFlowModal from "../modals/flows/copy";

export default function FlowList({
  flows,
  folders,
  projects,
  runningExecutions,
  user,
}: {
  flows: any;
  folders: any;
  projects: any;
  runningExecutions: any;
  user: any;
}) {
  const router = useRouter();

  const [filteredFolders, setFilteredFolders] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);
  const [targetFolder, setTargetFolder] = useState({});
  const [targetFlow, setTargetFlow] = useState({});

  const scheduleExecutionModal = useDisclosure();
  const updateFolderModal = useDisclosure();
  const copyFlowModal = useDisclosure();
  const deleteFolderModal = useDisclosure();

  const editFlowModal = useDisclosure();
  const deleteFlowModal = useDisclosure();

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  useEffect(() => {
    if (searchFolderID) {
      setFilteredFolders(
        folders.filter((f: any) => f.parent_id === searchFolderID),
      );
      setFilteredFlows(
        flows.filter((f: any) => f.folder_id === searchFolderID),
      );
    } else {
      setFilteredFolders(folders.filter((f: any) => f.parent_id === ""));
      setFilteredFlows(flows.filter((f: any) => f.folder_id === ""));
    }
  }, [searchFolderID, folders, flows]);

  const copyFlowIDtoClipboard = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      addToast({
        title: "Flow",
        description: "Flow ID copied to clipboard!",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Flow",
        description: "Failed to copy Flow ID to clipboard",
        color: "danger",
        variant: "flat",
      });
    }
  };

  return (
    <motion.main
      animate="visible"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-2xl font-semibold">Folders</h2>
          </div>
          <Button
            isDisabled={!searchFolderID}
            startContent={<Icon icon="hugeicons:link-backward" width={18} />}
            variant="light"
            onPress={() => {
              if (
                folders.find((f: any) => f.id === searchFolderID).parent_id !==
                ""
              ) {
                router.push(
                  "/flows?folder=" +
                    folders.find((f: any) => f.id === searchFolderID).parent_id,
                );
              } else {
                router.push("/flows");
              }
            }}
          >
            Back
          </Button>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {searchFolderID &&
            (() => {
              const f = folders.find((f: any) => f.id === searchFolderID);

              return (
                <motion.div
                  variants={{
                    hidden: { y: 20, opacity: 0 },
                    visible: { y: 0, opacity: 1 },
                  }}
                >
                  <Card
                    isDisabled
                    className="w-full h-full bg-content1/40 backdrop-blur-md border border-primary/20 shadow-sm"
                  >
                    <CardBody className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-3 rounded-xl bg-primary/20 text-primary">
                          <Icon
                            className="text-2xl"
                            icon="hugeicons:folder-open"
                          />
                        </div>
                        <Chip color="primary" size="sm" variant="flat">
                          Current
                        </Chip>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{f.name}</h3>
                        <p className="text-default-500 text-sm line-clamp-2">
                          {f.description}
                        </p>
                      </div>
                    </CardBody>
                  </Card>
                </motion.div>
              );
            })()}
          {filteredFolders.map((f: any) => (
            <motion.div
              key={f.id}
              variants={{
                hidden: { y: 20, opacity: 0 },
                visible: { y: 0, opacity: 1 },
              }}
            >
              <Card
                isPressable
                className="w-full h-full bg-content1/60 backdrop-blur-md shadow-sm border border-default-100 hover:scale-[1.02] hover:bg-content1/80 transition-all duration-300 group"
                onPress={() => router.push("/flows?folder=" + f.id)}
              >
                <CardBody className="p-4">
                  <div className="flex items-start justify-between mb-4">
                    <div className="p-3 rounded-xl bg-default-100 text-default-500 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      <Icon className="text-2xl" icon="hugeicons:folder-01" />
                    </div>
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button
                          isIconOnly
                          className="opacity-0 group-hover:opacity-100 transition-opacity"
                          size="sm"
                          variant="light"
                        >
                          <Icon
                            className="text-lg"
                            icon="hugeicons:more-vertical-circle-01"
                          />
                        </Button>
                      </DropdownTrigger>
                      <DropdownMenu variant="flat">
                        <DropdownItem
                          key="edit"
                          color="warning"
                          startContent={
                            <Icon icon="hugeicons:pencil-edit-02" width={18} />
                          }
                          onPress={() => {
                            setTargetFolder(f);
                            updateFolderModal.onOpen();
                          }}
                        >
                          Edit
                        </DropdownItem>
                        <DropdownItem
                          key="delete"
                          className="text-danger"
                          color="danger"
                          startContent={
                            <Icon icon="hugeicons:delete-02" width={18} />
                          }
                          onPress={() => {
                            setTargetFolder(f);
                            deleteFolderModal.onOpen();
                          }}
                        >
                          Delete
                        </DropdownItem>
                      </DropdownMenu>
                    </Dropdown>
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                      {f.name}
                    </h3>
                    <p className="text-default-500 text-sm line-clamp-2">
                      {f.description}
                    </p>
                  </div>
                </CardBody>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Flows</h2>
          <p className="text-sm">
            <span className="text-default-500">Current Folder:</span>{" "}
            {folders.find((f: any) => f.id === searchFolderID)?.name ||
              "All Flows"}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredFlows.map((flow: any) => {
            const project = projects.find((p: any) => p.id === flow.project_id);
            const isExecuting =
              runningExecutions.executions.filter(
                (e: any) => e.flow_id === flow.id,
              ).length > 0;

            return (
              <motion.div
                key={flow.id}
                variants={{
                  hidden: { y: 20, opacity: 0 },
                  visible: { y: 0, opacity: 1 },
                }}
              >
                <Card
                  isPressable
                  className="w-full h-full bg-content1/60 backdrop-blur-md shadow-sm border border-default-100 hover:scale-[1.02] hover:bg-content1/80 transition-all duration-300 group"
                  isDisabled={flow.disabled}
                  onPress={() => router.push("/flows/" + flow.id)}
                >
                  <CardBody className="p-5">
                    <div className="flex flex-col h-full justify-between gap-4">
                      <div className="flex items-start justify-between gap-4">
                        <div
                          className="shrink-0 w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform group-hover:scale-110"
                          style={{
                            background: `linear-gradient(135deg, ${project?.color || "#000"}20 0%, ${project?.color || "#000"}40 100%)`,
                            color: project?.color || "#000",
                            border: `1px solid ${project?.color || "#000"}40`,
                          }}
                        >
                          <Icon
                            className="text-2xl"
                            icon="hugeicons:workflow-square-01"
                          />
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            isIconOnly
                            color="success"
                            size="sm"
                            variant="light"
                            onPress={() => {
                              APIStartExecution(flow.id)
                                .then(() => {
                                  addToast({
                                    title: "Execution Started",
                                    color: "success",
                                  });
                                })
                                .catch((err) => {
                                  addToast({
                                    title: "Execution start failed",
                                    description: err.message,
                                    color: "danger",
                                  });
                                });
                            }}
                          >
                            <Icon icon="hugeicons:play" width={20} />
                          </Button>
                          <Dropdown placement="bottom-end">
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <Icon
                                  className="text-lg"
                                  icon="hugeicons:more-vertical-circle-01"
                                  width={20}
                                />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Flow actions"
                              variant="flat"
                            >
                              <DropdownItem
                                key="copy-id"
                                showDivider
                                startContent={
                                  <Icon icon="hugeicons:copy-01" width={18} />
                                }
                                onPress={() => copyFlowIDtoClipboard(flow.id)}
                              >
                                Copy ID
                              </DropdownItem>
                              <DropdownItem
                                key="edit"
                                isDisabled={
                                  (!canEditProject(user.id, project.members) ||
                                    flow.disabled) &&
                                  user.role !== "admin"
                                }
                                startContent={
                                  <Icon
                                    icon="hugeicons:pencil-edit-02"
                                    width={18}
                                  />
                                }
                                onPress={() => {
                                  setTargetFlow(flow);
                                  editFlowModal.onOpen();
                                }}
                              >
                                Edit
                              </DropdownItem>
                              <DropdownItem
                                key="copy-flow"
                                isDisabled={
                                  (!canEditProject(user.id, project.members) ||
                                    flow.disabled) &&
                                  user.role !== "admin"
                                }
                                startContent={
                                  <Icon icon="hugeicons:copy-02" width={18} />
                                }
                                onPress={() => {
                                  setTargetFlow(flow);
                                  copyFlowModal.onOpen();
                                }}
                              >
                                Copy Flow
                              </DropdownItem>
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                isDisabled={
                                  (!canEditProject(user.id, project.members) ||
                                    flow.disabled) &&
                                  user.role !== "admin"
                                }
                                startContent={
                                  <Icon icon="hugeicons:delete-02" width={18} />
                                }
                                onPress={() => {
                                  setTargetFlow(flow);
                                  deleteFlowModal.onOpen();
                                }}
                              >
                                Delete
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        </div>
                      </div>

                      <div>
                        <h3 className="font-bold text-lg text-default-900 mb-1 group-hover:text-primary transition-colors">
                          {flow.name}
                        </h3>
                        <p className="text-default-500 text-sm line-clamp-2 leading-relaxed">
                          {flow.description || "No description"}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-default-100 flex items-center justify-between">
                        <div className="flex gap-2">
                          {isExecuting && (
                            <Chip
                              className="border-none pl-0"
                              color="primary"
                              size="sm"
                              variant="dot"
                            >
                              Executing
                            </Chip>
                          )}
                          <Chip
                            className="border-none pl-0"
                            color={flow.disabled ? "danger" : "success"}
                            size="sm"
                            variant="dot"
                          >
                            {flow.disabled ? "Disabled" : "Active"}
                          </Chip>
                        </div>
                        <div className="text-tiny text-default-400 font-medium">
                          {project?.name || "Unknown Project"}
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              </motion.div>
            );
          })}
        </div>
        {filteredFlows.length === 0 && (
          <p className="text-default-500 text-center mt-8">No flows found</p>
        )}
      </div>

      <ScheduleExecutionModal
        disclosure={scheduleExecutionModal}
        flow={targetFlow}
      />
      <UpdateFolderModal
        disclosure={updateFolderModal}
        folder={targetFolder}
        folders={folders}
        projects={projects}
      />
      <DeleteFolderModal disclosure={deleteFolderModal} folder={targetFolder} />
      <EditFlowModal
        disclosure={editFlowModal}
        folders={folders}
        projects={projects}
        targetFlow={targetFlow}
      />
      <CopyFlowModal
        disclosure={copyFlowModal}
        flow={targetFlow}
        folders={folders}
        projects={projects}
      />
      <DeleteFlowModal disclosure={deleteFlowModal} flow={targetFlow} />
    </motion.main>
  );
}
