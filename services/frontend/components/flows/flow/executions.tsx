"use client";

import { Icon } from "@iconify/react";
import {
  Button,
  Card,
  CardBody,
  CircularProgress,
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

export default function Executions({
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

  function status(execution: any) {
    if (execution.status === "pending") {
      return "Pending";
    } else if (execution.status === "running") {
      return "Running";
    } else if (execution.status === "paused") {
      return "Paused";
    } else if (execution.status === "canceled") {
      return "Canceled";
    } else if (execution.status === "noPatternMatch") {
      return "No Pattern Match";
    } else if (execution.status === "interactionWaiting") {
      return "Interaction Required";
    } else if (execution.status === "error") {
      return "Error";
    } else if (execution.status === "success") {
      return "Success";
    } else {
      return "Unknown";
    }
  }

  function statusFilterReturn(execution: any) {
    if (execution.status === "pending") {
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
    } else {
      return "unknown";
    }
  }

  function statusColor(execution: any) {
    if (execution.status === "pending") {
      return "default";
    } else if (execution.status === "running") {
      return "primary";
    } else if (execution.status === "paused") {
      return "warning";
    } else if (execution.status === "canceled") {
      return "danger";
    } else if (execution.status === "noPatternMatch") {
      return "secondary";
    } else if (execution.status === "interactionWaiting") {
      return "primary";
    } else if (execution.status === "error") {
      return "danger";
    } else if (execution.status === "success") {
      return "success";
    } else {
      return "default";
    }
  }

  function statusIcon(execution: any) {
    if (execution.status === "pending") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="default"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-default-500"
              icon="hugeicons:time-quarter-pass"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "running") {
      return <CircularProgress aria-label="Step" color="primary" size="md" />;
    } else if (execution.status === "paused") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="warning"
          size="md"
          value={100}
          valueLabel={
            <Icon className="text-warning" icon="hugeicons:pause" width={20} />
          }
        />
      );
    } else if (execution.status === "canceled") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="danger"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-danger"
              icon="hugeicons:cancel-01"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "noPatternMatch") {
      return (
        <CircularProgress
          showValueLabel
          color="secondary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-secondary"
              icon="hugeicons:note-remove"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "interactionWaiting") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="primary"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-primary"
              icon="hugeicons:waving-hand-01"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "error") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="danger"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-danger"
              icon="hugeicons:alert-02"
              width={20}
            />
          }
        />
      );
    } else if (execution.status === "success") {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="success"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-success"
              icon="hugeicons:tick-double-01"
              width={20}
            />
          }
        />
      );
    } else {
      return (
        <CircularProgress
          showValueLabel
          aria-label="Step"
          color="success"
          size="md"
          value={100}
          valueLabel={
            <Icon
              className="text-success"
              icon="solar:question-square-linear"
              width={22}
            />
          }
        />
      );
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
            {statusIcon(execution)}
            <div className="flex flex-col items-start">
              <p className={`font-bold text-${statusColor(execution)}`}>
                {status(execution)}
              </p>
              <p className="text-sm text-default-500">
                {getDuration(execution)}
              </p>
            </div>
          </div>
        );
      case "created_at":
        return (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
        );
      case "executed_at":
        return (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
        );
      case "finished_at":
        return (
          <Tooltip content={new Date(cellValue).toLocaleString()}>
            <ReactTimeago date={new Date(cellValue)} locale="de-DE" />
          </Tooltip>
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
            <Tooltip color="danger" content="Delete execution">
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
        {executions.filter((e: any) => status(e) == "Pending").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("pending")
                ? "w-[240px] grow bg-default/50"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("pending")) {
                statusFilter.delete("pending");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("pending");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-default/30 text-default-500">
                  <Icon icon="hugeicons:time-quarter-pass" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Pending")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Pending</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Success").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("success")
                ? "w-[240px] grow bg-success/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("success")) {
                statusFilter.delete("success");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("success");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-success/10 text-success">
                  <Icon icon="hugeicons:tick-double-01" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Success")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Success</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Running").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("running")
                ? "w-[240px] grow bg-primary/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("running")) {
                statusFilter.delete("running");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("running");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:play" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Running")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Running</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Paused").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("paused")
                ? "w-[240px] grow bg-warning/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("paused")) {
                statusFilter.delete("paused");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("paused");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-warning/10 text-warning">
                  <Icon icon="hugeicons:pause" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Paused")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Paused</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Interaction Required")
          .length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("interaction_waiting")
                ? "w-[240px] grow bg-primary/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("interaction_waiting")) {
                statusFilter.delete("interaction_waiting");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("interaction_waiting");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-primary/10 text-primary">
                  <Icon icon="hugeicons:waving-hand-01" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter(
                          (e: any) => status(e) == "Interaction Required",
                        ).length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">
                    Interaction Required
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "No Pattern Match").length >
          0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("no_pattern_match")
                ? "w-[240px] grow bg-secondary/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("no_pattern_match")) {
                statusFilter.delete("no_pattern_match");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("no_pattern_match");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-secondary/10 text-secondary">
                  <Icon icon="hugeicons:note-remove" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter(
                          (e: any) => status(e) == "No Pattern Match",
                        ).length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">No Pattern Match</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Canceled").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("canceled")
                ? "w-[240px] grow bg-danger/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("canceled")) {
                statusFilter.delete("canceled");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("canceled");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-danger/10 text-danger">
                  <Icon icon="hugeicons:cancel-01" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Canceled")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Canceled</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}

        {executions.filter((e: any) => status(e) == "Error").length > 0 && (
          <Card
            isHoverable
            isPressable
            className={
              statusFilter.has("error")
                ? "w-[240px] grow bg-danger/30"
                : "w-[240px] grow"
            }
            onPress={() => {
              if (statusFilter.has("error")) {
                statusFilter.delete("error");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              } else {
                statusFilter.add("error");
                setStatusFilter(new Set(statusFilter));
                setPage(1);
              }
            }}
          >
            <CardBody>
              <div className="flex items-center gap-2">
                <div className="flex size-10 items-center justify-center rounded-small bg-danger/10 text-danger">
                  <Icon icon="hugeicons:alert-02" width={20} />
                </div>
                <div>
                  <p className="text-md font-bold">
                    <NumberFlow
                      locales="en-US" // Intl.NumberFormat locales
                      value={
                        executions.filter((e: any) => status(e) == "Error")
                          .length
                      }
                    />
                  </p>
                  <p className="text-sm text-default-500">Error</p>
                </div>
              </div>
            </CardBody>
          </Card>
        )}
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
