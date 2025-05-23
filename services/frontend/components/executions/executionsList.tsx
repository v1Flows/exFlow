"use client";

import { Icon } from "@iconify/react";
import { addToast, Button, Chip, Tooltip, useDisclosure } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReactTimeago from "react-timeago";

import DeleteExecutionModal from "@/components/modals/executions/delete";
import {
  executionStatusColor,
  executionStatusIcon,
  executionStatusName,
  executionStatusTimeline,
  executionStatusWrapperCircle,
} from "@/lib/functions/executionStyles";

export default function ExecutionsList({
  runners,
  executions,
  displayToFlow,
  canEdit,
  flows,
}: any) {
  const router = useRouter();

  const deleteExecutionModal = useDisclosure();

  const [targetExecution, setTargetExecution] = useState({} as any);

  function getDuration(execution: any) {
    if (execution.finished_at === "0001-01-01T00:00:00Z") {
      if (execution.executed_at !== "0001-01-01T00:00:00Z") {
        const ms =
          new Date().getTime() - new Date(execution.executed_at).getTime();
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
      } else {
        return "0s";
      }
    } else if (
      execution.finished_at !== "0001-01-01T00:00:00Z" &&
      execution.executed_at === "0001-01-01T00:00:00Z"
    ) {
      return "N/A";
    } else {
      const ms =
        new Date(execution.finished_at).getTime() -
        new Date(execution.executed_at).getTime();
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
  }

  const copyExecutionIDtoClipboard = (key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(key);
      addToast({
        title: "Execution ID",
        description: "ID copied to clipboard!",
        color: "success",
        variant: "flat",
      });
    } else {
      addToast({
        title: "Execution ID",
        description: "Failed to copy ID to clipboard",
        color: "danger",
        variant: "flat",
      });
    }
  };

  return (
    <>
      <div className="divide-y divide-default-100">
        {executions.map((execution: any) => (
          <div
            key={execution.id}
            className="p-4 hover:bg-default-100 bg-default-50 transition-colors"
          >
            <div className="flex items-start">
              <div className="flex-1 overflow-x-auto">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <Icon
                        className={`text-${executionStatusColor(execution)}`}
                        icon={executionStatusIcon(execution)}
                        width={20}
                      />
                      <span
                        className={`font-medium text-${executionStatusColor(execution)}`}
                      >
                        {executionStatusName(execution)}
                      </span>
                      <Tooltip content="Copy ID">
                        <Button
                          isIconOnly
                          size="sm"
                          variant="light"
                          onPress={() =>
                            copyExecutionIDtoClipboard(execution.id)
                          }
                        >
                          <Icon className="text-sm" icon="hugeicons:copy-01" />
                        </Button>
                      </Tooltip>
                    </div>
                    <div className="flex flex-wrap items-center gap-2 text-sm text-foreground-500 mt-0">
                      {displayToFlow && (
                        <Chip radius="sm" size="sm" variant="flat">
                          <span className="text-default-500">Flow: </span>
                          {flows.find(
                            (flow: any) => flow.id === execution.flow_id,
                          )?.name || "Unknown"}
                        </Chip>
                      )}
                      <Chip radius="sm" size="sm" variant="flat">
                        <span className="text-default-500">Triggered by: </span>
                        <span className="capitalize">
                          {execution.triggered_by}
                        </span>
                      </Chip>
                      <Chip radius="sm" size="sm" variant="flat">
                        <span className="text-default-500">Runner: </span>
                        {runners.find(
                          (runner: any) => runner.id === execution.runner_id,
                        )?.name || "Unknown"}
                      </Chip>
                      <Chip radius="sm" size="sm" variant="flat">
                        <span className="text-default-500">Duration: </span>
                        {getDuration(execution)}
                      </Chip>
                    </div>
                  </div>

                  <div className="flex flex-wrap justify-end gap-2">
                    {displayToFlow && (
                      <Button
                        color="secondary"
                        size="sm"
                        startContent={
                          <Icon
                            icon="hugeicons:workflow-square-10"
                            width={16}
                          />
                        }
                        variant="flat"
                        onPress={() => {
                          router.push(`/flows/${execution.flow_id}`);
                        }}
                      >
                        Flow
                      </Button>
                    )}
                    <Button
                      size="sm"
                      startContent={
                        <Icon icon="hugeicons:navigation-03" width={16} />
                      }
                      variant="flat"
                      onPress={() => {
                        router.push(
                          `/flows/${execution.flow_id}/execution/${execution.id}`,
                        );
                      }}
                    >
                      View
                    </Button>
                    {canEdit && (
                      <Button
                        color="danger"
                        isDisabled={!canEdit}
                        size="sm"
                        startContent={
                          <Icon icon="hugeicons:delete-02" width={16} />
                        }
                        variant="flat"
                        onPress={() => {
                          setTargetExecution(execution);
                          deleteExecutionModal.onOpen();
                        }}
                      >
                        Delete
                      </Button>
                    )}
                  </div>
                </div>

                <div className="mt-2">
                  <div
                    className={`flex flex-cols items-center ${(execution.status === "running" || execution.status === "paused" || execution.status === "interactionWaiting") && "flex-cols-reversed justify-end"} overflow-x-auto`}
                  >
                    {execution.steps.map((step, index) => (
                      <div
                        key={step.key}
                        className="flex flex-cols items-center justify-center min-w-[200px] mb-3"
                      >
                        <Tooltip
                          className="p-2"
                          content={
                            <div>
                              <p>
                                Status:{" "}
                                <span className="capitalize">
                                  {step.status}
                                </span>
                              </p>
                              <p>
                                Created: <ReactTimeago date={step.created_at} />
                              </p>
                              <p>
                                Started: <ReactTimeago date={step.started_at} />
                              </p>
                              <p>
                                Finished:{" "}
                                <ReactTimeago date={step.finished_at} />
                              </p>
                            </div>
                          }
                        >
                          <div className="flex flex-col items-center flex-1">
                            {executionStatusWrapperCircle(step)}
                            <span className="text-xs text-foreground-500 mt-1 text-center w-24">
                              {step.action.custom_name || step.action.name}
                            </span>
                          </div>
                        </Tooltip>

                        <div className="flex-1">
                          {index < execution.steps.length - 1 &&
                            executionStatusTimeline(
                              execution.steps[index + 1] || step,
                            )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between mt-4">
                    <span className="text-xs text-foreground-400">
                      Created at: <ReactTimeago date={execution.created_at} />
                    </span>
                    <span className="text-xs text-foreground-400">
                      Finished at: <ReactTimeago date={execution.finished_at} />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <DeleteExecutionModal
        disclosure={deleteExecutionModal}
        execution={targetExecution}
      />
    </>
  );
}
