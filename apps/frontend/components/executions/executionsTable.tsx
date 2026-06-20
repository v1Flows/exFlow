"use client";
import { CopySnippet } from "@/components/ui/copy-snippet";
import { Icon } from "@iconify/react";
import { Button, Chip, Table, Tooltip, useOverlayState } from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReactTimeago from "react-timeago";
import { motion } from "framer-motion";
import DeleteExecutionModal from "@/components/modals/executions/delete";
import {
  executionStatusColor,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";
export default function ExecutionsTable({
  runners,
  executions,
  displayToFlow,
  canEdit,
}: any) {
  const router = useRouter();
  const deleteExecutionModal = useOverlayState();
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
  const renderCell = React.useCallback((execution, columnKey) => {
    const cellValue = execution[columnKey];
    switch (columnKey) {
      case "status":
        return (
          <div className="flex flex-cols items-center gap-2">
            {executionStatusWrapper(execution)}
            <div className="flex flex-col items-start">
              <p
                className={`font-bold text-${executionStatusColor(execution)}`}
              >
                {executionStatusName(execution)}
              </p>
              {execution.status !== "scheduled" && (
                <p className="text-sm text-muted">{getDuration(execution)}</p>
              )}
            </div>
          </div>
        );
      case "triggered_by":
        return (
          <Chip className="capitalize">
            <Chip.Label>{cellValue}</Chip.Label>
          </Chip>
        );
      case "runner_id":
        return runners.find((runner: any) => runner.id === cellValue)?.name ? (
          <span>
            {runners.find((runner: any) => runner.id === cellValue).name}
          </span>
        ) : (
          <Tooltip>
            <Tooltip.Trigger>
              <span className="text-muted">Not Found</span>
            </Tooltip.Trigger>
            <Tooltip.Content>{`ID: ${cellValue}`}</Tooltip.Content>
          </Tooltip>
        );
      case "scheduled_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip>
            <Tooltip.Trigger>
              {cellValue > new Date().toISOString() ? (
                <span className="text-default-foreground font-bold">
                  <ReactTimeago live date={new Date(cellValue)} />
                </span>
              ) : (
                <ReactTimeago live date={new Date(cellValue)} />
              )}
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(cellValue).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <span className="text-muted">Not scheduled</span>
        );
      case "created_at":
        return (
          <Tooltip>
            <Tooltip.Trigger>
              <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(cellValue).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        );
      case "executed_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip>
            <Tooltip.Trigger>
              <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(cellValue).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <span className="text-muted">Not executed</span>
        );
      case "finished_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip>
            <Tooltip.Trigger>
              <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
            </Tooltip.Trigger>
            <Tooltip.Content>
              {new Date(cellValue).toLocaleString()}
            </Tooltip.Content>
          </Tooltip>
        ) : (
          <span className="text-muted">Not executed</span>
        );
      case "id":
        return <CopySnippet showPrompt={false}>{cellValue}</CopySnippet>;
      case "actions":
        return (
          <div className="flex items-center justify-center gap-2">
            {displayToFlow && (
              <Button
                variant="tertiary"
                onPress={() => {
                  router.push(`/flows/${execution.flow_id}`);
                }}
              >
                <Icon icon="hugeicons:workflow-square-10" width={20} />
                Flow
              </Button>
            )}
            <Button
              variant="secondary"
              onPress={() => {
                router.push(
                  `/flows/${execution.flow_id}/execution/${execution.id}`,
                );
              }}
            >
              <Icon icon="hugeicons:navigation-03" width={20} />
              View
            </Button>
            <Tooltip>
              <Tooltip.Trigger>
                <Button
                  isDisabled={!canEdit}
                  variant="ghost"
                  onPress={() => {
                    setTargetExecution(execution);
                    deleteExecutionModal.open();
                  }}
                  className="aspect-square p-0"
                >
                  <span className="text-lg text-danger cursor-pointer active:opacity-50">
                    <Icon icon="hugeicons:delete-02" width={20} />
                  </span>
                </Button>
              </Tooltip.Trigger>
              <Tooltip.Content>{"Delete Execution"}</Tooltip.Content>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);
  return (
    <>
      <motion.div
        animate={{ opacity: 1, y: 0 }}
        initial={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.3 }}
      >
        <Table>
          <Table.ScrollContainer>
            <Table.Content aria-label="Example table with custom cells">
              <Table.Header>
                <Table.Column key="status" id="status" className="text-start">
                  Status
                </Table.Column>
                <Table.Column
                  key="triggered_by"
                  id="triggered_by"
                  className="text-center"
                >
                  Triggered By
                </Table.Column>
                <Table.Column
                  key="runner_id"
                  id="runner_id"
                  className="text-center"
                >
                  Runner
                </Table.Column>
                <Table.Column
                  key="scheduled_at"
                  id="scheduled_at"
                  className="text-center"
                >
                  Scheduled At
                </Table.Column>
                <Table.Column
                  key="created_at"
                  id="created_at"
                  className="text-center"
                >
                  Created At
                </Table.Column>
                <Table.Column
                  key="executed_at"
                  id="executed_at"
                  className="text-center"
                >
                  Executed At
                </Table.Column>
                <Table.Column
                  key="finished_at"
                  id="finished_at"
                  className="text-center"
                >
                  Finished At
                </Table.Column>
                <Table.Column key="id" id="id" className="text-center">
                  ID
                </Table.Column>
                <Table.Column
                  key="actions"
                  id="actions"
                  className="text-center"
                >
                  Actions
                </Table.Column>
              </Table.Header>
              <Table.Body items={executions}>
                {(item: any) => (
                  <Table.Row key={item.id} id={item.id}>
                    {(columnKey) => (
                      <Table.Cell>{renderCell(item, columnKey)}</Table.Cell>
                    )}
                  </Table.Row>
                )}
              </Table.Body>
            </Table.Content>
          </Table.ScrollContainer>
        </Table>
      </motion.div>

      <DeleteExecutionModal
        disclosure={deleteExecutionModal}
        execution={targetExecution}
      />
    </>
  );
}
