"use client";

import { Icon } from "@iconify/react";
import {
  Alert,
  Button,
  Card,
  CardBody,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
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
  globalView,
}: {
  runners: any;
  projects: any;
  user: any;
  singleProject?: boolean;
  globalView?: boolean;
}) {
  const [targetRunner, setTargetRunner] = React.useState({} as any);
  const [targetRunnerStatus, setTargetRunnerStatus] = React.useState(false);
  const showRunnerDrawer = useDisclosure();
  const editRunnerModal = useDisclosure();
  const changeRunnerStatusModal = useDisclosure();
  const deleteRunnerModal = useDisclosure();

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
      {(singleProject && projects[0].shared_runners !== false) || globalView ? (
        <div>
          {runners.filter((runner: any) => runner.shared_runner === true)
            .length === 0 && (
            <p className="text-default-500">No shared runners found</p>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {runners.map(
              (runner: any) =>
                runner.shared_runner === true && (
                  <Card
                    key={runner.id}
                    isHoverable
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

                        {user.role === "admin" && (
                          <Dropdown>
                            <DropdownTrigger>
                              <Button isIconOnly size="sm" variant="light">
                                <Icon
                                  className="text-lg"
                                  icon="hugeicons:more-vertical-circle-01"
                                />
                              </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                              aria-label="Runner Actions"
                              variant="flat"
                            >
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
                                Delete
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
                ),
            )}
          </div>
        </div>
      ) : (
        <p className="text-default-500">
          Shared runners are disabled for this project.
        </p>
      )}

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
              <div>
                <p className="text-lg font-bold">{project.name}</p>
                <p className="text-tiny text-default-500">{project.id}</p>
              </div>
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
                    isHoverable
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
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold">
                              {runner.name}
                            </h3>
                            {!runner.auto_runner && (
                              <Chip
                                color="primary"
                                radius="sm"
                                size="sm"
                                variant="flat"
                              >
                                Persistent
                              </Chip>
                            )}
                          </div>
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
                            <DropdownMenu
                              aria-label="Runner Actions"
                              variant="flat"
                            >
                              {runner.disabled ? (
                                <DropdownItem
                                  key="enable"
                                  color="success"
                                  startContent={
                                    <Icon icon="hugeicons:play" width={18} />
                                  }
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(false);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  Enable
                                </DropdownItem>
                              ) : (
                                <DropdownItem
                                  key="disable"
                                  color="danger"
                                  startContent={
                                    <Icon icon="hugeicons:pause" width={18} />
                                  }
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(true);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  Disable
                                </DropdownItem>
                              )}
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
                                  setTargetRunner(runner);
                                  editRunnerModal.onOpen();
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
                                  setTargetRunner(runner);
                                  deleteRunnerModal.onOpen();
                                }}
                              >
                                Delete
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
