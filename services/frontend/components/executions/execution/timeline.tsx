"use client";

import { Icon } from "@iconify/react";
import {
  addToast,
  Button,
  Card,
  CardBody,
  CardHeader,
  Chip,
  ScrollShadow,
} from "@heroui/react";
import React, { useEffect, useState, useRef } from "react";
import ReactTimeago from "react-timeago";

import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

import AdminStepActions from "./adminStepActions";

export default function ExecutionTimeline({
  execution,
  steps,
  userDetails,
}: any) {
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);
  const [autoScrollEnabled, setAutoScrollEnabled] = useState(true);
  const logsContainerRef = useRef<any>(null);
  const listRef = useRef<any>(null);

  // Select the active step by default or when steps update (if auto-scroll is on)
  useEffect(() => {
    if (steps.length === 0) return;

    const runningStep = steps.find(
      (s: any) =>
        s.status === "running" ||
        s.status === "interactionWaiting" ||
        s.status === "paused",
    );
    const failedStep = steps.find((s: any) => s.status === "failed");
    const targetStep = runningStep || failedStep || steps[steps.length - 1];

    if (!selectedStepId) {
      setSelectedStepId(targetStep.id);
    } else if (autoScrollEnabled) {
      if (targetStep.id !== selectedStepId) {
        setSelectedStepId(targetStep.id);
      }
    }
  }, [steps, autoScrollEnabled]);

  // Scroll to selected step
  useEffect(() => {
    if (selectedStepId && listRef.current) {
      const element = listRef.current.querySelector(`#step-${selectedStepId}`);

      if (element) {
        element.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }
    }
  }, [selectedStepId]);

  // Auto-scroll logs
  useEffect(() => {
    if (autoScrollEnabled && logsContainerRef.current) {
      logsContainerRef.current.scrollTop =
        logsContainerRef.current.scrollHeight;
    }
  }, [steps, selectedStepId, autoScrollEnabled]);

  const handleScroll = (e: any) => {
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;

    setAutoScrollEnabled(isNearBottom);
  };

  const selectedStep =
    steps.find((s: any) => s.id === selectedStepId) || steps[steps.length - 1];

  function getDuration(step: any) {
    if (!step) return "-";
    if (step.status === "pending") return "-";

    let finishedAt = step.finished_at;

    if (finishedAt === "0001-01-01T00:00:00Z") {
      finishedAt = new Date().toISOString();
    }

    const ms =
      new Date(finishedAt).getTime() - new Date(step.started_at).getTime();
    const sec = Math.floor(ms / 1000);

    if (sec < 60) return `${sec}s`;
    const min = Math.floor(sec / 60);

    if (min < 60) return `${min}m ${sec % 60}s`;
    const hr = Math.floor(min / 60);

    return `${hr}h ${min % 60}m`;
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
    step.interacted_by = userDetails.id;
    step.interacted_at = new Date().toISOString();

    await InteractExecutionStep(execution.id, step.id, step)
      .then(() => {
        addToast({
          title: "Interaction sent",
          description:
            "Step interaction has been recorded successfully. Data will refresh shortly.",
          color: "success",
          variant: "flat",
        });
      })
      .catch((err) => {
        addToast({
          title: "Interaction failed",
          description: err.message,
          color: "danger",
          variant: "flat",
        });
      });
  }

  function lineColor(line: any) {
    if (!line.color) return "default-600";
    if (line.color === "info") return "primary";

    return line.color;
  }

  return (
    <div className="flex h-full flex-col gap-6 overflow-hidden lg:flex-row">
      {/* Left Sidebar - Steps Timeline */}
      <Card className="h-full w-full border border-white/10 bg-content1/60 backdrop-blur-md lg:w-1/3">
        <CardHeader className="sticky top-0 z-10 flex items-center justify-between border-b border-divider bg-content1/50 px-4 py-3 backdrop-blur-md">
          <span className="font-semibold text-default-700">
            Execution Steps
          </span>
          <Chip color="primary" size="sm" variant="flat">
            {steps.length} Steps
          </Chip>
        </CardHeader>

        <ScrollShadow className="flex-1 p-4">
          <div ref={listRef} className="relative flex flex-col">
            {/* Vertical Line */}
            <div className="absolute bottom-4 left-[19px] top-4 z-0 w-[2px] bg-default-200/50" />

            {steps.map((step: any, index: number) => {
              const isSelected = selectedStepId === step.id;

              return (
                <div
                  key={step.id}
                  className="relative z-10 pb-4 pl-10 last:pb-0"
                  id={`step-${step.id}`}
                >
                  {/* Timeline Dot */}
                  <div
                    className={`absolute left-[10px] top-4 flex h-5 w-5 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-background transition-colors ${
                      isSelected ? "border-primary" : "border-default-300"
                    }`}
                  >
                    <div
                      className={`h-2 w-2 rounded-full ${
                        step.status === "running"
                          ? "animate-pulse bg-warning"
                          : step.status === "success"
                            ? "bg-success"
                            : step.status === "error" ||
                                step.status === "canceled"
                              ? "bg-danger"
                              : step.status === "interactionWaiting" ||
                                  step.status === "paused"
                                ? "animate-pulse bg-warning"
                                : step.status === "warning"
                                  ? "bg-warning"
                                  : isSelected
                                    ? "bg-primary"
                                    : "bg-default-300"
                      }`}
                    />
                  </div>

                  <Card
                    isPressable
                    className={`w-full border transition-all ${
                      isSelected
                        ? "bg-primary/10 border-primary/50 shadow-md"
                        : "border-default-200/50 bg-content1/40 hover:bg-content1/60"
                    }`}
                    onPress={() => setSelectedStepId(step.id)}
                  >
                    <CardBody className="p-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-3 overflow-hidden">
                          {step.action?.icon && (
                            <div
                              className={`flex shrink-0 items-center justify-center rounded-small p-1.5 ${
                                isSelected
                                  ? "bg-primary/20 text-primary"
                                  : "bg-default-100 text-default-500"
                              }`}
                            >
                              <Icon icon={step.action.icon} width={18} />
                            </div>
                          )}
                          <div className="flex flex-col gap-0.5 overflow-hidden">
                            <div className="flex items-center gap-2">
                              <span
                                className={`truncate font-medium ${isSelected ? "text-primary" : "text-foreground"}`}
                              >
                                {step.label || step.action?.name || step.name}
                              </span>
                              {step.status === "interactionWaiting" && (
                                <Chip
                                  className="h-5 px-1 text-[10px]"
                                  color="warning"
                                  size="sm"
                                  variant="flat"
                                >
                                  Waiting
                                </Chip>
                              )}
                            </div>
                            <div className="flex items-center gap-2 text-tiny text-default-400">
                              <span>Step {index + 1}</span>
                              {step.label &&
                                step.action?.name &&
                                step.label !== step.action.name && (
                                  <>
                                    <span>•</span>
                                    <span>{step.action.name}</span>
                                  </>
                                )}
                              <span>•</span>
                              <span>{getDuration(step)}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex shrink-0 items-center">
                          {executionStatusWrapper(step)}
                        </div>
                      </div>
                    </CardBody>
                  </Card>
                </div>
              );
            })}
          </div>
        </ScrollShadow>
      </Card>

      {/* Right Content - Step Details */}
      <Card className="h-full w-full border border-white/10 bg-content1/60 backdrop-blur-md lg:w-2/3">
        {selectedStep ? (
          <>
            <CardHeader className="flex flex-col gap-4 border-b border-divider bg-content1/50 px-6 py-4 backdrop-blur-md">
              <div className="flex w-full items-start justify-between">
                <div className="flex flex-col gap-1">
                  <h2 className="flex items-center gap-2 text-xl font-bold">
                    {selectedStep.label || selectedStep.name}
                    <Chip
                      color={executionStatusColor(selectedStep) as any}
                      size="sm"
                      variant="flat"
                    >
                      {executionStatusName(selectedStep)}
                    </Chip>
                  </h2>
                  <div className="text-small flex items-center gap-4 text-default-500">
                    <div className="flex items-center gap-1">
                      <Icon icon="hugeicons:clock-01" width={16} />
                      <span>Duration: {getDuration(selectedStep)}</span>
                    </div>
                    {selectedStep.started_at !== "0001-01-01T00:00:00Z" && (
                      <div className="flex items-center gap-1">
                        <Icon icon="hugeicons:calendar-03" width={16} />
                        <ReactTimeago date={selectedStep.started_at} />
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  {userDetails.role === "admin" && (
                    <AdminStepActions
                      execution={execution}
                      step={selectedStep}
                    />
                  )}
                  <Button
                    isIconOnly
                    className={
                      autoScrollEnabled ? "text-primary" : "text-default-400"
                    }
                    variant="light"
                    onPress={() => setAutoScrollEnabled(!autoScrollEnabled)}
                  >
                    <Icon icon="hugeicons:arrow-down-double" width={20} />
                  </Button>
                </div>
              </div>

              {/* Interaction Buttons */}
              {selectedStep.status === "interactionWaiting" && (
                <div className="rounded-medium flex w-full items-center gap-4 border border-warning/20 bg-warning/10 p-4">
                  <div className="flex-1">
                    <p className="font-semibold text-warning-600">
                      User Interaction Required
                    </p>
                    <p className="text-small text-warning-600/80">
                      This step requires manual approval to proceed.
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      color="success"
                      startContent={<Icon icon="hugeicons:tick-02" />}
                      variant="flat"
                      onPress={() => interactStep(selectedStep, true)}
                    >
                      Approve
                    </Button>
                    <Button
                      color="danger"
                      startContent={<Icon icon="hugeicons:cancel-01" />}
                      variant="flat"
                      onPress={() => interactStep(selectedStep, false)}
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              )}
            </CardHeader>

            <div className="relative flex flex-1 flex-col overflow-hidden">
              {/* Logs Area */}
              <div
                ref={logsContainerRef}
                className="flex-1 overflow-y-auto bg-[#1e1e1e]/50 p-4 font-mono text-sm"
                onScroll={handleScroll}
              >
                {selectedStep.messages && selectedStep.messages.length > 0 ? (
                  <div className="flex flex-col gap-0.5">
                    {selectedStep.messages
                      .flatMap((msg: any) => msg.lines || [])
                      .map((line: any, i: number) => (
                        <div
                          key={i}
                          className={`flex gap-2 text-${lineColor(line)}`}
                        >
                          <span className="shrink-0 select-none text-default-400 opacity-50 text-xs pt-0.5">
                            {line.timestamp
                              ? new Date(line.timestamp).toLocaleTimeString()
                              : ""}
                          </span>
                          <span className="whitespace-pre-wrap break-all">
                            {line.content}
                          </span>
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="flex h-full flex-col items-center justify-center gap-2 text-default-400 opacity-50">
                    <Icon icon="hugeicons:terminal" width={32} />
                    <p>No logs available</p>
                  </div>
                )}
              </div>

              {/* Auto-scroll indicator */}
              {!autoScrollEnabled && (
                <div className="absolute bottom-4 right-4">
                  <Button
                    color="primary"
                    size="sm"
                    startContent={<Icon icon="hugeicons:arrow-down-double" />}
                    variant="shadow"
                    onPress={() => setAutoScrollEnabled(true)}
                  >
                    Resume Auto-scroll
                  </Button>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-4 text-default-400">
            <div className="flex size-20 items-center justify-center rounded-full bg-content2/50">
              <Icon
                className="opacity-50"
                icon="hugeicons:cursor-click-02"
                width={40}
              />
            </div>
            <p className="text-lg font-medium">Select a step to view details</p>
          </div>
        )}
      </Card>
    </div>
  );
}
