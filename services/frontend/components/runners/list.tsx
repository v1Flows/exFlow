"use client";

import { Icon } from "@iconify/react";
import {
  addToast,
  Alert,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spacer,
  useDisclosure,
} from "@heroui/react";
import React from "react";
import TimeAgo from "react-timeago";

import DeleteRunnerModal from "@/components/modals/runner/delete";
import RunnerDetails from "@/components/modals/runner/details";
import canEditProject from "@/lib/functions/canEditProject";

import EditRunnerModal from "../modals/runner/edit";
import ChangeRunnerStatusModal from "../modals/runner/changeStatus";

export default function RunnersList({
  runners,
  projects,
  user,
  singleProject,
}: {
  runners: any;
  projects: any;
  user: any;
  singleProject?: boolean;
}) {
  const [targetRunner, setTargetRunner] = React.useState({} as any);
  const [targetRunnerStatus, setTargetRunnerStatus] = React.useState(false);
  const showRunnerDrawer = useDisclosure();
  const editRunnerModal = useDisclosure();
  const changeRunnerStatusModal = useDisclosure();
  const deleteRunnerModal = useDisclosure();

  const copyRunnerIDtoClipboard = (id: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(id);
      addToast({
        title: "RunnerID",
        description: "RunnerID copied to clipboard",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "RunnerID",
        description: "Failed to copy RunnerID to clipboard",
        color: "danger",
        variant: "flat",
      });
    }
  };

  function heartbeatColor(runner: any) {
    const timeAgo =
      (new Date(runner.last_heartbeat).getTime() - Date.now()) / 1000;

    if (timeAgo < 0 && timeAgo > -30) {
      return "success";
    } else if (timeAgo <= -30 && timeAgo > -60) {
      return "warning";
    } else if (timeAgo <= -60) {
      return "danger";
    }
  }

  function heartbeatStatus(runner: any) {
    const timeAgo =
      (new Date(runner.last_heartbeat).getTime() - Date.now()) / 1000;

    if (timeAgo < 0 && timeAgo > -30) {
      return true;
    } else if (timeAgo <= -30) {
      return false;
    }
  }

  return (
    <main>
      <p className="text-lg font-bold mb-2">Shared</p>
      <Divider className="mb-4 max-w-[70px]" />
      <div>
        {runners.filter((runner: any) => runner.shared_runner === true)
          .length === 0 && (
          <p className="text-default-500">No shared runners found</p>
        )}
        <div className="grid gap-4 lg:grid-cols-2">
          {runners.map(
            (runner: any) =>
              runner.shared_runner === true && (
                <Card key={runner.id}>
                  <CardHeader className="items-center justify-between">
                    <div className="flex flex-col gap-1">
                      <div className="flex gap-2">
                        <p className="text-md">{runner.name}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <Chip
                            color={runner.disabled ? "danger" : "success"}
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            {runner.disabled ? "Disabled" : "Enabled"}
                          </Chip>
                          <Chip
                            color={heartbeatColor(runner)}
                            radius="sm"
                            size="sm"
                            variant="flat"
                          >
                            {heartbeatStatus(runner) ? "Healthy" : "Unhealthy"}
                          </Chip>
                        </div>
                      </div>
                      <p className="text-sm text-default-500">{runner.id}</p>
                    </div>
                    <div className="relative flex items-center justify-end gap-2">
                      <Dropdown backdrop="opaque">
                        <DropdownTrigger>
                          <Button isIconOnly size="sm" variant="light">
                            <Icon
                              className="text-default-300"
                              icon="solar:menu-dots-bold"
                            />
                          </Button>
                        </DropdownTrigger>
                        <DropdownMenu>
                          <DropdownSection title="Actions">
                            <DropdownItem
                              key="copy"
                              startContent={
                                <Icon icon="solar:copy-outline" width={18} />
                              }
                              onPress={() => copyRunnerIDtoClipboard(runner.id)}
                            >
                              Copy ID
                            </DropdownItem>
                          </DropdownSection>
                        </DropdownMenu>
                      </Dropdown>
                    </div>
                  </CardHeader>
                  <Divider />
                  <CardBody className="flex flex-col">
                    {runner.disabled && (
                      <p className="mb-4 text-center text-lg font-bold text-danger">
                        {runner.disabled_reason}
                      </p>
                    )}
                    <div className="grid gap-4 text-center sm:grid-cols-2 lg:grid-cols-3">
                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                          <Icon icon="solar:heart-pulse-outline" width={20} />
                        </div>
                        <div>
                          <p
                            className={`text-md text-${heartbeatColor(runner)} font-bold`}
                          >
                            {runner.last_heartbeat !==
                              "0001-01-01T00:00:00Z" && (
                              <TimeAgo date={runner.last_heartbeat} />
                            )}
                            {runner.last_heartbeat === "0001-01-01T00:00:00Z" &&
                              "N/A"}
                          </p>
                          <p className="text-sm text-default-500">
                            Last Heartbeat
                          </p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                          <Icon
                            icon="solar:gamepad-minimalistic-outline"
                            width={20}
                          />
                        </div>
                        <div>
                          <p
                            className={`text-md font-bold ${runner.executing_job && "text-success"}`}
                          >
                            {runner.executing_job ? "Executing Job" : "Idle"}
                          </p>
                          <p className="text-sm text-default-500">Status</p>
                        </div>
                      </div>

                      <div className="flex flex-col items-center justify-center gap-1">
                        <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                          <Icon icon="solar:sd-card-outline" width={20} />
                        </div>
                        <div>
                          <p className="text-md font-bold">
                            {runner.version ? runner.version : "N/A"}
                          </p>
                          <p className="text-sm text-default-500">Version</p>
                        </div>
                      </div>
                    </div>
                  </CardBody>
                </Card>
              ),
          )}
        </div>
      </div>

      <Spacer y={4} />

      <p className="text-lg font-bold mb-2">Project Bound</p>
      <Divider className="mb-4 max-w-[130px]" />
      {projects.length === 0 && (
        <p className="text-default-500">
          No projects found. Please create a project to use runners.
        </p>
      )}

      {projects.map((project: any) => (
        <div key={project.id} className="mb-4">
          {!singleProject && (
            <div className="flex flex-cols items-center justify-start gap-2 mb-4">
              <Icon
                icon={
                  project.icon ? project.icon : "solar:question-square-outline"
                }
                style={{ color: project.color }}
                width={24}
              />
              <p className="text-lg font-bold">{project.name}</p>
            </div>
          )}
          {runners.filter((runner: any) => runner.project_id === project.id)
            .length === 0 ? (
            <p className="text-default-500">No runners found</p>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {runners
                .filter(
                  (runner: any) =>
                    runner.project_id === project.id &&
                    runner.shared_runner === false,
                )
                .sort((a: any, b: any) => {
                  const aStatus = heartbeatStatus(a) ? 1 : 0;
                  const bStatus = heartbeatStatus(b) ? 1 : 0;

                  return bStatus - aStatus;
                })
                .map((runner: any) => (
                  <Card
                    key={runner.id}
                    isPressable
                    className="shadow-md"
                    onPress={() => {
                      setTargetRunner(runner);
                      showRunnerDrawer.onOpen();
                    }}
                  >
                    <CardBody className="p-5">
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="text-lg font-semibold">
                            {runner.name}
                          </h3>
                          <p className="text-small text-default-500 mt-1">
                            ID: {runner.id}
                          </p>
                        </div>
                        {canEditProject(user.id, project.members) && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <Icon
                                  className="text-lg"
                                  icon="hugeicons:more-vertical-circle-01"
                                />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu aria-label="Runner Actions">
                              <DropdownItem
                                key="edit"
                                startContent={
                                  <Icon
                                    icon="hugeicons:pencil-edit-02"
                                    width={18}
                                  />
                                }
                                onPress={() => {
                                  setTargetRunner(runner);
                                  editRunnerModal.onOpen();
                                }}
                              >
                                Edit Runner
                              </DropdownItem>
                              {runner.disabled ? (
                                <DropdownItem
                                  key="enable"
                                  startContent={
                                    <Icon icon="hugeicons:play" width={18} />
                                  }
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(false);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  Enable Runner
                                </DropdownItem>
                              ) : (
                                <DropdownItem
                                  key="disable"
                                  startContent={
                                    <Icon icon="hugeicons:pause" width={18} />
                                  }
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(true);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  Disable Runner
                                </DropdownItem>
                              )}
                              <DropdownItem
                                key="delete"
                                className="text-danger"
                                color="danger"
                                startContent={
                                  <Icon icon="hugeicons:delete-02" width={18} />
                                }
                                onPress={() => {
                                  setTargetRunner(runner);
                                  deleteRunnerModal.onOpen();
                                }}
                              >
                                Delete Runner
                              </DropdownItem>
                            </DropdownMenu>
                          </Dropdown>
                        )}
                      </div>

                      <Alert
                        className="mt-4"
                        color="danger"
                        description={"Reason: " + runner.disabled_reason}
                        isVisible={runner.disabled}
                        title="Runner Disabled"
                        variant="flat"
                      />

                      <div className="grid grid-cols-2 gap-4 mt-5">
                        <div className="flex items-center gap-2">
                          <Icon
                            className={`text-${heartbeatColor(runner)}`}
                            icon={"hugeicons:health"}
                            width={20}
                          />
                          <span className="text-sm">
                            Health:{" "}
                            <span
                              className={`font-medium capitalize text-${heartbeatColor(runner)}`}
                            >
                              {heartbeatStatus(runner)
                                ? "Healthy"
                                : "Unhealthy"}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon
                            className={`text-${heartbeatColor(runner)}`}
                            icon={"hugeicons:pulse-02"}
                            width={20}
                          />
                          <span className="text-sm">
                            Heartbeat:{" "}
                            <span className="font-medium">
                              <TimeAgo
                                className={`text-${heartbeatColor(runner)}`}
                                date={runner.last_heartbeat}
                              />
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon
                            className={`text-${runner.disabled ? "danger" : "success"}`}
                            icon={
                              runner.disabled
                                ? "hugeicons:toggle-off"
                                : "hugeicons:toggle-on"
                            }
                            width={20}
                          />
                          <span className="text-sm">
                            <span
                              className={`font-medium text-${runner.disabled ? "danger" : "success"}`}
                            >
                              {runner.disabled ? "Disabled" : "Enabled"}
                            </span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Icon
                            className={`text-${runner.executing_job ? "success" : "default-500"}`}
                            icon={"hugeicons:energy"}
                            width={20}
                          />
                          <span className="text-sm">
                            Status:{" "}
                            <span className="font-medium">
                              {runner.executing_job ? "Executing Job" : "Idle"}
                            </span>
                          </span>
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                ))}
            </div>
          )}
        </div>
      ))}

      <RunnerDetails disclosure={showRunnerDrawer} runner={targetRunner} />
      <ChangeRunnerStatusModal
        disclosure={changeRunnerStatusModal}
        runner={targetRunner}
        status={targetRunnerStatus}
      />
      <EditRunnerModal disclosure={editRunnerModal} runner={targetRunner} />
      <DeleteRunnerModal disclosure={deleteRunnerModal} runner={targetRunner} />
    </main>
  );
}
