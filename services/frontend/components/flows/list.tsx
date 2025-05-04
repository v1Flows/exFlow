"use client";

import {
  Card,
  CardBody,
  Dropdown,
  DropdownMenu,
  DropdownSection,
  DropdownItem,
  DropdownTrigger,
  useDisclosure,
  CardHeader,
  CardFooter,
  Chip,
  Badge,
  Tooltip,
  CircularProgress,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import ReactTimeago from "react-timeago";

import DeleteFolderModal from "../modals/folders/delete";
import UpdateFolderModal from "../modals/folders/update";
import ScheduleExecutionModal from "../modals/executions/schedule";

export default function FlowList({
  flows,
  folders,
  projects,
  runningExecutions,
}: {
  flows: any;
  folders: any;
  projects: any;
  runningExecutions: any;
}) {
  const router = useRouter();

  const [filteredFolders, setFilteredFolders] = useState([]);
  const [filteredFlows, setFilteredFlows] = useState([]);
  const [targetFolder, setTargetFolder] = useState({});
  const [targetFlow, setTargetFlow] = useState({});

  const scheduleExecutionModal = useDisclosure();
  const updateFolderModal = useDisclosure();
  const deleteFolderModal = useDisclosure();

  // get folder id from query params
  const searchParams = useSearchParams();
  const searchFolderID = searchParams.get("folder");

  useEffect(() => {
    console.log(runningExecutions);
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

  function status(execution: any) {
    if (execution.status === "scheduled") {
      return "Scheduled";
    } else if (execution.status === "pending") {
      return "Pending";
    } else if (execution.status === "running") {
      return "Running";
    } else if (execution.status === "paused") {
      return "Paused";
    } else if (execution.status === "canceled") {
      return "Canceled";
    } else if (execution.status === "noPatternMatch") {
      return "No Pattern Match";
    } else if (execution.status === "interactionWaiting") {
      return "Interaction Required";
    } else if (execution.status === "error") {
      return "Error";
    } else if (execution.status === "success") {
      return "Success";
    } else {
      return "Unknown";
    }
  }

  function statusColor(execution: any) {
    if (execution.status === "scheduled") {
      return "secondary";
    } else if (execution.status === "pending") {
      return "default-500";
    } else if (execution.status === "running") {
      return "primary";
    } else if (execution.status === "paused") {
      return "warning";
    } else if (execution.status === "canceled") {
      return "danger";
    } else if (execution.status === "noPatternMatch") {
      return "secondary";
    } else if (execution.status === "interactionWaiting") {
      return "primary";
    } else if (execution.status === "error") {
      return "danger";
    } else if (execution.status === "success") {
      return "success";
    } else {
      return "default";
    }
  }

  function statusIconPlain(execution: any) {
    if (execution.status === "scheduled") {
      return "hugeicons:time-schedule";
    } else if (execution.status === "pending") {
      return "hugeicons:time-quarter-pass";
    } else if (execution.status === "running") {
      return "hugeicons:play";
    } else if (execution.status === "paused") {
      return "hugeicons:pause";
    } else if (execution.status === "interactionWaiting") {
      return "hugeicons:waving-hand-01";
    } else {
      return "solar:question-square-linear";
    }
  }

  function statusIcon(execution: any) {
    if (execution.status === "scheduled") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="secondary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-secondary-500"
              icon="hugeicons:time-schedule"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "pending") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="default"
            size="md"
            value={100}
            valueLabel={
              <Icon
                className="text-default-500"
                icon="hugeicons:time-quarter-pass"
                width={20}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "running") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress aria-label="Step" color="primary" size="lg" />
        </Tooltip>
      );
    } else if (execution.status === "paused") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="warning"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-warning"
                icon="hugeicons:pause"
                width={16}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "canceled") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="danger"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-danger"
                icon="hugeicons:cancel-01"
                width={20}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "noPatternMatch") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            color="secondary"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-secondary"
                icon="hugeicons:note-remove"
                width={20}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "interactionWaiting") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="primary"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-primary"
                icon="hugeicons:waving-hand-01"
                width={22}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "error") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="danger"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-danger"
                icon="hugeicons:alert-02"
                width={20}
              />
            }
          />
        </Tooltip>
      );
    } else if (execution.status === "success") {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="success"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-success"
                icon="hugeicons:tick-double-01"
                width={22}
              />
            }
          />
        </Tooltip>
      );
    } else {
      return (
        <Tooltip content={`${status(execution)}`}>
          <CircularProgress
            showValueLabel
            aria-label="Step"
            color="success"
            size="lg"
            value={100}
            valueLabel={
              <Icon
                className="text-success"
                icon="solar:question-square-linear"
                width={22}
              />
            }
          />
        </Tooltip>
      );
    }
  }

  function getDuration(execution: any) {
    let calFinished = new Date().toISOString();

    if (execution.executed_at === "0001-01-01T00:00:00Z") {
      return "N/A";
    }

    if (execution.finished_at !== "0001-01-01T00:00:00Z") {
      calFinished = execution.finished_at;
    }

    const ms =
      new Date(calFinished).getTime() -
      new Date(execution.executed_at).getTime();
    const sec = Math.floor(ms / 1000);
    const min = Math.floor(sec / 60);
    const hr = Math.floor(min / 60);
    const day = Math.floor(hr / 24);

    if (day > 0) {
      return `${day}d ${hr % 24}h ${min % 60}m ${sec % 60}s`;
    } else if (hr > 0) {
      return `${hr}h ${min % 60}m ${sec % 60}s`;
    } else if (min > 0) {
      return `${min}m ${sec % 60}s`;
    } else {
      return `${sec}s`;
    }
  }

  return (
    <main>
      <p className="text-xl font-bold mb-2">Folders</p>
      <div className="grid lg:grid-cols-6 grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        {searchFolderID && (
          <Card
            isHoverable
            isPressable
            className="bg-default-200 bg-opacity-10 border-1 border-default-300 p-3"
            onPress={() => router.back()}
          >
            <CardBody className="flex flex-col items-center justify-center gap-2">
              <Icon className="text-3xl" icon="hugeicons:link-backward" />
              <p>Back</p>
            </CardBody>
          </Card>
        )}
        {filteredFolders.map((f: any) => (
          <Card
            key={f.id}
            isHoverable
            isPressable
            className="bg-default-200 bg-opacity-20 border-1 border-default-300 pb-3"
            onPress={() => router.push("/flows?folder=" + f.id)}
          >
            <CardBody>
              <div className="flex items-start justify-end">
                <Dropdown backdrop="opaque">
                  <DropdownTrigger>
                    <Icon
                      className="m-1 hover:text-primary"
                      icon="solar:menu-dots-bold"
                      width={24}
                    />
                  </DropdownTrigger>
                  <DropdownMenu variant="flat">
                    <DropdownSection title="Actions">
                      <DropdownItem
                        key="edit"
                        showDivider
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
                    </DropdownSection>
                    <DropdownSection title="Danger Zone">
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
                    </DropdownSection>
                  </DropdownMenu>
                </Dropdown>
              </div>
              <div className="flex flex-col items-center justify-center gap-2">
                <Icon className="text-3xl" icon="hugeicons:folder-01" />
                <div className="text-center">
                  <p className="font-bold">{f.name}</p>
                  <p className="text-tiny text-default-500">{f.description}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        ))}
        {folders.length === 0 && (
          <p className="text-default-500 text-center col-span-4">
            No folders found
          </p>
        )}
      </div>

      <p className="text-xl font-bold mb-2">
        Flows <span className="text-tiny">(in current folder)</span>
      </p>

      {filteredFlows.length === 0 && (
        <p className="text-default-500 text-center">No flows found</p>
      )}

      <div className="grid lg:grid-cols-4 md:grid-cols-3 grid-cols-1 gap-4">
        {filteredFlows.map((flow: any) => {
          const project = projects.find((p: any) => p.id === flow.project_id);

          return (
            <Card
              key={flow.id}
              isHoverable
              isPressable
              className="bg-default-200 bg-opacity-20 border-1 border-default-300"
              onPress={() => router.push("/flows/" + flow.id)}
            >
              <CardHeader className="flex flex-cols items-center justify-between">
                <div className="flex flex-col items-start">
                  <p className="font-bold text-lg">{flow.name}</p>
                  <p className="text-sm text-default-500">{flow.description}</p>
                </div>
                {runningExecutions.executions.length > 0 && (
                  <div>
                    <Tooltip
                      content={
                        <>
                          {runningExecutions.executions
                            .filter(
                              (execution: any) => execution.flow_id === flow.id,
                            )
                            .map((execution: any) => {
                              return (
                                <Card
                                  key={execution.id}
                                  fullWidth
                                  isPressable
                                  className="border-1 border-default-300 mb-2"
                                  onPress={() => {
                                    router.push(
                                      `/flows/${flow.id}/execution/${execution.id}`,
                                    );
                                  }}
                                >
                                  <CardBody className="grid grid-cols-3 items-center justify-start gap-4">
                                    <div className="flex items-center justify-start gap-2">
                                      <div className="flex size-10 items-center justify-center">
                                        {statusIcon(execution)}
                                      </div>
                                      <div>
                                        <p
                                          className={`text-sm text- font-bold text-${statusColor(execution)}`}
                                        >
                                          {status(execution)}
                                        </p>
                                        <p className="text-sm text-default-500">
                                          Status
                                        </p>
                                      </div>
                                    </div>
                                    {execution.status === "scheduled" && (
                                      <div className="flex items-center justify-start gap-4">
                                        <div className="flex size-10 items-center justify-center rounded-large bg-default text-secondary bg-opacity-40">
                                          <Icon
                                            icon="hugeicons:time-schedule"
                                            width={22}
                                          />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold text-secondary">
                                            {execution.scheduled_at ===
                                            "0001-01-01T00:00:00Z" ? (
                                              "N/A"
                                            ) : (
                                              <ReactTimeago
                                                date={execution.scheduled_at}
                                              />
                                            )}
                                          </p>
                                          <p className="text-sm text-default-500">
                                            Scheduled At
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                    {execution.status !== "scheduled" && (
                                      <div className="flex items-center justify-start gap-4">
                                        <div className="flex size-10 items-center justify-center rounded-large bg-default bg-opacity-40">
                                          <Icon
                                            icon="hugeicons:timer-02"
                                            width={22}
                                          />
                                        </div>
                                        <div>
                                          <p className="text-sm font-bold">
                                            {getDuration(execution)}
                                          </p>
                                          <p className="text-sm text-default-500">
                                            Duration
                                          </p>
                                        </div>
                                      </div>
                                    )}
                                  </CardBody>
                                  <CardFooter>
                                    <p className="text-sm text-default-500">
                                      ID: {execution.id}
                                    </p>
                                  </CardFooter>
                                </Card>
                              );
                            })}
                        </>
                      }
                    >
                      <div className="flex items-center justify-center gap-3">
                        {runningExecutions.summary
                          .filter(
                            (execution: any) => execution.flow_id === flow.id,
                          )
                          .map((e: any) => {
                            return (
                              <Badge
                                key={e.status}
                                color="default"
                                content={e.count}
                                size="sm"
                                variant="faded"
                              >
                                <Icon
                                  className={`text-${statusColor(e)}-500`}
                                  icon={statusIconPlain(e)}
                                  width={24}
                                />
                              </Badge>
                            );
                          })}
                      </div>
                    </Tooltip>
                  </div>
                )}
              </CardHeader>
              <CardFooter className="flex flex-cols items-center justify-between">
                <p className="text-sm text-default-500">
                  Project: {project.name || "Unknown"}
                </p>
                <Chip
                  color={project.disabled ? "danger" : "success"}
                  radius="sm"
                  size="md"
                  variant="light"
                >
                  <p className="font-bold">
                    {project.disabled ? "Disabled" : "Active"}
                  </p>
                </Chip>
              </CardFooter>
            </Card>
          );
        })}
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
    </main>
  );
}
