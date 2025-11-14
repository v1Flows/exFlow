"use client";

import { Icon } from "@iconify/react";
import {
  Alert,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  CardFooter,
  Chip,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import React from "react";
import TimeAgo from "react-timeago";

import DeleteRunnerModal from "@/components/modals/runner/delete";
import RunnerDetails from "@/components/modals/runner/details";
import canEditProject from "@/lib/functions/canEditProject";

import EditRunnerModal from "../modals/runner/edit";
import ChangeRunnerStatusModal from "../modals/runner/changeStatus";
import CreateRunnerModal from "../modals/runner/create";

export default function RunnersList({
  runners,
  projects,
  user,
  singleProject,
  globalView,
  settings,
}: {
  runners: any;
  projects: any;
  user: any;
  singleProject?: boolean;
  globalView?: boolean;
  settings?: any;
}) {
  const [targetRunner, setTargetRunner] = React.useState({} as any);
  const [targetRunnerStatus, setTargetRunnerStatus] = React.useState(false);
  const showRunnerDrawer = useDisclosure();
  const editRunnerModal = useDisclosure();
  const changeRunnerStatusModal = useDisclosure();
  const deleteRunnerModal = useDisclosure();
  const addRunnerModal = useDisclosure();

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
    <main className="flex flex-col gap-4">
      <Card className="bg-content1 shadow-md">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-start gap-1">
              <h2 className="text-2xl font-semibold">Shared</h2>
              <p className="text-sm text-default-500">
                Runners shared across projects
              </p>
            </div>
          </div>
          {(singleProject && projects[0].shared_runners !== false) ||
          globalView ? (
            <div>
              {runners.filter((runner: any) => runner.shared_runner === true)
                .length === 0 && (
                <p className="text-default-500">No shared runners found</p>
              )}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {runners.map(
                  (runner: any) =>
                    runner.shared_runner === true && (
                      <Card
                        key={runner.id}
                        fullWidth
                        isPressable
                        className="bg-content2 hover:bg-content1 transition-colors"
                        onPress={() => {
                          setTargetRunner(runner);
                          showRunnerDrawer.onOpen();
                        }}
                      >
                        <CardBody className="p-5">
                          <h3 className="text-lg font-semibold">
                            {runner.name}
                          </h3>

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
                                className={`text-${runner.executing_job ? "primary" : "default-500"}`}
                                icon={"hugeicons:energy"}
                                width={20}
                              />
                              <span className="text-sm">
                                Status:{" "}
                                <span className="font-medium">
                                  {runner.executing_job ? (
                                    <span className="text-primary font-semibold">
                                      Executing Flow
                                    </span>
                                  ) : (
                                    <span>Idle</span>
                                  )}
                                </span>
                              </span>
                            </div>
                          </div>
                        </CardBody>
                        <CardFooter className="flex flex-cols items-center justify-between">
                          <p className="text-tiny text-default-500">
                            {runner.id}
                          </p>
                          <ButtonGroup
                            isDisabled={user.role !== "admin"}
                            size="sm"
                          >
                            <Tooltip content="Delete">
                              <Button
                                isIconOnly
                                color="danger"
                                variant="flat"
                                onPress={() => {
                                  setTargetRunner(runner);
                                  deleteRunnerModal.onOpen();
                                }}
                              >
                                <Icon icon="hugeicons:delete-02" width={18} />
                              </Button>
                            </Tooltip>
                          </ButtonGroup>
                        </CardFooter>
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
        </CardBody>
      </Card>

      <Card className="bg-content1 shadow-md">
        <CardBody>
          <div className="flex justify-between items-center mb-4">
            <div className="flex flex-col items-start gap-1">
              <h2 className="text-2xl font-semibold">Project Bound</h2>
              <p className="text-sm text-default-500">
                Runners bound to projects
              </p>
            </div>
            {singleProject && (
              <Button
                color="primary"
                isDisabled={
                  (!canEditProject(user.id, projects[0].members) ||
                    !settings.create_runners ||
                    projects[0].disabled) &&
                  user.role !== "admin"
                }
                size="sm"
                startContent={<Icon icon="hugeicons:plus-sign" width={18} />}
                variant="solid"
                onPress={() => addRunnerModal.onOpen()}
              >
                Add Runner
              </Button>
            )}
          </div>

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
                      project.icon
                        ? project.icon
                        : "solar:question-square-outline"
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
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
                        fullWidth
                        isPressable
                        className="bg-content2 hover:bg-content1 transition-colors"
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
                            </div>
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
                                  {runner.executing_job
                                    ? "Executing Job"
                                    : "Idle"}
                                </span>
                              </span>
                            </div>
                          </div>
                        </CardBody>
                        <CardFooter className="flex flex-cols items-center justify-between">
                          <p className="text-tiny text-default-500">
                            {runner.id}
                          </p>
                          <ButtonGroup
                            isDisabled={
                              !canEditProject(user.id, project.members)
                            }
                            size="sm"
                          >
                            {runner.disabled ? (
                              <Tooltip content="Enable">
                                <Button
                                  isIconOnly
                                  variant="flat"
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(false);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  <Icon icon="hugeicons:play" width={18} />
                                </Button>
                              </Tooltip>
                            ) : (
                              <Tooltip content="Disable">
                                <Button
                                  isIconOnly
                                  variant="flat"
                                  onPress={() => {
                                    setTargetRunner(runner);
                                    setTargetRunnerStatus(true);
                                    changeRunnerStatusModal.onOpen();
                                  }}
                                >
                                  <Icon icon="hugeicons:pause" width={18} />
                                </Button>
                              </Tooltip>
                            )}
                            <Tooltip content="Edit">
                              <Button
                                isIconOnly
                                variant="flat"
                                onPress={() => {
                                  setTargetRunner(runner);
                                  editRunnerModal.onOpen();
                                }}
                              >
                                <Icon
                                  icon="hugeicons:pencil-edit-02"
                                  width={18}
                                />
                              </Button>
                            </Tooltip>
                            <Tooltip content="Delete">
                              <Button
                                isIconOnly
                                color="danger"
                                variant="flat"
                                onPress={() => {
                                  setTargetRunner(runner);
                                  deleteRunnerModal.onOpen();
                                }}
                              >
                                <Icon icon="hugeicons:delete-02" width={18} />
                              </Button>
                            </Tooltip>
                          </ButtonGroup>
                        </CardFooter>
                      </Card>
                    ))}
                </div>
              )}
            </div>
          ))}
        </CardBody>
      </Card>

      <RunnerDetails disclosure={showRunnerDrawer} runner={targetRunner} />
      <ChangeRunnerStatusModal
        disclosure={changeRunnerStatusModal}
        runner={targetRunner}
        status={targetRunnerStatus}
      />
      <EditRunnerModal disclosure={editRunnerModal} runner={targetRunner} />
      <DeleteRunnerModal disclosure={deleteRunnerModal} runner={targetRunner} />
      <CreateRunnerModal
        disclosure={addRunnerModal}
        project={projects[0]}
        shared_runner={false}
      />
    </main>
  );
}
