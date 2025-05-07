"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  Pagination,
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
import NumberFlow from "@number-flow/react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import ReactTimeago from "react-timeago";

import DeleteExecutionModal from "@/components/modals/executions/delete";
import {
  executionStatusCardBackgroundColor,
  executionStatusColor,
  executionStatuses,
  executionStatusIcon,
  executionStatusName,
  executionStatusWrapper,
} from "@/lib/functions/executionStyles";

export default function Executions({
  runners,
  executions,
  displayToFlow,
  canEdit,
}: any) {
  const router = useRouter();

  const deleteExecutionModal = useDisclosure();

  const [targetExecution, setTargetExecution] = useState({} as any);

  const [statusFilter, setStatusFilter] = useState(new Set([]) as any);

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 9;
  const items = React.useMemo(() => {
    const start = (page - 1) * rowsPerPage;
    const end = start + rowsPerPage;

    if (statusFilter.size > 0) {
      return executions
        .filter((execution: any) =>
          statusFilter.has(statusFilterReturn(execution)),
        )
        .slice(start, end);
    }

    return executions.slice(start, end);
  }, [page, executions, statusFilter]);

  function pages() {
    let length = 0;

    if (statusFilter.size > 0) {
      length =
        executions.filter((execution: any) =>
          statusFilter.has(statusFilterReturn(execution)),
        ).length / rowsPerPage;
    } else {
      length = executions.length / rowsPerPage;
    }

    return Math.ceil(length);
  }

  function statusFilterReturn(execution: any) {
    if (execution.status === "scheduled") {
      return "scheduled";
    } else if (execution.status === "pending") {
      return "pending";
    } else if (execution.status === "running") {
      return "running";
    } else if (execution.status === "paused") {
      return "paused";
    } else if (execution.status === "canceled") {
      return "canceled";
    } else if (execution.status === "noPatternMatch") {
      return "no_pattern_match";
    } else if (execution.status === "interactionWaiting") {
      return "interaction_waiting";
    } else if (execution.status === "error") {
      return "error";
    } else if (execution.status === "success") {
      return "success";
    } else if (execution.status === "recovered") {
      return "recovered";
    } else {
      return "unknown";
    }
  }

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
    }
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
                <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
              </span>
            ) : (
              <ReactTimeago live date={new Date(cellValue)} locale="de-DE" />
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

  const topContent = React.useMemo(() => {
    return (
      <div className="flex flex-wrap items-stretch gap-4">
        {executionStatuses().map((status: any) => {
          const count = executions.filter(
            (e: any) => e.status === status,
          ).length;

          if (count === 0) return null;

          return (
            <Card
              key={status}
              isHoverable
              isPressable
              className={
                statusFilter.has(status)
                  ? `w-[240px] grow bg-${executionStatusCardBackgroundColor({ status: status })}`
                  : "w-[240px] grow"
              }
              onPress={() => {
                if (statusFilter.has(status)) {
                  statusFilter.delete(status);
                  setStatusFilter(new Set(statusFilter));
                  setPage(1);
                } else {
                  statusFilter.add(status);
                  setStatusFilter(new Set(statusFilter));
                  setPage(1);
                }
              }}
            >
              <CardBody>
                <div className="flex items-center gap-2">
                  <div
                    className={`flex size-10 items-center justify-center rounded-small bg-${executionStatusColor({ status: status })}/20 text-${executionStatusColor({ status: status })}`}
                  >
                    <Icon
                      icon={executionStatusIcon({ status: status })}
                      width={24}
                    />
                  </div>
                  <div>
                    <p className="text-md font-bold">
                      <NumberFlow
                        locales="en-US" // Intl.NumberFormat locales
                        value={count}
                      />
                    </p>
                    <p className="text-sm text-default-500">
                      {executionStatusName({ status: status })}
                    </p>
                  </div>
                </div>
              </CardBody>
            </Card>
          );
        })}
      </div>
    );
  }, [executions, statusFilter]);

  return (
    <>
      <Table
        aria-label="Example table with custom cells"
        bottomContent={
          <div className="flex justify-center">
            <Pagination
              showControls
              isDisabled={items.length === 0}
              page={page}
              total={pages()}
              onChange={(page) => setPage(page)}
            />
          </div>
        }
        topContent={topContent}
        topContentPlacement="outside"
      >
        <TableHeader>
          <TableColumn key="status" align="start">
            Status
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
        <TableBody items={items}>
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
