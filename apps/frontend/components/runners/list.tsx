"use client";
import { Icon } from "@iconify/react";
import {
  Button,
  ButtonGroup,
  Card,
  Chip,
  Tooltip,
  useOverlayState,
} from "@heroui/react";
import React from "react";
import TimeAgo from "react-timeago";
import { motion } from "framer-motion";
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
  const showRunnerDrawer = useOverlayState();
  const editRunnerModal = useOverlayState();
  const changeRunnerStatusModal = useOverlayState();
  const deleteRunnerModal = useOverlayState();
  const addRunnerModal = useOverlayState();
  function heartbeatColor(runner: any) {
    // secondsAgo is positive: how many seconds since the last heartbeat
    const secondsAgo =
      (Date.now() - new Date(runner.last_heartbeat).getTime()) / 1000;
    if (secondsAgo < 30) {
      return "success";
    } else if (secondsAgo < 60) {
      return "warning";
    } else {
      return "danger";
    }
  }
  function heartbeatStatus(runner: any) {
    const secondsAgo =
      (Date.now() - new Date(runner.last_heartbeat).getTime()) / 1000;
    return secondsAgo < 30;
  }
  return (
    <motion.div
      animate="visible"
      className="flex flex-col gap-4"
      initial="hidden"
      variants={{
        visible: { transition: { staggerChildren: 0.1 } },
      }}
    >
      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Content>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-semibold">Shared</h2>
                <p className="text-sm text-muted">
                  Runners shared across projects
                </p>
              </div>
            </div>
            {(singleProject && projects[0].shared_runners !== false) ||
            globalView ? (
              <div>
                {runners.filter((runner: any) => runner.shared_runner === true)
                  .length === 0 && (
                  <p className="text-muted">No shared runners found</p>
                )}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
                  {runners.map(
                    (runner: any) =>
                      runner.shared_runner === true && (
                        <Button
                          key={runner.id}
                          className="h-auto w-full justify-start p-0 text-left"
                          variant="tertiary"
                          onPress={() => {
                            setTargetRunner(runner);
                            showRunnerDrawer.open();
                          }}
                        >
                          <Card
                            key={runner.id}
                            className="bg-surface/60 backdrop-blur-md border border-default shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group"
                          >
                            <Card.Content className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg bg-${heartbeatColor(runner)}/10 text-${heartbeatColor(runner)}`}
                                  >
                                    <Icon
                                      icon="hugeicons:ai-brain-04"
                                      width={24}
                                    />
                                  </div>
                                  <div>
                                    <h3 className="text-md font-semibold text-foreground">
                                      {runner.name}
                                    </h3>
                                    <p className="text-xs text-muted font-mono">
                                      {runner.id.substring(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                                <Chip
                                  color={
                                    heartbeatStatus(runner)
                                      ? "success"
                                      : "danger"
                                  }
                                  size="sm"
                                  variant="soft"
                                >
                                  <Chip.Label>
                                    {heartbeatStatus(runner)
                                      ? "Online"
                                      : "Offline"}
                                  </Chip.Label>
                                </Chip>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1 p-2 rounded-lg bg-default/50">
                                  <span className="text-xs text-muted">
                                    Heartbeat
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      className="text-muted"
                                      icon="hugeicons:pulse-02"
                                      width={14}
                                    />
                                    <span className="text-sm font-medium">
                                      <TimeAgo date={runner.last_heartbeat} />
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 p-2 rounded-lg bg-default/50">
                                  <span className="text-xs text-muted">
                                    Status
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      className={
                                        runner.executing_job
                                          ? "text-accent"
                                          : "text-muted"
                                      }
                                      icon="hugeicons:energy"
                                      width={14}
                                    />
                                    <span className="text-sm font-medium">
                                      {runner.executing_job ? "Busy" : "Idle"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {runner.disabled && (
                                <div className="mt-3 p-2 rounded-lg bg-danger/50 border border-danger">
                                  <p className="text-xs text-danger">
                                    Disabled: {runner.disabled_reason}
                                  </p>
                                </div>
                              )}
                            </Card.Content>
                            <Card.Footer className="px-4 pb-4 pt-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <ButtonGroup
                                isDisabled={user.role !== "admin"}
                                size="sm"
                              >
                                <Tooltip>
                                  <Tooltip.Trigger>
                                    <Button
                                      variant="danger"
                                      onPress={() => {
                                        setTargetRunner(runner);
                                        deleteRunnerModal.open();
                                      }}
                                      className="aspect-square p-0"
                                    >
                                      <Icon
                                        icon="hugeicons:delete-02"
                                        width={18}
                                      />
                                    </Button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>{"Delete"}</Tooltip.Content>
                                </Tooltip>
                              </ButtonGroup>
                            </Card.Footer>
                          </Card>
                        </Button>
                      ),
                  )}
                </div>
              </div>
            ) : (
              <p className="text-muted">
                Shared runners are disabled for this project.
              </p>
            )}
          </Card.Content>
        </Card>
      </motion.div>

      <motion.div
        variants={{
          hidden: { y: 20, opacity: 0 },
          visible: { y: 0, opacity: 1 },
        }}
      >
        <Card className="bg-surface/60 backdrop-blur-md border border-default shadow-sm">
          <Card.Content>
            <div className="flex justify-between items-center mb-4">
              <div className="flex flex-col items-start gap-1">
                <h2 className="text-2xl font-semibold">Project Bound</h2>
                <p className="text-sm text-muted">Runners bound to projects</p>
              </div>
              {singleProject && (
                <Button
                  isDisabled={
                    (!canEditProject(user.id, projects[0].members) ||
                      !settings.create_runners ||
                      projects[0].disabled) &&
                    user.role !== "admin"
                  }
                  size="sm"
                  variant="primary"
                  onPress={() => addRunnerModal.open()}
                >
                  {<Icon icon="hugeicons:plus-sign" width={18} />}
                  Add Runner
                </Button>
              )}
            </div>

            {projects.length === 0 && (
              <p className="text-muted">
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
                      <p className="text-xs text-muted">{project.id}</p>
                    </div>
                  </div>
                )}
                {runners.filter(
                  (runner: any) => runner.project_id === project.id,
                ).length === 0 ? (
                  <p className="text-muted">No runners found</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
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
                        <Button
                          key={runner.id}
                          className="h-auto w-full justify-start p-0 text-left"
                          variant="tertiary"
                          onPress={() => {
                            setTargetRunner(runner);
                            showRunnerDrawer.open();
                          }}
                        >
                          <Card
                            key={runner.id}
                            className="bg-surface/60 backdrop-blur-md border border-default shadow-sm hover:shadow-md hover:scale-[1.01] transition-all duration-300 group"
                          >
                            <Card.Content className="p-4">
                              <div className="flex justify-between items-start mb-4">
                                <div className="flex items-center gap-3">
                                  <div
                                    className={`p-2 rounded-lg bg-${heartbeatColor(runner)}/10 text-${heartbeatColor(runner)}`}
                                  >
                                    <Icon
                                      icon="hugeicons:ai-brain-04"
                                      width={24}
                                    />
                                  </div>
                                  <div>
                                    <div className="flex items-center gap-2">
                                      <h3 className="text-md font-semibold text-foreground">
                                        {runner.name}
                                      </h3>
                                      {!runner.auto_runner && (
                                        <Chip
                                          className="h-5 text-[10px] px-1"
                                          color="accent"
                                          size="sm"
                                          variant="soft"
                                        >
                                          <Chip.Label>Persistent</Chip.Label>
                                        </Chip>
                                      )}
                                    </div>
                                    <p className="text-xs text-muted font-mono">
                                      {runner.id.substring(0, 8)}...
                                    </p>
                                  </div>
                                </div>
                                <Chip
                                  color={
                                    heartbeatStatus(runner)
                                      ? "success"
                                      : "danger"
                                  }
                                  size="sm"
                                  variant="soft"
                                >
                                  <Chip.Label>
                                    {heartbeatStatus(runner)
                                      ? "Online"
                                      : "Offline"}
                                  </Chip.Label>
                                </Chip>
                              </div>

                              <div className="grid grid-cols-2 gap-3">
                                <div className="flex flex-col gap-1 p-2 rounded-lg bg-default/50">
                                  <span className="text-xs text-muted">
                                    Heartbeat
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      className="text-muted"
                                      icon="hugeicons:pulse-02"
                                      width={14}
                                    />
                                    <span className="text-sm font-medium">
                                      <TimeAgo date={runner.last_heartbeat} />
                                    </span>
                                  </div>
                                </div>
                                <div className="flex flex-col gap-1 p-2 rounded-lg bg-default/50">
                                  <span className="text-xs text-muted">
                                    Status
                                  </span>
                                  <div className="flex items-center gap-1">
                                    <Icon
                                      className={
                                        runner.executing_job
                                          ? "text-accent"
                                          : "text-muted"
                                      }
                                      icon="hugeicons:energy"
                                      width={14}
                                    />
                                    <span className="text-sm font-medium">
                                      {runner.executing_job ? "Busy" : "Idle"}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {runner.disabled && (
                                <div className="mt-3 p-2 rounded-lg bg-danger/50 border border-danger">
                                  <p className="text-xs text-danger">
                                    Disabled: {runner.disabled_reason}
                                  </p>
                                </div>
                              )}
                            </Card.Content>
                            <Card.Footer className="px-4 pb-4 pt-0 flex justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                              <ButtonGroup
                                isDisabled={
                                  !canEditProject(user.id, project.members)
                                }
                                size="sm"
                              >
                                {runner.disabled ? (
                                  <Tooltip>
                                    <Tooltip.Trigger>
                                      <Button
                                        variant="ghost"
                                        onPress={() => {
                                          setTargetRunner(runner);
                                          setTargetRunnerStatus(false);
                                          changeRunnerStatusModal.open();
                                        }}
                                        className="aspect-square p-0"
                                      >
                                        <Icon
                                          icon="hugeicons:play"
                                          width={18}
                                        />
                                      </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                      {"Enable"}
                                    </Tooltip.Content>
                                  </Tooltip>
                                ) : (
                                  <Tooltip>
                                    <Tooltip.Trigger>
                                      <Button
                                        variant="ghost"
                                        onPress={() => {
                                          setTargetRunner(runner);
                                          setTargetRunnerStatus(true);
                                          changeRunnerStatusModal.open();
                                        }}
                                        className="aspect-square p-0"
                                      >
                                        <Icon
                                          icon="hugeicons:pause"
                                          width={18}
                                        />
                                      </Button>
                                    </Tooltip.Trigger>
                                    <Tooltip.Content>
                                      {"Disable"}
                                    </Tooltip.Content>
                                  </Tooltip>
                                )}
                                <Tooltip>
                                  <Tooltip.Trigger>
                                    <Button
                                      variant="ghost"
                                      onPress={() => {
                                        setTargetRunner(runner);
                                        editRunnerModal.open();
                                      }}
                                      className="aspect-square p-0"
                                    >
                                      <Icon
                                        icon="hugeicons:pencil-edit-02"
                                        width={18}
                                      />
                                    </Button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>{"Edit"}</Tooltip.Content>
                                </Tooltip>
                                <Tooltip>
                                  <Tooltip.Trigger>
                                    <Button
                                      variant="danger"
                                      onPress={() => {
                                        setTargetRunner(runner);
                                        deleteRunnerModal.open();
                                      }}
                                      className="aspect-square p-0"
                                    >
                                      <Icon
                                        icon="hugeicons:delete-02"
                                        width={18}
                                      />
                                    </Button>
                                  </Tooltip.Trigger>
                                  <Tooltip.Content>{"Delete"}</Tooltip.Content>
                                </Tooltip>
                              </ButtonGroup>
                            </Card.Footer>
                          </Card>
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            ))}
          </Card.Content>
        </Card>
      </motion.div>

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
    </motion.div>
  );
}
