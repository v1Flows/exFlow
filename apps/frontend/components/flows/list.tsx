"use client";
import {
  Button,
  Card,
  Chip,
  Dropdown,
  toast,
  useOverlayState,
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
  const scheduleExecutionModal = useOverlayState();
  const updateFolderModal = useOverlayState();
  const copyFlowModal = useOverlayState();
  const deleteFolderModal = useOverlayState();
  const editFlowModal = useOverlayState();
  const deleteFlowModal = useOverlayState();
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
      toast.success("Flow", { description: "Flow ID copied to clipboard!" });
    } else {
      toast.danger("Flow", {
        description: "Failed to copy Flow ID to clipboard",
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
            variant="ghost"
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
            {<Icon icon="hugeicons:link-backward" width={18} />}
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
                  <Card className="w-full h-full bg-surface/40 backdrop-blur-md border border-accent/20 shadow-sm">
                    <Card.Content className="p-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="p-3 rounded-xl bg-accent/20 text-accent">
                          <Icon
                            className="text-2xl"
                            icon="hugeicons:folder-open"
                          />
                        </div>
                        <Chip color="accent" size="sm" variant="soft">
                          <Chip.Label>Current</Chip.Label>
                        </Chip>
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{f.name}</h3>
                        <p className="text-muted text-sm line-clamp-2">
                          {f.description}
                        </p>
                      </div>
                    </Card.Content>
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
              <Button
                className="h-auto w-full justify-start p-0 text-left"
                variant="tertiary"
                onPress={() => router.push("/flows?folder=" + f.id)}
              >
                <Card className="w-full h-full bg-surface/60 backdrop-blur-md shadow-sm border border-default hover:scale-[1.02] hover:bg-surface/80 transition-all duration-300 group">
                  <Card.Content className="p-4">
                    <div className="flex items-start justify-between mb-4">
                      <div className="p-3 rounded-xl bg-default text-muted group-hover:bg-accent/10 group-hover:text-accent transition-colors">
                        <Icon className="text-2xl" icon="hugeicons:folder-01" />
                      </div>
                      <Dropdown>
                        <Dropdown.Trigger>
                          <Button
                            className="opacity-0 group-hover:opacity-100 transition-opacity"
                            size="sm"
                            variant="ghost"
                          >
                            <Icon
                              className="text-lg"
                              icon="hugeicons:more-vertical-circle-01"
                            />
                          </Button>
                        </Dropdown.Trigger>
                        <Dropdown.Popover>
                          <Dropdown.Menu>
                            <Dropdown.Item
                              key="edit"
                              id="edit"
                              onPress={() => {
                                setTargetFolder(f);
                                updateFolderModal.open();
                              }}
                              textValue="Edit"
                            >
                              {
                                <Icon
                                  icon="hugeicons:pencil-edit-02"
                                  width={18}
                                />
                              }
                              Edit
                            </Dropdown.Item>
                            <Dropdown.Item
                              key="delete"
                              id="delete"
                              className="text-danger"
                              onPress={() => {
                                setTargetFolder(f);
                                deleteFolderModal.open();
                              }}
                              textValue="Delete"
                            >
                              {<Icon icon="hugeicons:delete-02" width={18} />}
                              Delete
                            </Dropdown.Item>
                          </Dropdown.Menu>
                        </Dropdown.Popover>
                      </Dropdown>
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg group-hover:text-accent transition-colors">
                        {f.name}
                      </h3>
                      <p className="text-muted text-sm line-clamp-2">
                        {f.description}
                      </p>
                    </div>
                  </Card.Content>
                </Card>
              </Button>
            </motion.div>
          ))}
        </div>
      </div>

      <div>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Flows</h2>
          <p className="text-sm">
            <span className="text-muted">Current Folder:</span>{" "}
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
                <Button
                  className="h-auto w-full justify-start p-0 text-left"
                  variant="tertiary"
                  onPress={() => router.push("/flows/" + flow.id)}
                >
                  <Card className="w-full h-full bg-surface/60 backdrop-blur-md shadow-sm border border-default hover:scale-[1.02] hover:bg-surface/80 transition-all duration-300 group">
                    <Card.Content className="p-5">
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
                              size="sm"
                              variant="ghost"
                              onPress={() => {
                                APIStartExecution(flow.id)
                                  .then(() => {
                                    toast.success("Execution Started");
                                  })
                                  .catch((err) => {
                                    toast.danger("Execution start failed", {
                                      description: err.message,
                                    });
                                  });
                              }}
                              className="aspect-square p-0"
                            >
                              <Icon icon="hugeicons:play" width={20} />
                            </Button>
                            <Dropdown>
                              <Dropdown.Trigger>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  className="aspect-square p-0"
                                >
                                  <Icon
                                    className="text-lg"
                                    icon="hugeicons:more-vertical-circle-01"
                                    width={20}
                                  />
                                </Button>
                              </Dropdown.Trigger>
                              <Dropdown.Popover>
                                <Dropdown.Menu aria-label="Flow actions">
                                  <Dropdown.Item
                                    key="copy-id"
                                    id="copy-id"
                                    onPress={() =>
                                      copyFlowIDtoClipboard(flow.id)
                                    }
                                    textValue="Copy ID"
                                  >
                                    {
                                      <Icon
                                        icon="hugeicons:copy-01"
                                        width={18}
                                      />
                                    }
                                    Copy ID
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    key="edit"
                                    id="edit"
                                    isDisabled={
                                      (!canEditProject(
                                        user.id,
                                        project.members,
                                      ) ||
                                        flow.disabled) &&
                                      user.role !== "admin"
                                    }
                                    onPress={() => {
                                      setTargetFlow(flow);
                                      editFlowModal.open();
                                    }}
                                    textValue="Edit"
                                  >
                                    {
                                      <Icon
                                        icon="hugeicons:pencil-edit-02"
                                        width={18}
                                      />
                                    }
                                    Edit
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    key="copy-flow"
                                    id="copy-flow"
                                    isDisabled={
                                      (!canEditProject(
                                        user.id,
                                        project.members,
                                      ) ||
                                        flow.disabled) &&
                                      user.role !== "admin"
                                    }
                                    onPress={() => {
                                      setTargetFlow(flow);
                                      copyFlowModal.open();
                                    }}
                                    textValue="Copy Flow"
                                  >
                                    {
                                      <Icon
                                        icon="hugeicons:copy-02"
                                        width={18}
                                      />
                                    }
                                    Copy Flow
                                  </Dropdown.Item>
                                  <Dropdown.Item
                                    key="delete"
                                    id="delete"
                                    className="text-danger"
                                    isDisabled={
                                      (!canEditProject(
                                        user.id,
                                        project.members,
                                      ) ||
                                        flow.disabled) &&
                                      user.role !== "admin"
                                    }
                                    onPress={() => {
                                      setTargetFlow(flow);
                                      deleteFlowModal.open();
                                    }}
                                    textValue="Delete"
                                  >
                                    {
                                      <Icon
                                        icon="hugeicons:delete-02"
                                        width={18}
                                      />
                                    }
                                    Delete
                                  </Dropdown.Item>
                                </Dropdown.Menu>
                              </Dropdown.Popover>
                            </Dropdown>
                          </div>
                        </div>

                        <div>
                          <h3 className="font-bold text-lg text-foreground mb-1 group-hover:text-accent transition-colors">
                            {flow.name}
                          </h3>
                          <p className="text-muted text-sm line-clamp-2 leading-relaxed">
                            {flow.description || "No description"}
                          </p>
                        </div>

                        <div className="pt-4 border-t border-default flex items-center justify-between">
                          <div className="flex gap-2">
                            {isExecuting && (
                              <Chip
                                className="border-none pl-0"
                                color="accent"
                                size="sm"
                                variant="soft"
                              >
                                <Chip.Label>Executing</Chip.Label>
                              </Chip>
                            )}
                            <Chip
                              className="border-none pl-0"
                              color={flow.disabled ? "danger" : "success"}
                              size="sm"
                              variant="soft"
                            >
                              <Chip.Label>
                                {flow.disabled ? "Disabled" : "Active"}
                              </Chip.Label>
                            </Chip>
                          </div>
                          <div className="text-xs text-muted font-medium">
                            {project?.name || "Unknown Project"}
                          </div>
                        </div>
                      </div>
                    </Card.Content>
                  </Card>
                </Button>
              </motion.div>
            );
          })}
        </div>
        {filteredFlows.length === 0 && (
          <p className="text-muted text-center mt-8">No flows found</p>
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
