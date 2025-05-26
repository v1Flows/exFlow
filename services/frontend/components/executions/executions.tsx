import {
  Badge,
  Button,
  ButtonGroup,
  Card,
  CardBody,
  Chip,
  Dropdown,
  DropdownItem,
  DropdownMenu,
  DropdownTrigger,
  Pagination,
  Spacer,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import { useExecutionsStyleStore } from "@/lib/functions/userExecutionsStyle";
import {
  executionStatusColor,
  executionStatuses,
  executionStatusIcon,
  executionStatusName,
} from "@/lib/functions/executionStyles";

import ExecutionsList from "./executionsList";
import ExecutionsTable from "./executionsTable";
import ExecutionsCompact from "./executionsCompact";

export default function Executions({
  runners,
  executions,
  displayToFlow,
  canEdit,
  flows,
}: any) {
  const router = useRouter();

  const { displayStyle, setDisplayStyle } = useExecutionsStyleStore();
  const [statusFilter, setStatusFilter] = useState(new Set([]) as any);

  // pagination
  const [page, setPage] = useState(1);
  const rowsPerPage =
    displayStyle === "list" ? 4 : displayStyle === "compact" ? 6 : 10;
  const items = useMemo(() => {
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
  }, [page, executions, statusFilter, displayStyle]);

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

  return (
    <Card>
      <CardBody className="p-0 h-full overflow-hidden">
        <div className="p-4 border-b border-default-100 flex flex-wrap gap-4 justify-between items-center">
          <div className="flex flex-wrap items-center gap-2">
            {executionStatuses().map((status: any) => {
              const count = executions.filter(
                (e: any) => e.status === status,
              ).length;

              if (count === 0) return null;

              return (
                <Badge
                  key={status}
                  color={executionStatusColor({ status: status })}
                  content={count}
                  showOutline={false}
                  size="md"
                  variant="solid"
                >
                  <Chip
                    color={
                      statusFilter.has(status)
                        ? executionStatusColor({ status: status })
                        : "default"
                    }
                    radius="sm"
                    size="md"
                    startContent={
                      <Icon
                        className={`text-${
                          statusFilter.has(status)
                            ? "default"
                            : executionStatusColor({ status: status })
                        }`}
                        icon={executionStatusIcon({ status: status })}
                        width={20}
                      />
                    }
                    variant={statusFilter.has(status) ? "solid" : "flat"}
                    onClick={() => {
                      if (statusFilter.has(status)) {
                        statusFilter.delete(status);
                        setStatusFilter(new Set(statusFilter));
                        // setPage(1);
                      } else {
                        statusFilter.add(status);
                        setStatusFilter(new Set(statusFilter));
                        // setPage(1);
                      }
                    }}
                  >
                    {executionStatusName({ status: status })}
                  </Chip>
                </Badge>
              );
            })}
          </div>
          <div className="flex gap-2">
            <Dropdown backdrop="blur">
              <DropdownTrigger>
                <Button
                  size="md"
                  startContent={
                    <Icon className="text-sm" icon="hugeicons:filter" />
                  }
                  variant="flat"
                >
                  Filter
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Multiple selection example"
                closeOnSelect={false}
                selectedKeys={statusFilter}
                selectionMode="multiple"
                variant="flat"
                onSelectionChange={setStatusFilter}
              >
                {executionStatuses().map((status: any) => {
                  return (
                    <DropdownItem
                      key={status}
                      startContent={
                        <Icon
                          className={`text-${executionStatusColor({
                            status: status,
                          })}`}
                          icon={executionStatusIcon({ status: status })}
                          width={20}
                        />
                      }
                    >
                      {executionStatusName({ status: status })}
                    </DropdownItem>
                  );
                })}
              </DropdownMenu>
            </Dropdown>

            <Button
              size="md"
              startContent={
                <Icon className="text-sm" icon="hugeicons:refresh" />
              }
              variant="flat"
              onPress={() => {
                router.refresh();
              }}
            >
              Refresh
            </Button>

            <ButtonGroup radius="sm" size="md">
              <Tooltip content="Compact View" placement="top">
                <Button
                  isIconOnly
                  startContent={
                    <Icon
                      icon="hugeicons:left-to-right-list-bullet"
                      width={17}
                    />
                  }
                  variant={displayStyle === "compact" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("compact");
                  }}
                />
              </Tooltip>
              <Tooltip content="List View" placement="top">
                <Button
                  isIconOnly
                  startContent={<Icon icon="hugeicons:task-01" width={17} />}
                  variant={displayStyle === "list" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("list");
                  }}
                />
              </Tooltip>
              <Tooltip content="Table View" placement="top">
                <Button
                  isIconOnly
                  startContent={
                    <Icon icon="hugeicons:layout-table-01" width={17} />
                  }
                  variant={displayStyle === "table" ? "solid" : "flat"}
                  onPress={() => {
                    setDisplayStyle("table");
                  }}
                />
              </Tooltip>
            </ButtonGroup>
          </div>
        </div>

        <Spacer y={2} />

        {displayStyle === "table" && (
          <ExecutionsTable
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            runners={runners}
          />
        )}

        {displayStyle === "list" && (
          <ExecutionsList
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            flows={flows}
            runners={runners}
          />
        )}

        {displayStyle === "compact" && (
          <ExecutionsCompact
            canEdit={canEdit}
            displayToFlow={displayToFlow}
            executions={items}
            flows={flows}
            runners={runners}
          />
        )}

        <div className="flex justify-center mt-4 mb-4">
          <Pagination
            showControls
            isDisabled={items.length === 0}
            page={page}
            total={pages()}
            onChange={(page) => setPage(page)}
          />
        </div>
      </CardBody>
    </Card>
  );
}
