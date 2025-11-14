"use client";

import { Icon } from "@iconify/react";
import {
  Accordion,
  AccordionItem,
  addToast,
  Button,
  Card,
  Chip,
  Progress,
  Snippet,
} from "@heroui/react";
import React, { useEffect, useState, useRef } from "react";
import { isMobile, isTablet } from "react-device-detect";

import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
import { executionStatusWrapper } from "@/lib/functions/executionStyles";
import { useRefreshCache } from "@/lib/swr/hooks/useRefreshCache";

import AdminStepActions from "./adminStepActions";

export function ExecutionStepsAccordion({
  flow,
  execution,
  steps,
  runners,
  userDetails,
}: any) {
  const { refreshExecution, refreshExecutionSteps } = useRefreshCache();

  const [parSteps, setParSteps] = useState([] as any);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set(["1"]));
  const [userSelected, setUserSelected] = useState(false);
  const messagesEndRef = useRef<{ [key: string]: any }>({});
  const messagesContainerRef = useRef<{ [key: string]: any }>({});
  const stepItemRef = useRef<{ [key: string]: any }>({});
  const [autoScrollEnabled, setAutoScrollEnabled] = useState<{
    [key: string]: boolean;
  }>({});
  const [stepAutoScrollEnabled, setStepAutoScrollEnabled] = useState(true);
  const isAutoScrollingRef = useRef(false);

  useEffect(() => {
    setParSteps(steps);
    const nonPendingSteps = steps.filter(
      (step: any) => step.status !== "pending",
    );

    if (!userSelected) {
      setSelectedKeys(
        new Set([
          nonPendingSteps.length > 0
            ? nonPendingSteps[nonPendingSteps.length - 1].id
            : undefined,
        ]),
      );
    }

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

  // Auto-scroll: only scroll to bottom of messages, no automatic step centering
  useEffect(() => {
    // Use a timeout to ensure DOM is updated before scrolling
    const timeoutId = setTimeout(() => {
      // Only scroll to bottom of messages for steps with auto-scroll enabled
      steps.forEach((step: any) => {
        if (autoScrollEnabled[step.id]) {
          const messagesContainer = messagesContainerRef.current[step.id];

          if (messagesContainer) {
            // Use scrollTop instead of scrollIntoView to avoid page jumping
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
          }
        }
      });
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [steps, autoScrollEnabled]);

  // Initial auto-scroll to active step (only when step auto-scroll is enabled and not user-selected)
  useEffect(() => {
    if (stepAutoScrollEnabled && !userSelected) {
      const timeoutId = setTimeout(() => {
        const nonPendingSteps = steps.filter(
          (step: any) => step.status !== "pending",
        );
        const activeStep = nonPendingSteps[nonPendingSteps.length - 1];

        if (activeStep) {
          const stepElement = stepItemRef.current[activeStep.id];

          if (stepElement) {
            // Set flag to prevent scroll listener from interfering
            isAutoScrollingRef.current = true;

            stepElement.scrollIntoView({
              behavior: "smooth",
              block: "center",
            });

            // Clear the flag after scrolling is complete
            setTimeout(() => {
              isAutoScrollingRef.current = false;
            }, 1000);
          }
        }
      }, 200); // Slightly longer delay to ensure all elements are rendered

      return () => clearTimeout(timeoutId);
    }
  }, [
    steps.length,
    stepAutoScrollEnabled,
    userSelected,
    // Also trigger when the active step changes (not just when new steps are added)
    steps.filter((step: any) => step.status !== "pending").length > 0
      ? steps.filter((step: any) => step.status !== "pending")[
          steps.filter((step: any) => step.status !== "pending").length - 1
        ]?.id
      : null,
  ]); // Trigger when steps count changes OR when the active step changes

  // Add scroll listener to detect page scrolling and disable step auto-scroll
  useEffect(() => {
    const handleScroll = () => {
      // Only disable auto-scroll if it's not a programmatic scroll
      if (stepAutoScrollEnabled && !isAutoScrollingRef.current) {
        setStepAutoScrollEnabled(false);
      }
    };

    // Only add listener if we're in the browser
    if (typeof globalThis !== "undefined" && globalThis.window) {
      globalThis.window.addEventListener("scroll", handleScroll, {
        passive: true,
      });

      return () => {
        globalThis.window.removeEventListener("scroll", handleScroll);
      };
    }
  }, [stepAutoScrollEnabled]);

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

  function getPercentage(maxValue: number, value: number) {
    if (maxValue === 0) {
      return 0;
    }

    return Math.min(100, Math.floor((value / maxValue) * 100));
  }

  function handleScrollToBottom(stepId: string) {
    const messagesContainer = messagesContainerRef.current[stepId];

    if (messagesContainer) {
      // Use smooth scrolling with scrollTo instead of scrollIntoView
      messagesContainer.scrollTo({
        top: messagesContainer.scrollHeight,
        behavior: "smooth",
      });
      setAutoScrollEnabled((prev) => ({ ...prev, [stepId]: true }));
    }
  }

  function handleScrollToActiveStep() {
    const nonPendingSteps = steps.filter(
      (step: any) => step.status !== "pending",
    );
    const activeStep = nonPendingSteps[nonPendingSteps.length - 1];

    if (activeStep) {
      const stepElement = stepItemRef.current[activeStep.id];

      if (stepElement) {
        // Set flag to prevent scroll listener from interfering
        isAutoScrollingRef.current = true;

        stepElement.scrollIntoView({
          behavior: "smooth",
          block: "center",
        });

        setStepAutoScrollEnabled(true);
        setUserSelected(false);

        // Clear the flag after scrolling is complete
        setTimeout(() => {
          isAutoScrollingRef.current = false;
        }, 1000); // Give enough time for smooth scrolling to complete
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
      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000));
      await refreshExecutionSteps(execution.id);
      await refreshExecution(execution.id);
    }
  }

  return (
    <>
      <Card className="p-0">
        <Accordion
          className="p-0"
          selectedKeys={selectedKeys}
          showDivider={false}
          variant="shadow"
          onSelectionChange={(e: any) => {
            setUserSelected(true);
            setStepAutoScrollEnabled(false); // Disable step auto-scroll when user manually selects
            setSelectedKeys(e);
          }}
        >
          {parSteps.map((step: any) => {
            return (
              <AccordionItem
                key={step.id}
                aria-label="Scheduled"
                classNames={{
                  base: "border-b border-divider last:border-none",
                  title: "py-5",
                  subtitle: "opacity-100 flex justify-end",
                  trigger: "px-6 py-0",
                  content: "px-6",
                }}
                startContent={
                  <div className="flex items-center gap-4">
                    <div className="text-success mt-2 mb-2">
                      {executionStatusWrapper(step)}
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="p-2.5">
                        <Icon
                          icon={`${step.action.icon || "solar:question-square-line-duotone"}`}
                          width={24}
                        />
                      </div>
                      <div className="flex flex-col items-start">
                        <span className="font-medium text-medium">
                          {flow.actions.find(
                            (a: any) => a.id === step.action.id,
                          )?.custom_name
                            ? flow.actions.find(
                                (a: any) => a.id === step.action.id,
                              ).custom_name
                            : step.action.name}
                        </span>
                        {!isMobile && (
                          <span className="text-tiny">
                            {flow.actions.find(
                              (a: any) => a.id === step.action.id,
                            )?.custom_description
                              ? flow.actions.find(
                                  (a: any) => a.id === step.action.id,
                                ).custom_description
                              : step.action.description}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                }
                subtitle={
                  <div className="flex items-center gap-4 text-small text-default-500">
                    {step.action.name !== "Pick Up" && (
                      <div
                        className={`flex items-center gap-2 ${isMobile && !isTablet ? "hidden" : ""}`}
                      >
                        <div className="w-16">
                          <Progress
                            className="max-w-full"
                            color="primary"
                            maxValue={getTotalDurationSeconds() || 1}
                            size="sm"
                            value={getDurationSeconds(step) || 0}
                          />
                        </div>
                        <span>
                          {getPercentage(
                            getTotalDurationSeconds() || 1,
                            getDurationSeconds(step) || 0,
                          )}
                          %
                        </span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Icon icon="lucide:clock" width={14} />
                      <span>{getDuration(step)}</span>
                    </div>

                    {!isMobile && (
                      <div className="flex items-center gap-1">
                        {userDetails.role === "admin" && (
                          <AdminStepActions execution={execution} step={step} />
                        )}
                      </div>
                    )}
                  </div>
                }
              >
                <div
                  ref={(el) => {
                    stepItemRef.current[step.id] = el;
                  }}
                  className="pb-5"
                >
                  <div className="border-l-2 border-default-200 pl-5 ml-3">
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
                              {(() => {
                                let globalLineNumber = 1;

                                return step.messages.flatMap(
                                  (data: any, dataIndex: number) =>
                                    data.lines?.map(
                                      (line: any, lineIndex: number) => {
                                        const currentLineNumber =
                                          globalLineNumber++;

                                        return (
                                          <div
                                            key={`${dataIndex}-${lineIndex}`}
                                            className={`container flex items-start gap-3 py-0.3 hover:bg-default-100/50 transition-colors`}
                                          >
                                            <div className="shrink-0 w-8 text-right">
                                              <span className="text-xs text-default-400 font-mono select-none">
                                                {currentLineNumber}
                                              </span>
                                            </div>
                                            <div className="shrink-0">
                                              <span className="text-xs text-default-500 text-opacity-70 font-mono">
                                                {new Date(
                                                  line.timestamp,
                                                ).toLocaleTimeString([], {
                                                  hour12: false,
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                  second: "2-digit",
                                                })}
                                              </span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                              <span
                                                className={`text-sm font-medium text-${lineColor(line)} break-words`}
                                              >
                                                {line.content}
                                              </span>
                                            </div>
                                          </div>
                                        );
                                      },
                                    ) || [],
                                );
                              })()}
                              <div
                                ref={(el) => {
                                  messagesEndRef.current[step.id] = el;
                                }}
                              />
                            </Snippet>
                          </div>

                          {!autoScrollEnabled[step.id] && (
                            <Button
                              isIconOnly
                              className="absolute bottom-2 right-4 z-10"
                              color="primary"
                              size="sm"
                              variant="shadow"
                              onPress={() => handleScrollToBottom(step.id)}
                            >
                              <Icon icon="hugeicons:arrow-down-01" width={18} />
                            </Button>
                          )}
                        </div>

                        {step.status === "interactionWaiting" &&
                          !step.interacted && (
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
                  </div>
                </div>

                <div className="flex overflow-x-auto items-center gap-2">
                  <Chip radius="sm" size="sm" variant="flat">
                    ID: {step.id}
                  </Chip>
                  {step.encrypted && (
                    <Chip color="success" radius="sm" size="sm" variant="flat">
                      Encrypted
                    </Chip>
                  )}
                  <Chip radius="sm" size="sm" variant="flat">
                    Runner:{" "}
                    {runners.find((r: any) => r.id === step.runner_id)?.name ||
                      "N/A"}
                  </Chip>
                  <Chip radius="sm" size="sm" variant="flat">
                    Created At: {new Date(step.created_at).toLocaleString()}
                  </Chip>
                  <Chip radius="sm" size="sm" variant="flat">
                    Started At: {new Date(step.started_at).toLocaleString()}
                  </Chip>
                  <Chip radius="sm" size="sm" variant="flat">
                    Finished At: {new Date(step.finished_at).toLocaleString()}
                  </Chip>
                </div>
              </AccordionItem>
            );
          })}
        </Accordion>
        <div className="mt flex w-full items-center justify-center mt-5 mb-5">
          <div className="flex items-center gap-4">
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
        </div>
      </Card>

      {/* Floating auto-scroll button - fixed position */}
      {!stepAutoScrollEnabled && (
        <Button
          isIconOnly
          className="fixed bottom-6 right-6 z-50 shadow-lg"
          color="primary"
          size="lg"
          variant="shadow"
          onPress={handleScrollToActiveStep}
        >
          <Icon icon="hugeicons:arrow-down-01" width={20} />
        </Button>
      )}
    </>
  );
}
