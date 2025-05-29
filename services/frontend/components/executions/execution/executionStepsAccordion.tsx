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
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { isMobile, isTablet } from "react-device-detect";

import InteractExecutionStep from "@/lib/fetch/executions/PUT/step_interact";
import { executionStatusWrapper } from "@/lib/functions/executionStyles";

import AdminStepActions from "./adminStepActions";

export function ExecutionStepsAccordion({
  flow,
  execution,
  steps,
  runners,
  userDetails,
}: any) {
  const router = useRouter();

  const [parSteps, setParSteps] = useState([] as any);
  const [selectedKeys, setSelectedKeys] = React.useState(new Set(["1"]));
  const [userSelected, setUserSelected] = useState(false);

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
  }, [steps]);

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
                <div className="pb-5">
                  <div className="border-l-2 border-default-200 pl-5 ml-3">
                    {step.action.status === "pending" ? (
                      <p>Step not started yet</p>
                    ) : (
                      <div className="flex flex-col overflow-x-auto gap-2">
                        <Snippet
                          hideCopyButton
                          hideSymbol
                          className={`w-full`}
                          radius="sm"
                        >
                          {step.messages.map((data: any) =>
                            data.lines?.map((line: any, index: any) => (
                              <div
                                key={index}
                                className={`container flex-cols font-semibold flex items-center gap-2`}
                              >
                                <p className="text-default-500 text-opacity-70">
                                  {new Date(line.timestamp).toLocaleString()}
                                </p>
                                <p className={`text-${lineColor(line)}`}>
                                  {line.content}
                                </p>
                              </div>
                            )),
                          )}
                        </Snippet>

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
      </Card>
    </>
  );
}
