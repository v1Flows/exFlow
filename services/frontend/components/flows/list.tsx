"use client";

import {
  Card,
  CardBody,
  Dropdown,
  DropdownMenu,
  DropdownItem,
  DropdownTrigger,
  useDisclosure,
  CardFooter,
  Chip,
  Button,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

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
    <main>
      <Card className="bg-content1 shadow-md">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold">Folders</h2>
            </div>
            <Button
              isDisabled={!searchFolderID}
              startContent={<Icon icon="hugeicons:link-backward" width={18} />}
              variant="bordered"
              onPress={() => {
                if (
                  folders.find((f: any) => f.id === searchFolderID)
                    .parent_id !== ""
                ) {
                  router.push(
                    "/flows?folder=" +
                      folders.find((f: any) => f.id === searchFolderID)
                        .parent_id,
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
                  <Card
                    isDisabled
                    className="bg-content2 hover:bg-content3 transition-colors"
                  >
                    <CardBody>
                      <div className="flex items-start justify-between">
                        <Chip
                          color="primary"
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          Current Folder
                        </Chip>
                        <Dropdown isDisabled placement="bottom-end">
                          <DropdownTrigger>
                            <Button isIconOnly size="sm" variant="light">
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
                                <Icon
                                  icon="hugeicons:pencil-edit-02"
                                  width={18}
                                />
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
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Icon
                          className="text-2xl text-primary"
                          icon="hugeicons:folder-01"
                        />
                        <div className="flex flex-col items-center justify-center text-center">
                          <span className="font-medium">{f.name}</span>
                          <span className="text-default-500">
                            {f.description}
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                );
              })()}
            {filteredFolders.map((f: any) => (
              <Card
                key={f.id}
                isPressable
                className="bg-content2 hover:bg-content3 transition-colors"
                onPress={() => router.push("/flows?folder=" + f.id)}
              >
                <CardBody>
                  <div className="flex items-start justify-end">
                    <Dropdown placement="bottom-end">
                      <DropdownTrigger>
                        <Button isIconOnly size="sm" variant="light">
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
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Icon
                      className="text-2xl text-primary"
                      icon="hugeicons:folder-01"
                    />
                    <div className="flex flex-col items-center justify-center text-center">
                      <span className="font-medium">{f.name}</span>
                      <span className="text-default-500">{f.description}</span>
                    </div>
                  </div>
                </CardBody>
              </Card>
            ))}
          </div>
        </CardBody>
      </Card>

      <Card className="bg-content1 shadow-md mt-4">
        <CardBody>
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-semibold">Flows</h2>
            <p className="text-sm">
              <span className="text-default-500">Current Folder:</span>{" "}
              {folders.find((f: any) => f.id === searchFolderID)?.name ||
                "All Flows"}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredFlows.map((flow) => {
              const project = projects.find(
                (p: any) => p.id === flow.project_id,
              );

              return (
                <Card
                  key={flow.id}
                  className="bg-content2 hover:bg-content3 transition-colors"
                  isDisabled={flow.disabled}
                  isPressable={!flow.disabled}
                  onPress={() => router.push("/flows/" + flow.id)}
                >
                  <CardBody className="p-4">
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="text-lg font-semibold">{flow.name}</h3>
                      <div className="flex items-center gap-2">
                        {runningExecutions.executions.filter(
                          (e: any) => e.flow_id === flow.id,
                        ).length > 0 && (
                          <Chip
                            color="primary"
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            Executing
                          </Chip>
                        )}
                        <Chip
                          color={flow.disabled ? "danger" : "success"}
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          {flow.disabled ? "Disabled" : "Active"}
                        </Chip>
                      </div>
                    </div>
                    <p className="text-sm text-foreground-500 mb-2">
                      {flow.description || "No description"}
                    </p>
                  </CardBody>
                  <CardFooter className="justify-between gap-1 p-2">
                    <p className="text-xs text-foreground-400">
                      Project: {project.name || "Unknown"}
                    </p>
                    <div className="flex gap-1">
                      <Button
                        isIconOnly
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
                        <Icon
                          className="text-success"
                          icon="hugeicons:play"
                          width={16}
                        />
                      </Button>
                      <Button
                        isIconOnly
                        isDisabled={
                          (!canEditProject(user.id, project.members) ||
                            flow.disabled) &&
                          user.role !== "admin"
                        }
                        size="sm"
                        variant="light"
                        onPress={() => {
                          setTargetFlow(flow);
                          editFlowModal.onOpen();
                        }}
                      >
                        <Icon icon="hugeicons:pencil-edit-02" width={16} />
                      </Button>
                      <Dropdown placement="bottom-end">
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon
                              className="text-lg"
                              icon="hugeicons:more-vertical-circle-01"
                              width={16}
                            />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu aria-label="Flow actions" variant="flat">
                          <DropdownItem
                            key="copy"
                            showDivider
                            startContent={
                              <Icon icon="hugeicons:copy-01" width={18} />
                            }
                            onPress={() => copyFlowIDtoClipboard(flow.id)}
                          >
                            Copy ID
                          </DropdownItem>
                          <DropdownItem
                            key="copy"
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
                            Copy
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
                  </CardFooter>
                </Card>
              );
            })}
          </div>
          {filteredFlows.length === 0 && (
            <p className="text-default-500 text-center">No flows found</p>
          )}
        </CardBody>
      </Card>

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
    </main>
  );
}
