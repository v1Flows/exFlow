"use client";

import { Icon } from "@iconify/react";
import { addToast, Button, ButtonGroup, Divider, Spacer } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

import Reloader from "@/components/reloader/Reloader";
import GetExecutionSteps from "@/lib/fetch/executions/steps";
import APICancelExecution from "@/lib/fetch/executions/cancel";
import { useExecutionStepStyleStore } from "@/lib/functions/userExecutionStepStyle";

import AdminExecutionActions from "./adminExecutionActions";
import ExecutionDetails from "./details";
import { ExecutionStepsTable } from "./executionStepsTable";
import { ExecutionStepsAccordion } from "./executionStepsAccordion";

export function Execution({ flow, execution, runners, userDetails }: any) {
  const router = useRouter();

  const { displayStyle, setDisplayStyle } = useExecutionStepStyleStore();
  const [steps, setSteps] = useState([] as any);

  useEffect(() => {
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
        <div className="flex flex-wrap mt-2 items-center gap-4 lg:mt-0 lg:justify-end">
          {(execution.status === "running" ||
            execution.status === "paused" ||
            execution.status === "pending" ||
            execution.status === "scheduled" ||
            execution.status === "interactionWaiting") && (
            <Button
              color="danger"
              startContent={<Icon icon="hugeicons:cancel-01" width={20} />}
              variant="shadow"
              onPress={() => {
                APICancelExecution(execution.id)
                  .then(() => {
                    addToast({
                      title: "Request to cancel execution sent",
                      color: "success",
                    });
                  })
                  .catch((err) => {
                    addToast({
                      title: "Execution cancel failed",
                      description: err.message,
                      color: "danger",
                    });
                  });
              }}
            >
              Cancel Execution
            </Button>
          )}

          {userDetails.role === "admin" && (
            <AdminExecutionActions execution={execution} />
          )}

          <ButtonGroup radius="sm" size="md">
            <Button
              isIconOnly
              startContent={
                <Icon icon="hugeicons:right-to-left-list-triangle" width={18} />
              }
              variant={displayStyle === "accordion" ? "solid" : "flat"}
              onPress={() => {
                setDisplayStyle("accordion");
              }}
            />
            <Button
              isIconOnly
              startContent={
                <Icon icon="hugeicons:layout-table-01" width={18} />
              }
              variant={displayStyle === "table" ? "solid" : "flat"}
              onPress={() => {
                setDisplayStyle("table");
              }}
            />
          </ButtonGroup>

          {(execution.status === "running" ||
            execution.status === "pending" ||
            execution.status === "paused" ||
            execution.status === "scheduled" ||
            execution.status === "interactionWaiting") && (
            <div className="flex items-center gap-2">
              <Divider className="h-10 mr-1 ml-1" orientation="vertical" />
              <Reloader circle />
            </div>
          )}
        </div>
      </div>
      <Divider className="my-4" />
      <ExecutionDetails execution={execution} runners={runners} steps={steps} />
      <Spacer y={4} />

      {displayStyle === "table" && (
        <ExecutionStepsTable
          execution={execution}
          flow={flow}
          runners={runners}
          steps={steps}
          userDetails={userDetails}
        />
      )}

      {displayStyle === "accordion" && (
        <ExecutionStepsAccordion
          execution={execution}
          flow={flow}
          runners={runners}
          steps={steps}
          userDetails={userDetails}
        />
      )}
    </>
  );
}
