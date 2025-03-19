"use client";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardFooter,
  CardHeader,
  Chip,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownSection,
  DropdownTrigger,
  Spacer,
  Spinner,
  useDisclosure,
} from "@heroui/react";
import React from "react";
import TimeAgo from "react-timeago";

import DeleteRunnerModal from "@/components/modals/runner/delete";
import RunnerDetails from "@/components/modals/runner/details";

export default function RunnersList({ runners, projects }: any) {
  const [targetRunner, setTargetRunner] = React.useState({} as any);
  const showRunnerDrawer = useDisclosure();
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
      <p className="text-lg font-bold">Project Bound</p>
      <Spacer y={2} />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {runners
          .filter((runner: any) => runner.shared_runner === false)
          .sort((a: any, b: any) => {
            const aStatus = heartbeatStatus(a) ? 1 : 0;
            const bStatus = heartbeatStatus(b) ? 1 : 0;

            return bStatus - aStatus;
          })
          .map((runner: any) => (
            <Card
              key={runner.id}
              fullWidth
              isHoverable
              isPressable
              onPress={() => {
                setTargetRunner(runner);
                showRunnerDrawer.onOpen();
              }}
            >
              <CardHeader className="flex flex-cols items-center justify-between">
                <Chip
                  className="text-sm text-default-500"
                  color="secondary"
                  radius="sm"
                  variant="dot"
                >
                  {projects.find(
                    (project: any) => project.id === runner.project_id,
                  )?.name || "Unknown"}
                </Chip>
                <div className="relative flex items-center justify-end gap-2">
                  <Chip
                    color={heartbeatColor(runner)}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {heartbeatStatus(runner) ? "Healthy" : "Unhealthy"}
                  </Chip>
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
              <CardBody className="flex flex-col">
                {runner.auto_runner ? (
                  <p className="text-md font-bold">Auto Runner</p>
                ) : (
                  <p className="text-md font-bold">{runner.name}</p>
                )}
                {runner.disabled && (
                  <p className="mb-4 text-center text-lg font-bold text-danger">
                    {runner.disabled_reason}
                  </p>
                )}
                {!runner.registered && (
                  <div className="flex flex-wrap items-center justify-center text-center">
                    <Spinner label="Waiting for connection..." size="md" />
                  </div>
                )}
              </CardBody>
              <CardFooter className="flex flex-cols items-center justify-between">
                <div className="flex flex-wrap items-start gap-2">
                  <Chip
                    color={runner.disabled ? "danger" : "success"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {runner.disabled ? "Disabled" : "Enabled"}
                  </Chip>
                  <Chip
                    color={runner.registered ? "success" : "warning"}
                    radius="sm"
                    size="sm"
                    variant="flat"
                  >
                    {runner.registered ? "Registered" : "Unregistered"}
                  </Chip>
                </div>
                <div className="flex items-center gap-1">
                  <Icon
                    className="text-default-500"
                    icon="hugeicons:activity-03"
                    width={22}
                  />
                  <TimeAgo
                    className={`text-sm text-${heartbeatColor(runner)}`}
                    date={runner.last_heartbeat}
                  />
                </div>
              </CardFooter>
            </Card>
          ))}
      </div>

      <Spacer y={4} />
      <p className="text-lg font-bold">Shared</p>
      <Spacer y={2} />
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
      <RunnerDetails disclosure={showRunnerDrawer} runner={targetRunner} />
      <DeleteRunnerModal disclosure={deleteRunnerModal} runner={targetRunner} />
    </main>
  );
}
