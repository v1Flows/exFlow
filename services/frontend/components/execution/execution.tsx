"use client";

import { Icon } from "@iconify/react";
import {
  addToast,
  Badge,
  Button,
  Chip,
  CircularProgress,
  Divider,
  Progress,
  ScrollShadow,
  Snippet,
  Spacer,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useMemo, useState } from "react";

import Reloader from "@/components/reloader/Reloader";
import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
import GetExecutionSteps from "@/lib/fetch/executions/steps";
import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

import AdminExecutionActions from "./adminExecutionActions";
import AdminStepActions from "./adminStepActions";
import ExecutionDetails from "./details";

export function Execution({ flow, execution, runners, userDetails }: any) {
  const router = useRouter();

  const [steps, setSteps] = useState([] as any);

  React.useEffect(() => {
    GetExecutionSteps(execution.id).then((steps) => {
      if (steps.success) {
        setSteps(steps.data.steps);
      } else {
        if ("error" in steps) {
          addToast({
            title: "Execution",
            description: steps.error,
            color: "danger",
            variant: "flat",
          });
        }
      }
    });
  }, [execution]);

  function lineColor(line: any) {
    // if line color is not set, return default
    if (!line.color) {
      return "default-600";
    }

    if (line.color === "info") {
      return "primary";
    } else {
      return line.color;
    }
  }

  function getTotalDurationSeconds() {
    let calFinished = new Date().toISOString();

    if (execution.finished_at !== "0001-01-01T00:00:00Z") {
      calFinished = execution.finished_at;
    }
    const ms =
      new Date(calFinished).getTime() -
      new Date(execution.executed_at).getTime();
    const sec = Math.floor(ms / 1000);

    return sec;
  }

  function getDurationSeconds(step: any) {
    if (step.status === "pending") {
      return 0;
    }
    if (step.finished_at === "0001-01-01T00:00:00Z") {
      step.finished_at = new Date().toISOString();
    }
    const ms =
      new Date(step.finished_at).getTime() -
      new Date(step.started_at).getTime();
    const sec = Math.floor(ms / 1000);

    return sec;
  }

  function getDuration(step: any) {
    if (step.status === "pending") {
      return "-";
    }
    if (step.finished_at === "0001-01-01T00:00:00Z") {
      step.finished_at = new Date().toISOString();
    }
    const ms =
      new Date(step.finished_at).getTime() -
      new Date(step.started_at).getTime();
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

  async function interactStep(step: any, status: boolean) {
    if (status) {
      step.interaction_approved = true;
      step.interaction_rejected = false;
    } else {
      step.interaction_approved = false;
      step.interaction_rejected = true;
    }

    step.interacted = true;
    step.messages = [
      `Step interacted by ${userDetails.username} (${userDetails.id})`,
    ];
    step.interaced_by = userDetails.id;
    step.interacted_at = new Date().toISOString();

    const res = (await InteractExecutionStep(
      execution.id,
      step.id,
      step,
    )) as any;

    if (!res.success) {
      addToast({
        title: "Interaction",
        description: res.error,
        color: "danger",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Interaction",
        description: "Step interaction successful",
        color: "success",
        variant: "flat",
      });
      router.refresh();
    }
  }

  const renderCell = React.useCallback(
    (step: any, columnKey: any) => {
      const cellValue = step[columnKey];

      switch (columnKey) {
        case "name":
          return (
            <div className="flex flex-col items-center gap-2">
              {steps.find((s: any) => s.parent_id === step.action.id) ? (
                <Badge
                  color="primary"
                  content={
                    <Icon
                      icon="solar:double-alt-arrow-down-linear"
                      width={18}
                    />
                  }
                  placement="bottom-right"
                  shape="circle"
                  size="md"
                >
                  <Button
                    isIconOnly
                    variant="light"
                    onPress={() => {
                      // set is_hidden to false for all child steps
                      const newSteps = steps.map((s: any) => {
                        if (s.parent_id === step.action.id) {
                          s.is_hidden = !s.is_hidden;
                        }

                        return s;
                      });

                      setSteps([...newSteps]);
                    }}
                  >
                    <Icon
                      icon={`${step.action.icon || "solar:question-square-line-duotone"}`}
                      width={24}
                    />
                  </Button>
                </Badge>
              ) : step.parent_id !== "" ? (
                <Badge
                  color="primary"
                  content=""
                  placement="bottom-right"
                  shape="circle"
                >
                  <Icon
                    icon={`${step.action.icon || "solar:question-square-line-duotone"}`}
                    width={24}
                  />
                </Badge>
              ) : (
                <Icon
                  icon={`${step.action.icon || "solar:question-square-line-duotone"}`}
                  width={24}
                />
              )}
              <p className="text-md font-medium">
                {flow.actions.find((a: any) => a.id === step.action.id)
                  ?.custom_name
                  ? flow.actions.find((a: any) => a.id === step.action.id)
                      .custom_name
                  : step.action.name}
              </p>
            </div>
          );
        case "message":
          return (
            <>
              {step.action.status === "pending" ? (
                <p>Step not started yet</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <ScrollShadow className="flex flex-col max-h-[600px] w-full justify-end pb-6">
                    <Snippet
                      hideCopyButton
                      hideSymbol
                      className="w-full pb-2"
                      radius="sm"
                    >
                      {step.messages.map((data: any) =>
                        data.lines.map((line: any, index: any) => (
                          <div
                            key={index}
                            className={`container flex-cols font-semibold flex items-center gap-1 text-${lineColor(line)}`}
                          >
                            <p>{line.content}</p>
                          </div>
                        )),
                      )}
                    </Snippet>
                  </ScrollShadow>

                  {step.status === "interactionWaiting" && !step.interacted && (
                    <div className="flex-cols flex items-center gap-4">
                      <Button
                        fullWidth
                        color="success"
                        startContent={
                          <Icon
                            icon="hugeicons:checkmark-badge-01"
                            width={18}
                          />
                        }
                        variant="flat"
                        onPress={() => {
                          interactStep(step, true);
                        }}
                      >
                        Approve & Continue
                      </Button>
                      <Button
                        fullWidth
                        color="danger"
                        startContent={
                          <Icon icon="hugeicons:cancel-01" width={18} />
                        }
                        variant="flat"
                        onPress={() => {
                          interactStep(step, false);
                        }}
                      >
                        Reject & Stop
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </>
          );
        case "duration":
          return (
            <div className="flex flex-col items-center justify-center">
              <Tooltip
                content={
                  <div className="grid grid-cols-2 p-1">
                    <div className="text-small text-default-500">
                      Created at
                    </div>
                    <div className="text-small">
                      {new Date(step.created_at).toLocaleString()}
                    </div>
                    {step.started_at !== "0001-01-01T00:00:00Z" && (
                      <>
                        <Divider className="col-span-2 my-2" />
                        <div className="text-small text-default-500">
                          Started at
                        </div>
                        <div className="text-small">
                          {new Date(step.started_at).toLocaleString()}
                        </div>
                      </>
                    )}
                    {step.finished_at !== "0001-01-01T00:00:00Z" && (
                      <>
                        <Divider className="col-span-2 my-2" />
                        <div className="text-small text-default-500">
                          Finished at
                        </div>
                        <div className="text-small">
                          {new Date(step.finished_at).toLocaleString()}
                        </div>
                      </>
                    )}
                  </div>
                }
              >
                <div className="flex flex-col items-center gap-1">
                  <CircularProgress
                    showValueLabel
                    aria-label="StepDuration"
                    maxValue={getTotalDurationSeconds() || 1}
                    size="lg"
                    value={getDurationSeconds(step) || 0}
                  />
                  <p className="text-xs">{getDuration(step)}</p>
                </div>
              </Tooltip>
            </div>
          );
        case "info":
          return (
            <div className="flex items-center justify-center">
              <Tooltip
                content={
                  <div className="flex flex-col items-start justify-between p-1">
                    <div className="flex-cols flex gap-4">
                      <div className="flex items-center gap-2">
                        <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-foreground">
                          <Icon icon={step.action.icon} width={20} />
                        </div>
                        <div>
                          <p className="font-bold">{step.action.name}</p>
                          <p className="text-sm text-default-500">
                            {step.action.id ===
                            "00000000-0000-0000-0000-000000000000"
                              ? "N/A"
                              : step.action.id}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start justify-self-end gap-2">
                        <Chip
                          color={executionStatusColor(step)}
                          radius="sm"
                          size="sm"
                          variant="flat"
                        >
                          {executionStatusName(step)}
                        </Chip>
                        {step.encrypted && (
                          <Tooltip content="Encrypted">
                            <Chip
                              color="success"
                              radius="sm"
                              size="sm"
                              variant="flat"
                            >
                              <Icon
                                className="text-success"
                                icon="hugeicons:square-lock-password"
                                width={16}
                              />
                            </Chip>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <Divider className="m-2" />
                    <div className="flex flex-wrap gap-2">
                      <Chip
                        color="primary"
                        radius="sm"
                        size="sm"
                        variant="flat"
                      >
                        Runner:{" "}
                        {runners.find((r: any) => r.id === step.runner_id)
                          ?.name || "N/A"}
                      </Chip>
                      <Chip radius="sm" size="sm" variant="flat">
                        Step ID: {step.id}
                      </Chip>
                    </div>
                  </div>
                }
              >
                <Icon
                  className="text-default-500"
                  icon="solar:info-circle-linear"
                  width={20}
                />
              </Tooltip>
            </div>
          );
        case "status":
          return <div>{executionStatusWrapper(step)}</div>;
        case "admin_actions":
          return (
            <div className="flex flex-col items-center justify-center">
              {userDetails.role === "admin" && (
                <AdminStepActions execution={execution} step={step} />
              )}
            </div>
          );
        default:
          return cellValue;
      }
    },
    [steps],
  );

  const bottomContent = useMemo(() => {
    return (
      <div className="mt flex w-full items-center justify-center">
        {(execution.status === "running" ||
          execution.status === "pending" ||
          execution.status === "paused" ||
          execution.status === "scheduled" ||
          execution.status === "interactionWaiting") && (
          <>
            <Progress
              isIndeterminate
              aria-label="Loading..."
              className="max-w-md"
              label="Waiting for new data..."
              size="sm"
            />
          </>
        )}
      </div>
    );
  }, [execution]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between">
        <Button
          color="default"
          variant="bordered"
          onPress={() => router.back()}
        >
          <Icon icon="hugeicons:link-backward" width={20} />
          Back
        </Button>
        <div className="flex-wrap mt-2 flex items-center gap-4 lg:mt-0 lg:justify-end">
          {userDetails.role === "admin" && (
            <AdminExecutionActions execution={execution} />
          )}

          {(execution.status === "running" ||
            execution.status === "pending" ||
            execution.status === "paused" ||
            execution.status === "scheduled" ||
            execution.status === "interactionWaiting") && (
            <div>
              <Reloader circle />
            </div>
          )}
        </div>
      </div>
      <Divider className="my-4" />
      <ExecutionDetails execution={execution} runners={runners} steps={steps} />
      <Spacer y={4} />
      {/* Tabelle */}
      <Table
        aria-label="Example static collection table"
        bottomContent={bottomContent}
      >
        <TableHeader>
          <TableColumn key="status" align="start">
            Status
          </TableColumn>
          <TableColumn key="name" align="center">
            Step
          </TableColumn>
          <TableColumn key="message" align="center">
            Message
          </TableColumn>
          <TableColumn key="duration" align="center">
            Duration
          </TableColumn>
          <TableColumn key="info" align="center">
            Info
          </TableColumn>
          <TableColumn
            key="admin_actions"
            align="center"
            hideHeader={userDetails.role !== "admin"}
          >
            Admin Actions
          </TableColumn>
        </TableHeader>
        <TableBody items={steps.filter((s: any) => s.is_hidden == false)}>
          {(item: any) =>
            !item.pending ? (
              <TableRow
                key={item.id}
                className={item.parent_id !== "" ? "bg-default-100" : ""}
              >
                {(columnKey: any) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            ) : (
              <TableRow key={item.id} className="text-default-400">
                {(columnKey: any) => (
                  <TableCell>{renderCell(item, columnKey)}</TableCell>
                )}
              </TableRow>
            )
          }
        </TableBody>
      </Table>
    </>
  );
}
