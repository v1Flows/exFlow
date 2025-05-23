"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  Chip,
  Snippet,
  Table,
  TableBody,
  TableCell,
  TableColumn,
  TableHeader,
  TableRow,
  Tooltip,
  useDisclosure,
} from "@heroui/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReactTimeago from "react-timeago";

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
                <p className="text-sm text-default-500">
                  {getDuration(execution)}
                </p>
              )}
            </div>
          </div>
        );
      case "triggered_by":
        return (
          <Chip className="capitalize" radius="sm" size="sm" variant="flat">
            {cellValue}
          </Chip>
        );
      case "runner_id":
        return runners.find((runner: any) => runner.id === cellValue)?.name ? (
          <span>
            {runners.find((runner: any) => runner.id === cellValue).name}
          </span>
        ) : (
          <Tooltip content={`ID: ${cellValue}`}>
            <span className="text-default-500">Not Found</span>
          </Tooltip>
        );
      case "scheduled_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            {cellValue > new Date().toISOString() ? (
              <span className="text-secondary font-bold">
                <ReactTimeago live date={new Date(cellValue)} />
              </span>
            ) : (
              <ReactTimeago live date={new Date(cellValue)} />
            )}
          </Tooltip>
        ) : (
          <span className="text-default-500">Not scheduled</span>
        );
      case "created_at":
        return (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
        );
      case "executed_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
        ) : (
          <span className="text-default-500">Not executed</span>
        );
      case "finished_at":
        return cellValue !== "0001-01-01T00:00:00Z" ? (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
        ) : (
          <span className="text-default-500">Not executed</span>
        );
      case "id":
        return (
          <Snippet hideSymbol size="sm" variant="flat">
            {cellValue}
          </Snippet>
        );
      case "actions":
        return (
          <div className="flex items-center justify-center gap-2">
            {displayToFlow && (
              <Button
                color="secondary"
                variant="flat"
                onPress={() => {
                  router.push(`/flows/${execution.flow_id}`);
                }}
              >
                <Icon icon="hugeicons:workflow-square-10" width={20} />
                Flow
              </Button>
            )}
            <Button
              color="primary"
              variant="flat"
              onPress={() => {
                router.push(
                  `/flows/${execution.flow_id}/execution/${execution.id}`,
                );
              }}
            >
              <Icon icon="hugeicons:navigation-03" width={20} />
              View
            </Button>
            <Tooltip color="danger" content="Delete Execution">
              <Button
                isIconOnly
                isDisabled={!canEdit}
                variant="light"
                onPress={() => {
                  setTargetExecution(execution);
                  deleteExecutionModal.onOpen();
                }}
              >
                <span className="text-lg text-danger cursor-pointer active:opacity-50">
                  <Icon icon="hugeicons:delete-02" width={20} />
                </span>
              </Button>
            </Tooltip>
          </div>
        );
      default:
        return cellValue;
    }
  }, []);

  return (
    <>
      <Table
        aria-label="Example table with custom cells"
        topContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn key="status" align="start">
            Status
          </TableColumn>
          <TableColumn key="triggered_by" align="center">
            Triggered By
          </TableColumn>
          <TableColumn key="runner_id" align="center">
            Runner
          </TableColumn>
          <TableColumn key="scheduled_at" align="center">
            Scheduled At
          </TableColumn>
          <TableColumn key="created_at" align="center">
            Created At
          </TableColumn>
          <TableColumn key="executed_at" align="center">
            Executed At
          </TableColumn>
          <TableColumn key="finished_at" align="center">
            Finished At
          </TableColumn>
          <TableColumn key="id" align="center">
            ID
          </TableColumn>
          <TableColumn key="actions" align="center">
            Actions
          </TableColumn>
        </TableHeader>
        <TableBody items={executions}>
          {(item: any) => (
            <TableRow key={item.id}>
              {(columnKey) => (
                <TableCell>{renderCell(item, columnKey)}</TableCell>
              )}
            </TableRow>
          )}
        </TableBody>
      </Table>

      <DeleteExecutionModal
        disclosure={deleteExecutionModal}
        execution={targetExecution}
      />
    </>
  );
}
