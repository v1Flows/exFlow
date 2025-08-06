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
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useMemo, useRef, useState } from "react";

import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

import AdminStepActions from "./adminStepActions";

export function ExecutionStepsTable({
  flow,
  execution,
  steps,
  runners,
  userDetails,
}: any) {
  const router = useRouter();

  const [parSteps, setParSteps] = useState([] as any);
  const messagesContainerRef = useRef<{ [key: string]: any }>({});
  const stepRowRef = useRef<{ [key: string]: any }>({});
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<{
    [key: string]: boolean;
  }>({});
  const [pageAutoScrollEnabled, setPageAutoScrollEnabled] = useState(true);
  const lastScrollTime = useRef(0);
  const programmaticScroll = useRef(false);

  useEffect(() => {
    setParSteps(steps);

    // Initialize auto-scroll as enabled for new steps
    const newAutoScrollState: { [key: string]: boolean } = {};

    steps.forEach((step: any) => {
      if (autoScrollEnabled[step.id] === undefined) {
        newAutoScrollState[step.id] = true;
      } else {
        newAutoScrollState[step.id] = autoScrollEnabled[step.id];
      }
    });
    setAutoScrollEnabled(newAutoScrollState);
  }, [steps]);

  // Handle page scroll events to detect user scrolling
  useEffect(() => {
    const handlePageScroll = () => {
      const currentTime = Date.now();

      // If this scroll event happened shortly after programmatic scroll, ignore it
      if (
        programmaticScroll.current &&
        currentTime - lastScrollTime.current < 1000
      ) {
        return;
      }

      // User is manually scrolling, disable page auto-scroll
      if (pageAutoScrollEnabled) {
        setPageAutoScrollEnabled(false);
      }
    };

    if (typeof window !== "undefined") {
      globalThis.window.addEventListener("scroll", handlePageScroll, {
        passive: true,
      });
    }

    return () => {
      if (typeof window !== "undefined") {
        globalThis.window.removeEventListener("scroll", handlePageScroll);
      }
    };
  }, [pageAutoScrollEnabled]);

  // Auto-scroll to bottom of messages for each step when content changes
  useEffect(() => {
    // Use a timeout to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(() => {
      // Find the currently running step
      const runningStep = steps.find(
        (step: any) =>
          step.status === "running" ||
          step.status === "interactionWaiting" ||
          (step.status === "pending" &&
            steps.filter((s: any) => s.status === "running").length === 0),
      );

      steps.forEach((step: any) => {
        if (autoScrollEnabled[step.id]) {
          const messagesContainer = messagesContainerRef.current[step.id];

          if (messagesContainer) {
            // Scroll the container to bottom instead of using scrollIntoView
            // since scrollIntoView can interfere with page scrolling when multiple containers are visible
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      });

      // Scroll page to the currently running step only if page auto-scroll is enabled
      if (runningStep && pageAutoScrollEnabled) {
        const stepRow = stepRowRef.current[runningStep.id];

        if (stepRow) {
          // Mark this as programmatic scroll
          programmaticScroll.current = true;
          lastScrollTime.current = Date.now();

          stepRow.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });

          // Reset programmatic scroll flag after animation
          setTimeout(() => {
            programmaticScroll.current = false;
          }, 1000);
        }
      }
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [steps, autoScrollEnabled, pageAutoScrollEnabled]);

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

  function handleScrollToBottom(stepId: string) {
    const messagesContainer = messagesContainerRef.current[stepId];

    if (messagesContainer) {
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
      setAutoScrollEnabled((prev) => ({ ...prev, [stepId]: true }));
    }
  }

  function handleScrollToActiveStep() {
    // Find the currently running step
    const runningStep = steps.find(
      (step: any) =>
        step.status === "running" ||
        step.status === "interactionWaiting" ||
        (step.status === "pending" &&
          steps.filter((s: any) => s.status === "running").length === 0),
    );

    if (runningStep) {
      const stepRow = stepRowRef.current[runningStep.id];

      if (stepRow) {
        // Mark this as programmatic scroll
        programmaticScroll.current = true;
        lastScrollTime.current = Date.now();

        stepRow.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        // Re-enable page auto-scroll
        setPageAutoScrollEnabled(true);

        // Reset programmatic scroll flag after animation
        setTimeout(() => {
          programmaticScroll.current = false;
        }, 1000);
      }
    }
  }

  function handleScroll(stepId: string, event: any) {
    // Prevent event bubbling to avoid interfering with page scroll
    event.stopPropagation();

    const container = event.currentTarget;

    // Only handle scroll if this is actually the messages container
    if (!container || !container.scrollHeight) return;

    const isNearBottom =
      container.scrollHeight - container.scrollTop - container.clientHeight <
      50;

    // Re-enable auto-scroll if user scrolls near the bottom
    if (isNearBottom && !autoScrollEnabled[stepId]) {
      setAutoScrollEnabled((prev) => ({ ...prev, [stepId]: true }));
    } else if (!isNearBottom && autoScrollEnabled[stepId]) {
      // Disable auto-scroll if user scrolls away from bottom
      setAutoScrollEnabled((prev) => ({ ...prev, [stepId]: false }));
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
      {
        Title: "Interaction",
        Lines: [
          {
            Content: `Step interacted by ${userDetails.username} (${userDetails.id})`,
            Timestamp: new Date().toISOString(),
          },
        ],
      },
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
              {parSteps.find((s: any) => s.parent_id === step.action.id) ? (
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
                      const newSteps = parSteps?.map((s: any) => {
                        if (s.parent_id === step.action.id) {
                          s.is_hidden = !s.is_hidden;
                        }

                        return s;
                      });

                      parSteps([...newSteps]);
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
                <div className="flex flex-col overflow-x-auto gap-2">
                  <div className="relative">
                    <div
                      ref={(el) => {
                        messagesContainerRef.current[step.id] = el;
                      }}
                      className="max-h-96 overflow-y-auto"
                      onScroll={(e) => handleScroll(step.id, e)}
                    >
                      <Snippet
                        hideCopyButton
                        hideSymbol
                        className="w-full"
                        radius="sm"
                      >
                        {step.messages.flatMap(
                          (data: any, dataIndex: number) =>
                            data.lines?.map((line: any, lineIndex: number) => (
                              <div
                                key={`${dataIndex}-${lineIndex}`}
                                className={`container flex-cols font-semibold flex items-center gap-2`}
                              >
                                <p className="text-default-500 text-opacity-70">
                                  {new Date(line.timestamp).toLocaleString()}
                                </p>
                                <p className={`text-${lineColor(line)}`}>
                                  {line.content}
                                </p>
                              </div>
                            )) || [],
                        )}
                      </Snippet>
                    </div>

                    {!autoScrollEnabled[step.id] && (
                      <Button
                        isIconOnly
                        className="absolute bottom-2 right-2 z-10"
                        color="primary"
                        size="sm"
                        variant="shadow"
                        onPress={() => handleScrollToBottom(step.id)}
                      >
                        <Icon icon="hugeicons:arrow-down-01" width={18} />
                      </Button>
                    )}
                  </div>

                  {step.status === "interactionWaiting" && !step.interacted && (
                    <div className="flex-cols flex items-center gap-4 pt-2">
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
            step.action.name !== "Pick Up" && (
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
            )
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
    [parSteps],
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
      <div className="relative">
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
          <TableBody items={parSteps.filter((s: any) => s.is_hidden == false)}>
            {(item: any) =>
              !item.pending ? (
                <TableRow
                  key={item.id}
                  className={item.parent_id !== "" ? "bg-default-100" : ""}
                >
                  {(columnKey: any) => (
                    <TableCell>
                      {columnKey === "status" && (
                        <div
                          ref={(el) => {
                            stepRowRef.current[item.id] = el?.closest("tr");
                          }}
                          style={{ position: "absolute", visibility: "hidden" }}
                        />
                      )}
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              ) : (
                <TableRow key={item.id} className="text-default-400">
                  {(columnKey: any) => (
                    <TableCell>
                      {columnKey === "status" && (
                        <div
                          ref={(el) => {
                            stepRowRef.current[item.id] = el?.closest("tr");
                          }}
                          style={{ position: "absolute", visibility: "hidden" }}
                        />
                      )}
                      {renderCell(item, columnKey)}
                    </TableCell>
                  )}
                </TableRow>
              )
            }
          </TableBody>
        </Table>

        {/* Page-level scroll control button */}
        {!pageAutoScrollEnabled && (
          <Tooltip content="Auto-Scroll to active step">
            <Button
              isIconOnly
              className="fixed bottom-4 right-4 z-50"
              color="primary"
              size="lg"
              variant="shadow"
              onPress={handleScrollToActiveStep}
            >
              <Icon icon="hugeicons:center-focus" width={24} />
            </Button>
          </Tooltip>
        )}
      </div>
    </>
  );
}
